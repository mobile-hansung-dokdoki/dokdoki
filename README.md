# 똑똑이 — 2109 MP3 서버 동기화

## 실행 절차

- 프레임워크·SDK: Expo SDK 58 (`expo` 58.0.23), React Native 0.88.1, React 19.3.0
- 실행 환경: Node.js 24.x, npm, macOS 및 Xcode
- 실행 기기: iOS 27.0 Simulator `device1`, `device2` 두 대, SDK 58을 지원하는 Expo Go
- 백엔드: 두 기기에서 같은 Supabase 프로젝트 사용

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행한다.
2. 저장소 루트에서 환경 변수 예제 파일을 복사한다.

```sh
cp .env.example .env
```

3. `.env`의 `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 해당 프로젝트의 URL과 Publishable key를 입력한다. 실제 `.env`는 제출하지 않으며, 비밀 키나 DB 비밀번호는 사용하지 않는다.
4. 저장소 루트에서 다음 명령을 실행한다.

```sh
npm ci
npx expo start --clear
```

5. Xcode Device Hub에서 `device1`, `device2`를 부팅한다. Expo 터미널의 `i` 또는 `Shift+i`로 기기를 선택하여 두 기기에서 같은 앱을 연다. 환경 변수를 변경하면 Expo 서버를 다시 시작한다.

## BaaS 선택

이 프로젝트는 **Supabase**를 BaaS(Backend as a Service)로 사용한다. 별도 API 서버를 구축하지 않고 `@supabase/supabase-js`로 데이터를 저장·조회할 수 있고, PostgreSQL의 JSONB 컬럼에 기존 `TodoState` 구조를 그대로 보관할 수 있어 두 기기의 할 일 목록을 공유하는 과제에 적합하다. SQL로 테이블과 RLS(Row Level Security) 정책을 함께 정의할 수 있어 `supabase/schema.sql`로 백엔드 구성을 재현할 수 있다.

- 연결: `utils/supabase.ts`에서 환경 변수로 클라이언트를 생성한다.
- 저장·조회: `utils/sharedSync.ts`에서 `shared_todo_state` 테이블의 `id = 'dokdoki-shared'` 행을 `upsert`·`select`한다.
- 동기화 범위: `version`, `todos`, `categories`를 포함하는 전체 `TodoState`이다. 데이터 구조와 검증은 `utils/storageSchema.ts`에 정의되어 있다. 프로필·사진은 기기에만 저장하며 서버 동기화 대상이 아니다.
- 인증: 현재 앱은 로그인 없이 `anon` 역할로 하나의 과제용 목록을 공유한다. 모든 기기는 같은 Supabase 프로젝트와 같은 행을 사용한다.

## 충돌 처리

### 전체 스냅샷 덮어쓰기 정책

현재 구현은 **서버에 마지막으로 성공 반영된 전체 스냅샷이 남는 방식**이다. `utils/sharedSync.ts`의 `pushSharedSnapshot()`이 고정 ID `dokdoki-shared`로 `upsert`하므로 동일한 행이 있으면 `state` 전체를 교체한다. 할 일별 병합, 버전 비교, 충돌 선택 화면은 구현되어 있지 않다. 할 일의 `updatedAt`과 서버 행의 `updated_at`은 기록용이며 충돌 승자를 결정하는 비교에 사용하지 않는다. 따라서 기기에서 수정한 시각보다 서버에 쓰기가 반영되는 순서가 결과를 결정한다.

예를 들어 두 기기가 같은 목록을 받은 뒤 각각 오프라인에서 같은 할 일의 제목을 `기기1 수정`, `기기2 수정`으로 바꾼다. 기기1의 업로드가 완료된 후 기기2의 업로드가 완료되면 서버에는 기기2의 전체 목록이 남는다. 이후 대기 중인 로컬 변경이 없는 기기1에서 새로고침하면 기기2의 목록을 받는다. 서로 다른 할 일을 수정해도 전체 스냅샷을 덮어쓰므로 먼저 업로드한 기기의 변경이 사라질 수 있다. 삭제도 별도 삭제 기록을 병합하지 않으므로 다른 기기의 오래된 목록이 나중에 업로드되면 삭제한 항목이 다시 나타날 수 있다.

### 오프라인 대기 및 동기화 중 추가 수정

`hooks/useTodos.ts`와 `utils/sharedSync.ts`에서 다음과 같이 처리한다.

1. 변경 사항은 AsyncStorage의 `dokdoki.todos.v1`에 저장하고, 업로드 대기 스냅샷은 `dokdoki.todos.sync-outbox.v1`에 저장한다. 대기열은 개별 작업 이력 대신 최신 전체 스냅샷을 보관하며, 스냅샷 쓰기는 순서대로 처리한다.
2. 동기화 시 대기 스냅샷이 있으면 서버에 먼저 업로드한 뒤 서버 상태를 조회한다. 연결이 끊겼거나 요청이 실패하면 로컬 데이터와 대기 스냅샷을 유지한다.
3. 앱의 로컬 데이터 로딩 완료, 로컬 변경의 대기열 저장 완료, 네트워크 복구, 앱 활성화, 홈 목록의 당겨서 새로고침 시 동기화를 시도한다. Supabase Realtime 구독이나 주기적 폴링은 사용하지 않는다.
4. 같은 앱에서 진행 중인 동기화 작업을 재사용하고, 업로드 완료 후 대기 스냅샷의 토큰이 일치할 때만 해당 대기 항목을 지우도록 한다. 업로드 중 새 수정이 생기면 로컬 수정 번호와 남은 대기 항목을 확인하여 추가 전송한다. 서버 조회 결과도 조회 시작 이후 로컬 수정이 없고 대기 항목이 없을 때 적용한다.

위 처리는 같은 기기에서 전송 중 생긴 수정을 보호하기 위한 것으로, 두 기기 사이의 동시 편집을 병합하거나 변경 손실을 방지하는 기능은 아니다. 과제의 저장·조회 검증은 한 기기의 ‘동기화 완료’를 확인한 뒤 다른 기기에서 새로고침하는 순서로 수행한다.

## 백엔드 설정

### Supabase 프로젝트와 테이블

1. Supabase 프로젝트를 생성하거나 사용할 프로젝트를 준비한다. 두 기기 모두 이 프로젝트에 연결한다.
2. 프로젝트의 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 실행한다. 이 파일은 `public.shared_todo_state` 테이블, 갱신 시각 트리거, RLS 정책 및 `anon` 역할의 접근 권한을 만든다.
3. Table Editor에서 다음 컬럼을 확인한다. `dokdoki-shared` 행은 앱에서 최초 업로드 시 생성되므로 미리 삽입할 필요가 없다.

| 컬럼 | 자료형·제약 | 용도 |
| --- | --- | --- |
| `id` | `text`, 기본 키, 값은 `dokdoki-shared`로 제한 | 두 기기가 공유하는 고정 행 ID |
| `state` | `jsonb`, NOT NULL | `{ version: 1, todos: [...], categories: [...] }` 형태의 전체 목록 |
| `updated_at` | `timestamptz`, NOT NULL, 기본값 `now()` | 서버 저장 시각. 행 갱신 시 트리거로 갱신 |

SQL은 RLS를 활성화하고 `anon` 역할에 고정 공유 행의 `SELECT`, `INSERT`, `UPDATE`만 허용한다. 앱에서 할 일을 삭제할 때는 SQL `DELETE` 대신 해당 항목을 제외한 `state`를 업로드한다. 현재 정책은 로그인하지 않은 클라이언트가 공유 행을 읽고 수정할 수 있는 과제용 구성으로, 사용자별 데이터 분리는 제공하지 않는다. 시험용 데이터만 사용한다.

### 환경 변수와 앱 연결

프로젝트의 URL과 Publishable key를 확인한 뒤 저장소 루트에서 `.env.example`을 `.env`로 복사하고 아래 두 값을 설정한다.

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

- 두 기기는 같은 URL과 키를 사용한다. 환경 변수 변경 후에는 `npx expo start --clear`로 Expo 서버를 다시 시작한다.
- `EXPO_PUBLIC_` 값은 앱에 포함되므로 Publishable key만 사용하며, `service_role` 키·비밀 키·DB 비밀번호를 넣지 않는다. 실제 접근 범위는 위 RLS 정책으로 제한한다.
- `.env`는 `.gitignore`에서 제외하고 플레이스홀더만 담은 `.env.example`을 제출한다.
- 두 환경 변수 중 하나라도 비어 있으면 Supabase 클라이언트를 만들지 않고 ‘동기화 확인 필요’ 상태가 표시된다. 값이 있어도 연결·권한 오류가 발생하면 같은 오류 상태가 표시되므로 URL·키, SQL 실행 여부, 네트워크를 확인한다.
- 설정 후 기기1에서 할 일을 추가하고 ‘동기화 완료’를 확인한다. Table Editor에서 `dokdoki-shared` 행의 `state`를 확인한 다음 기기2의 홈 목록을 당겨 같은 데이터가 나타나는지 확인한다. 구체적인 조작과 기대 결과는 아래 ‘확인 방법’을 따른다.

## 확인 방법

### BaaS 저장·조회

- 조작: `device1`의 `+` 버튼으로 제목 `개발하기`, 카테고리 `업무`, 오늘 날짜의 할 일을 저장한다. ‘동기화 완료’를 확인한 후 Supabase Table Editor에서 `shared_todo_state` 테이블을 새로고침하고 `dokdoki-shared` 행의 `state`를 연다.
- 기대 결과: 앱 목록과 서버 JSON에 동일한 제목·카테고리의 할 일이 표시된다. 서버 테이블에는 `id`, `state`, `updated_at` 필드가 존재한다.
- 스크린샷: 01_device1_saved.png, 09_supabase_schema.png, 10_supabase_row.png, 11_supabase_state.png

### 두 기기 동기화

- 조작: 두 기기를 온라인으로 실행한다. `device1`에서 `개발하기`를 저장하고 ‘동기화 완료’를 확인한 뒤, `device2`의 홈 목록을 아래로 당겨 새로고침한다.
- 기대 결과: `device2`에도 `개발하기`가 표시되고 ‘동기화 완료’ 상태가 나타난다.
- 스크린샷: 01_device1_saved.png, 02_device2_before_refresh.png, 03_device2_after_refresh.png

### 오프라인 작성·온라인 반영

- 조작: 앱 번들을 불러온 상태에서 두 기기의 인터넷 연결을 차단한다. `device1`에서 제목 `오프라인 테스트`, 카테고리 `기타`, 오늘 날짜의 할 일을 저장한다. 인터넷 연결을 복구하고 `device1`의 ‘동기화 완료’를 확인한 뒤 `device2`의 홈 목록과 Supabase 테이블을 새로고침한다.
- 기대 결과: 연결 차단 중에도 새 할 일이 기기에 저장되고 ‘오프라인 · 기기에 저장됨’이 표시된다. 연결 복구 후 `device2`와 서버 JSON에도 `오프라인 테스트`가 반영된다.
- 스크린샷: 04_device1_offline.png, 05_device2_offline.png, 06_device1_offline_created.png, 07_device1_reconnected.png, 08_device2_reconnected.png, 11_supabase_state.png

### 충돌 처리 확인

아래는 전체 스냅샷 덮어쓰기 정책을 확인하는 추가 수동 검증 절차이다.

- 조작: 두 기기를 새로고침하여 같은 할 일을 받은 뒤, 앱 번들이 로딩된 상태에서 두 기기의 인터넷 연결을 차단한다. 같은 할 일의 제목을 기기1에서는 `기기1 수정`, 기기2에서는 `기기2 수정`으로 바꾼다. 기기1만 연결을 복구하여 ‘동기화 완료’를 확인하고, 그다음 기기2의 연결을 복구하여 ‘동기화 완료’를 확인한다. 마지막으로 기기1의 홈 목록을 당겨 새로고침한다.
- 기대 결과: 서버 `state`와 두 기기에서 해당 제목이 `기기2 수정`으로 표시된다. 이는 기기2의 스냅샷이 서버에 나중에 반영되었기 때문이다. 검증 중에는 다른 할 일을 추가·수정하지 않는다.

### 환경 변수·설정 분리

- 조작: 제출물의 `.env.example`이 플레이스홀더로 구성되어 있는지 확인한다. 실행 환경에만 실제 설정을 입력한 `.env`를 생성하고 Expo 서버를 다시 시작한 후 서버 저장·조회를 수행한다.
- 기대 결과: 실제 키·비밀번호가 소스에 포함되지 않으며, 실행 환경의 설정으로 Supabase에 연결된다. 앱 데이터와 캡처에는 시험용 데이터만 표시된다.
- 스크린샷: 01_device1_saved.png, 10_supabase_row.png, 11_supabase_state.png

시험 데이터: `hooks/useTodos.ts`의 초기 빈 목록에 `개발하기`(업무), `오프라인 테스트`(기타)를 시험일 날짜로 입력한다. 프로필은 기본 닉네임 `나`와 기본 아바타를 사용한다. 실명·연락처·실제 인물 사진은 사용하지 않는다. 데이터 형식은 `utils/storageSchema.ts`에 정의되어 있다.

네트워크: 서버 저장·조회와 두 기기 동기화는 온라인에서 확인한다. 오프라인 작성은 앱 번들을 먼저 불러온 뒤 실제 인터넷 연결을 차단하여 확인하고, 온라인 복귀 후 서버 반영을 확인한다. 시뮬레이터 상태 표시줄 아이콘 변경만으로는 인터넷 연결이 차단되지 않는다.
