# Codex Workflow

## Standard flow

1. 사용자 요청과 현재 작업 범위를 먼저 확인한다.
2. `npm run harness:preflight`를 실행한다.
3. 관련 코드와 프로젝트 문서를 읽는다.
4. 변경이 필요한 최소 범위를 정한다.
5. 동작 변경이면 테스트 또는 재현을 먼저 만든다.
6. 최소 구현으로 통과시킨다.
7. `npm run harness:verify`를 실행한다.
8. diff를 코드 규칙과 요청 범위 기준으로 자체 리뷰한다.
9. 논리적 변경 단위로 커밋한다.
10. push/PR을 요청받은 경우 커밋된 clean tree에서 `npm run harness:ready`를 실행한다.
11. readiness가 통과한 경우에만 push/PR을 수행하고, merge/deploy는 사용자가 요청한 경우에만 수행한다.

## Verification gate

`npm run harness:verify`는 Harness unit, 전체 contract suite, changed-file lint, FSD boundary, convention, `git diff --check`, production build를 하나의 gate로 실행한다.

각 verify step은 기본 600000ms(10분) timeout을 갖는다. 필요한 경우 `HARNESS_STEP_TIMEOUT_MS`로 조정할 수 있지만, timeout은 실패로 처리하며 다른 명령으로 우회해 완료로 판정하지 않는다.

## Scope ownership

특정 브랜치의 작업 범위나 일시적인 금지 영역은 영구 Harness 규칙으로 만들지 않는다.

예를 들어 특정 페이지 제외, 특정 기능만 재구성, 일회성 migration 순서 같은 조건은 해당 작업의 계획과 사용자 지시에서 관리한다.

## Project knowledge

현재 구조는 `docs/ARCHITECTURE.md`를 기준으로 한다.

API/기능 계약을 확인해야 하는 작업은 `docs/contracts/`의 관련 문서를 읽는다. 계약 변경은 사용자가 요청한 경우에만 수행한다.

## CI/CD ownership

기존 CI/CD 구성을 유지한다. Harness 전용 GitHub Actions workflow를 별도로 추가하지 않는다.

## Branch naming

- `feat/*`: 새 사용자 기능/UI
- `fix/*`: 버그 수정
- `refactor/*`: 구조 개선
- `test/*`: 테스트/contract 중심 변경
- `chore/*`: 설정, 문서, 유지보수

## Commit rule

커밋은 파일 수가 아니라 하나의 논리적 이유로 나눈다. 형식은 `type : English description`을 기본으로 한다.

## Pull request

PR 제목은 `<type> : <한국어 작업 설명>`을 사용한다. 본문은 `.github/pull_request_template.md`의 한국어 양식을 유지한다.

커밋은 작은 논리적 변경 단위로 유지하되, PR은 하나의 리뷰 가능한 목적 단위로 묶는다. 같은 기능 또는 같은 QA 목적의 연속된 작은 수정은 하나의 PR 안에서 여러 커밋으로 구성할 수 있고, 서로 독립적인 기능·버그 수정·리팩터링은 별도 PR로 분리한다.

PR 생성 전에는 `npm run harness:ready`가 성공해야 하며, readiness는 clean working tree와 base 대비 commit 존재 여부를 확인한 뒤 전체 `harness:verify`를 다시 실행한다.

모든 일반 작업 PR의 base/반영 브랜치는 `develop`으로 고정한다. `main` 직접 반영은 사용자가 release/hotfix 등으로 명시적으로 요청한 경우에만 허용한다.

## Branch cleanup

merge된 개인 작업 브랜치는 `npm run harness:branches`로 정리 후보를 확인한다. 기본 실행은 dry-run이며 `main`, `develop`, 현재 branch, 열린 PR head는 보호한다.
