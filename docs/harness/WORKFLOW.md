# Codex Workflow

## Standard flow

1. 사용자 요청과 변경 금지 범위를 확인한다.
2. `npm run harness:preflight`를 실행한다.
3. 관련 기능 코드, API 계약, 기존 regression check를 읽는다.
4. 한 목적의 작은 변경 단위로 계획한다.
5. 테스트 또는 contract check를 먼저 추가하고 실패를 확인한다.
6. 최소 구현으로 통과시킨다.
7. `npm run harness:verify`를 실행한다.
8. 변경 파일과 `git diff`를 자체 리뷰한다.
9. 논리적 변경 단위로 커밋한다.
10. 사용자가 요청한 경우에만 push/PR/merge를 수행한다.

## Branch naming

- `feat/*`: 사용자 기능 추가 또는 새 UI
- `fix/*`: 버그 수정
- `refactor/*`: 기능 동일성을 유지하는 구조 개선
- `test/*`: 테스트/계약 검사 중심 변경
- `chore/*`: 하네스, CI, 설정, 문서

## Commit rule

커밋은 파일 수가 아니라 하나의 논리적 이유로 나눈다. 형식은 `type : English description`을 기본으로 한다.

예: `refactor : split consultation api module`

## Pull request

PR 제목은 `<type> : <한국어 작업 설명>`을 사용한다. 본문은 `.github/pull_request_template.md`의 한국어 섹션을 그대로 유지한다.