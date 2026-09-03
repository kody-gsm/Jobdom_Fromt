# Jobdam Codex Guide

## Mission

Teacher 페이지와 Backend API 계약을 보존하면서 나머지 프론트엔드를 기능 동일성 기준으로 재구축한다.

## Before editing

1. `docs/harness/ARCHITECTURE.md`를 읽는다.
2. `docs/harness/WORKFLOW.md`를 읽는다.
3. 함수 변경 시 `docs/harness/FUNCTION_RULES.md`를 읽는다.
4. API 관련 변경 시 `docs/harness/API_CONTRACT.md`를 확인한다.
5. `npm run harness:preflight`를 실행한다.
6. 관련 기존 코드와 회귀 검사를 먼저 읽는다.

## Hard rules

- `app/teacher/**`는 사용자 명시 승인 없이 수정하지 않는다.
- Backend endpoint, HTTP method, payload, auth contract를 임의 변경하지 않는다.
- 기존 사용자 기능을 리팩터링 과정에서 삭제하거나 의미를 바꾸지 않는다.
- `page.tsx`에 비즈니스 로직과 API 로직을 다시 집중시키지 않는다.
- 함수는 줄 수 감소가 아니라 책임과 의도를 기준으로 추출한다.
- 이유 없는 shared abstraction과 generic helper를 만들지 않는다.
- 실패한 검증을 숨기거나 무시하지 않는다.
- `npm run harness:verify` 실패 상태에서 작업 완료를 선언하지 않는다.
- push, PR 생성, merge, deploy는 사용자의 명시적 요청이 있을 때만 수행한다.

## Git

작업은 목적별 브랜치와 논리적 단위 커밋으로 나눈다. PR은 `.github/pull_request_template.md`의 한국어 양식을 그대로 사용한다.