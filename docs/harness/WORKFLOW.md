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

## Branch naming

- `feat/*`: 새 사용자 기능/UI
- `fix/*`: 버그 수정
- `refactor/*`: 구조 개선 또는 FSD migration
- `refactor/teacher-fsd*`: Teacher behavior-preserving FSD migration 전용
- `test/*`: 테스트/contract 중심 변경
- `chore/*`: 하네스, CI, 설정, 문서

## Commit rule

커밋은 파일 수가 아니라 하나의 논리적 이유로 나눈다. 형식은 `type : English description`을 기본으로 한다.

예: `refactor : migrate consultation feature to fsd`

## Pull request

PR 제목은 `<type> : <한국어 작업 설명>`을 사용한다. 본문은 `.github/pull_request_template.md`의 한국어 섹션을 그대로 유지한다.
