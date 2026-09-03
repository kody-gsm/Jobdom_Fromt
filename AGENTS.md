# Jobdam Codex Guide

## Mission

Backend/API contract와 사용자 기능을 보존하면서 Student frontend를 FSD로 재구축한다. Teacher는 기능·디자인·business behavior를 유지하고 FSD 구조로만 이전한다.

## Before editing

1. `docs/harness/ARCHITECTURE.md`를 읽는다.
2. `docs/harness/CODE_CONVENTION.md`를 읽는다.
3. `docs/harness/WORKFLOW.md`를 읽는다.
4. 함수 변경 시 `docs/harness/FUNCTION_RULES.md`를 읽는다.
5. API 관련 변경 시 `docs/harness/API_CONTRACT.md`를 확인한다.
6. `npm run harness:preflight`를 실행한다.
7. 관련 기존 코드와 regression check를 먼저 읽는다.

## Hard rules

- Backend endpoint, HTTP method, payload, auth/session contract를 임의 변경하지 않는다.
- Student frontend는 기능을 유지하면 UI, 함수, 컴포넌트, 상태 구조를 재작성할 수 있다.
- Teacher는 FSD migration 외의 redesign/business rewrite를 하지 않는다.
- Teacher migration은 전용 migration mode에서만 수행한다.
- 새 구조는 `src/fsd`의 FSD layer 규칙을 따른다.
- root `app/**/page.tsx`는 가능한 한 얇은 route adapter로 유지한다.
- FSD cross-layer import는 `@fsd/*` public API를 사용한다.
- 이유 없는 shared abstraction과 generic helper를 만들지 않는다.
- 실패한 검증을 숨기거나 무시하지 않는다.
- `npm run harness:verify` 실패 상태에서 작업 완료를 선언하지 않는다.
- push, PR 생성, merge, deploy는 사용자의 명시적 요청이 있을 때만 수행한다.

## Git

작업은 목적별 브랜치와 논리적 단위 커밋으로 나눈다. PR은 `.github/pull_request_template.md`의 한국어 양식을 그대로 사용한다.
