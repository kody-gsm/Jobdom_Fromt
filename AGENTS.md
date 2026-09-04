# Jobdam Codex Guide

## Mission

현재 Jobdam 구조와 사용자 기능을 이해한 뒤, 요청 범위 안에서 안전하게 변경한다. Harness는 작업 방식과 검증 기준만 정의하고 일회성 작업 범위는 사용자 지시와 작업 계획에서 관리한다.

## Before editing

1. `docs/ARCHITECTURE.md`에서 현재 frontend 구조를 확인한다.
2. `docs/harness/CODE_CONVENTION.md`를 읽는다.
3. `docs/harness/WORKFLOW.md`를 읽는다.
4. API나 기존 기능을 건드리면 `docs/contracts/`의 관련 문서를 확인한다.
5. `npm run harness:preflight`를 실행한다.
6. 관련 코드와 기존 테스트를 먼저 읽는다.

## Hard rules

- 사용자 요청에 없는 endpoint, HTTP method, payload, auth/session contract를 임의 변경하지 않는다.
- 현재 `src/fsd` 구조와 public API/import 규칙을 따른다.
- 이유 없는 shared abstraction과 unrelated refactoring을 만들지 않는다.
- 동작 변경은 관련 테스트 또는 재현 근거를 먼저 확보한다.
- 실패한 검증을 숨기거나 무시하지 않는다.
- `npm run harness:verify` 실패 상태에서 작업 완료를 선언하지 않는다.
- 기존 CI/CD를 유지하며 Harness 전용 GitHub Actions workflow를 추가하지 않는다.
- 일반 작업 PR의 base는 항상 `develop`을 사용한다. `main` 직접 반영은 사용자가 명시적으로 요청한 release/hotfix에만 허용한다.
- push, PR 생성, merge, deploy는 사용자의 명시적 요청이 있을 때만 수행한다.
