# Jobdam Codex Guide

## Mission

Backend/API contract와 사용자 기능을 보존하면서 frontend 전체를 FSD 구조로 유지한다. Teacher/Admin은 구조 migration만 허용하고, 사용자가 새 디자인을 전달한 뒤의 페이지 재구성은 Student 영역만 수행한다.

## Before editing

1. `docs/harness/ARCHITECTURE.md`를 읽는다.
2. `docs/harness/CODE_CONVENTION.md`를 읽는다.
3. `docs/harness/WORKFLOW.md`를 읽는다.
4. `docs/harness/FRONTEND_CONTRACT_MAP.md`에서 현재 기능 계약을 확인한다.
5. 함수 변경 시 `docs/harness/FUNCTION_RULES.md`를 읽는다.
6. API 관련 변경 시 `docs/harness/API_CONTRACT.md`를 확인한다.
7. `npm run harness:preflight`를 실행한다.
8. 관련 기존 코드와 regression check를 먼저 읽는다.

## Hard rules

- Backend endpoint, HTTP method, payload, auth/session contract를 임의 변경하지 않는다.
- FSD 구조 정리는 Student와 Teacher/Admin을 포함한 전체 frontend에서 수행할 수 있다.
- 사용자가 새 디자인을 전달한 뒤의 UI/페이지 재구성은 Student 영역만 수행하며 기존 기능/API/session 계약을 재사용한다.
- Teacher/Admin은 FSD migration 외의 UI redesign, 함수 rewrite, business rewrite를 하지 않는다.
- Teacher/Admin 구조 migration은 전용 migration mode에서만 수행한다.
- Teacher/Admin 보호 범위에는 `app/teacher/**`, `app/admin/**`, `src/fsd/pages/teacher*/**`, `src/fsd/pages/admin/**`가 포함된다.
- 공용 `entities/features/shared`를 수정할 때는 Teacher/Admin의 기존 동작과 API 계약을 깨지 않는지 관련 regression/characterization으로 확인한다.
- 새 구조는 `src/fsd`의 FSD layer 규칙을 따른다.
- root `app/**/page.tsx`는 가능한 한 얇은 route adapter로 유지한다.
- FSD cross-layer import는 `@fsd/*` public API를 사용한다.
- 이유 없는 shared abstraction과 generic helper를 만들지 않는다.
- 실패한 검증을 숨기거나 무시하지 않는다.
- `npm run harness:verify` 실패 상태에서 작업 완료를 선언하지 않는다.
- 기존 CI/CD를 유지하며 `.github/workflows/harness.yml` 같은 중복 하네스 workflow를 추가하지 않는다.
- push, PR 생성, merge, deploy는 사용자의 명시적 요청이 있을 때만 수행한다.

## Git

작업은 목적별 브랜치와 논리적 단위 커밋으로 나눈다. PR은 `.github/pull_request_template.md`의 한국어 양식을 그대로 사용한다.
