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

### 환경 변수·설정 분리

- 조작: 제출물의 `.env.example`이 플레이스홀더로 구성되어 있는지 확인한다. 실행 환경에만 실제 설정을 입력한 `.env`를 생성하고 Expo 서버를 다시 시작한 후 서버 저장·조회를 수행한다.
- 기대 결과: 실제 키·비밀번호가 소스에 포함되지 않으며, 실행 환경의 설정으로 Supabase에 연결된다. 앱 데이터와 캡처에는 시험용 데이터만 표시된다.
- 스크린샷: 01_device1_saved.png, 10_supabase_row.png, 11_supabase_state.png

시험 데이터: `hooks/useTodos.ts`의 초기 빈 목록에 `개발하기`(업무), `오프라인 테스트`(기타)를 시험일 날짜로 입력한다. 프로필은 기본 닉네임 `나`와 기본 아바타를 사용한다. 실명·연락처·실제 인물 사진은 사용하지 않는다. 데이터 형식은 `utils/storageSchema.ts`에 정의되어 있다.

네트워크: 서버 저장·조회와 두 기기 동기화는 온라인에서 확인한다. 오프라인 작성은 앱 번들을 먼저 불러온 뒤 실제 인터넷 연결을 차단하여 확인하고, 온라인 복귀 후 서버 반영을 확인한다. 시뮬레이터 상태 표시줄 아이콘 변경만으로는 인터넷 연결이 차단되지 않는다.
