# Codex Workflow

## Standard flow

1. 사용자 요청이 Student rebuild인지 Teacher migration인지 분류한다.
2. `npm run harness:preflight`를 실행한다.
3. 관련 기능 코드, API contract, regression check를 읽는다.
4. FSD ownership(layer/slice/segment)을 먼저 정한다.
5. 테스트 또는 contract check를 먼저 추가하고 실패를 확인한다.
6. 최소 구현으로 통과시킨다.
7. `npm run harness:verify`를 실행한다.
8. FSD boundary/function design/code convention 기준으로 diff를 자체 리뷰한다.
9. 논리적 변경 단위로 커밋한다.
10. 사용자가 요청한 경우에만 push/PR/merge를 수행한다.

## Student rebuild

기존 화면 코드를 그대로 옮기는 것이 목표가 아니다. 사용자 기능과 API contract를 characterization한 뒤 FSD 기준으로 UI/함수/state/component를 새로 설계할 수 있다.

## Teacher migration

Teacher migration은 `refactor/teacher-fsd*` branch 또는 명시적 migration mode에서만 한다. 구현 전에 현재 Teacher 동작에 대한 characterization/regression을 추가하고 RED/GREEN이 아니라 **기존 동작을 고정하는 baseline test**임을 명확히 기록한다.

Teacher에서 redesign이나 business rewrite가 필요해 보이면 현재 migration PR에 섞지 않고 별도 승인 대상으로 분리한다.

## CI/CD ownership

기존 CI/CD 구성을 유지한다. 하네스는 별도 GitHub Actions workflow를 만들지 않고 `npm run harness:verify`라는 검증 진입점만 제공한다. 기존 CI/CD에 검증 연결이 필요하면 기존 pipeline 안에서 이 명령을 호출하도록 수정한다.

## Branch naming

- `feat/*`: 새 사용자 기능/UI
- `fix/*`: 버그 수정
- `refactor/*`: 구조 개선 또는 FSD migration
- `refactor/teacher-fsd*`: Teacher behavior-preserving FSD migration 전용
- `test/*`: 테스트/contract 중심 변경
- `chore/*`: 하네스, 설정, 문서

## Commit rule

커밋은 파일 수가 아니라 하나의 논리적 이유로 나눈다. 형식은 `type : English description`을 기본으로 한다.

예: `refactor : migrate consultation feature to fsd`

## Pull request

PR 제목은 `<type> : <한국어 작업 설명>`을 사용한다. 본문은 `.github/pull_request_template.md`의 한국어 섹션을 그대로 유지한다.

## Merged branch cleanup

작업이 끝나 `origin/develop`에 merge된 브랜치는 `npm run harness:branches`로 정리 후보를 확인한다.

- 기본 실행은 dry-run이며 브랜치를 삭제하지 않는다.
- `npm run harness:branches -- --apply`는 merge 완료된 로컬 브랜치만 삭제한다.
- `npm run harness:branches -- --apply --remote`는 로컬 후보와 `origin/*` 원격 후보를 함께 삭제한다.
- `main`, `develop`, 현재 checkout 브랜치, 열린 PR의 head 브랜치는 항상 보호한다.
- `legacy-origin/*`은 cleanup 대상에 포함하지 않는다.
- 열린 PR 조회에 실패하면 삭제를 진행하지 않는 fail-closed 방식을 사용한다.
- merge 판정 기준은 `origin/develop`이며 강제 삭제(`git branch -D`)는 사용하지 않는다.
- cleanup 후보는 branch tip 작성자 이메일이 현재 `git config user.email`과 일치하는 브랜치로 제한한다.
- branch tip 작성자 이메일을 확인할 수 없거나 현재 Git identity와 다르면 삭제 후보에서 제외한다.
