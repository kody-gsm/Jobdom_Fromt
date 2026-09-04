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
10. 사용자가 요청한 경우에만 push/PR/merge/deploy를 수행한다.

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

모든 일반 작업 PR의 base/반영 브랜치는 `develop`으로 고정한다. `main` 직접 반영은 사용자가 release/hotfix 등으로 명시적으로 요청한 경우에만 허용한다.

## Branch cleanup

merge된 개인 작업 브랜치는 `npm run harness:branches`로 정리 후보를 확인한다. 기본 실행은 dry-run이며 `main`, `develop`, 현재 branch, 열린 PR head는 보호한다.
