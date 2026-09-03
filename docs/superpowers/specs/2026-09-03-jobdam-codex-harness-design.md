# Jobdam Codex Harness Design

## Goal

Teacher 페이지와 기존 Backend API 계약을 보호하면서, Codex가 나머지 프론트엔드를 점진적으로 재구축할 수 있는 개발 하네스를 만든다.

## Scope

- Codex 전용 저장소 규칙을 `AGENTS.md`로 제공한다.
- 기존 기능과 API 계약을 변경 금지 경계로 둔다.
- 함수 설계, 리팩터링, 코드리뷰, Git/PR 규칙을 문서화한다.
- 작업 시작 전 preflight와 완료 전 verify를 자동화한다.
- 기존 CI/CD 구성은 중복 생성하거나 대체하지 않는다.
- Teacher 페이지는 보호 경로로 취급한다.

## Non-goals

- Teacher 페이지 리팩터링
- Backend API 변경
- 자동 merge 또는 자동 deploy
- Claude/Gemini 등 다중 에이전트 orchestration
- 새로운 상태관리/폼/API 라이브러리 도입
## Architecture

`AGENTS.md`는 짧은 진입점이며 상세 규칙은 `docs/harness/`에 둔다. 검증은 `scripts/harness/`와 `npm run harness:verify`로 제공한다. 기존 CI/CD가 필요하면 이 명령을 호출할 수 있지만 하네스가 별도 workflow를 만들지는 않는다. 기존 `scripts/*-check.ts` 회귀 검사는 유지하고 하네스에서 명시적으로 연결한다.

## Required rules

- `develop`에서 직접 구현하지 않는다.
- Teacher 관련 경로는 명시적 승인 없이 수정하지 않는다.
- API endpoint, method, payload, auth contract는 명시적 승인 없이 수정하지 않는다.
- 함수는 책임과 존재 이유가 명확해야 하며 잘못된 공통화를 피한다.
- UI event, domain rule, data mapping, side effect/API를 구분한다.
- 검증 실패 상태에서 완료를 선언하지 않는다.
- push, PR 생성, merge는 사용자의 명시적 요청이 있을 때만 수행한다.

## Pull request contract

PR 본문은 사용자가 지정한 한국어 템플릿을 그대로 사용한다. 제목은 `<type> : <한국어 작업 설명>` 형식을 사용하고, 본문 섹션을 임의로 영문화하거나 재배열하지 않는다.

## Verification

`harness:verify`는 최소한 lint, API contract, form contract, 기존 regression checks, Next.js build를 검증한다. 기존 CI/CD에서 사용하려면 이 단일 명령을 연결하고, 별도 하네스 workflow는 추가하지 않는다. 변경 범위 검사는 Teacher 보호 경로를 별도로 확인한다.