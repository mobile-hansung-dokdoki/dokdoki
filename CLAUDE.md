@AGENTS.md

# 똑똑이 할 일 앱 — 하네스 포인터

## 자연어 라우팅
- "개발 시작" / "다음 단계" / "어디까지 했어?" → `todo-orchestrator` 스킬 사용
- "구현해줘" / "코드 써줘" / "화면 만들어줘" → `developer` 에이전트 사용
- "코드 리뷰해줘" / "PR 검토해줘" / "머지해도 돼?" → `reviewer` 에이전트 사용 (code_review.md 기준)
- "테스트 써줘" / "AC 검증해줘" → `tester` 에이전트 사용
- "PRD 만들어줘" / "PRD 업데이트해줘" → `prd-generator` 스킬 사용
- "티켓 만들어줘" / "이슈 뽑아줘" → `ticket-creator` 스킬 사용

## 하네스 구조
- 에이전트: `.claude/agents/` (developer, reviewer, tester)
- 스킬: `.claude/skills/` (todo-orchestrator, prd-generator, ticket-creator)
- 산출물: `artifacts/` (constitution → PRD → TechSpec → Tasks → Tickets)
- 코드 리뷰 기준: `code_review.md`
- **UI 디자인 규칙: `artifacts/UIDesignSpec.md`** ← 컴포넌트 작성 전 반드시 읽기

## 개발 단계 (MP)
| 단계 | 범위 | 상태 |
|------|------|------|
| MP1 | 화면 + 상태 관리 | 진행 중 |
| MP2 | 저장 + CRUD + 필터 | 대기 |
| MP3 | 백엔드 동기화 | 대기 |
| MP4 | 온디바이스 OCR | 대기 |

## 변경 이력
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-09-10 | 초기 하네스 구성 | 전체 | Agentic_AI_Generator.md |
