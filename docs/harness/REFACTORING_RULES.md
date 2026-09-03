# Refactoring Rules

## Student frontend rebuild

Student 영역은 사용자 기능과 Backend/API contract를 유지하는 조건으로 내부를 재작성할 수 있다.

허용:
- 디자인 전면 변경
- component/hook/state 구조 재설계
- 함수와 타입 재작성
- FSD layer/slice/segment로 재배치
- legacy component 제거
- 테스트 가능한 domain logic으로 재구성

금지:
- endpoint/method/payload/auth/session semantics 변경
- 사용자 기능 삭제
- business rule을 근거 없이 변경
- 새 상태관리/API/폼 라이브러리의 무근거 도입

## Teacher migration

Teacher는 rebuild 대상이 아니라 behavior-preserving structural migration 대상이다.

허용:
- 파일 split/move
- FSD layer/slice/segment 배치
- import/export와 public API 정리
- 구조 이동에 필요한 최소 타입/함수 signature 수정

기본 금지:
- UI redesign
- business rule 변경
- API contract 변경
- migration과 무관한 함수 rewrite

## Migration rule

화면/feature 하나씩 contract를 먼저 고정하고 새 FSD 구현이 동일 기능을 만족한 뒤 legacy 구현을 제거한다. Teacher migration은 characterization/regression을 먼저 추가한 뒤 수행한다.

## Scope rule

한 PR에 여러 독립 feature를 섞지 않는다. 발견한 무관한 문제는 별도 작업 후보로 남긴다.
