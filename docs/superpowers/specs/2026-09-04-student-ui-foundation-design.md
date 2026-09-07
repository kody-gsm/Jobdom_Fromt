# Student UI Foundation Design

## Goal

Student 프론트를 새 디자인 기준으로 다시 만들기 위한 공통 UI 기반을 만든다.
API 계약과 인증 계약은 유지하고, Teacher/Admin 화면과 동작은 변경하지 않는다.

## Scope

이번 foundation에서는 새 Student 화면들이 공통으로 사용할 UI primitive와 Student header만 추가한다.
기존 Student 페이지를 새 디자인으로 교체하는 작업은 후속 PR에서 진행한다.

## Hard constraints

- `src/fsd/pages/teacher*`, `src/fsd/pages/admin` 실제 화면 소스는 수정하지 않는다.
- Teacher/Admin이 사용하는 기존 component의 동작이나 스타일을 바꾸지 않는다.
- API endpoint, method, request/response shape를 변경하지 않는다.
- 기존 Student 화면도 foundation PR만으로 강제 변경하지 않는다.
- 새 공통화는 실제 반복이 확인된 UI만 대상으로 한다.
- 함수/컴포넌트는 존재 이유와 책임을 설명할 수 있어야 한다.
## Components

### ActionButton

- 공통 CTA 버튼을 표현한다.
- `primary`, `secondary`, `ghost` 정도의 실제 필요한 variant만 제공한다.
- 문자열 전용 `content` prop 대신 `children`을 사용한다.
- 상태/비즈니스 로직은 갖지 않는다.

### TextField / TextAreaField

- label, 입력 영역, error message를 하나의 접근 가능한 form control로 묶는다.
- 값과 변경 상태는 부모가 소유하는 controlled component를 기본으로 한다.
- validation 규칙은 포함하지 않는다.

### SegmentedTabs

- 상담 종류 등 서로 배타적인 화면 상태 선택에 사용한다.
- 내부 선택 state를 만들지 않고 `value`와 `onChange`를 받는다.
- 선택 가능한 값은 호출부가 전달한다.

### ContentCard

- 대시보드 카드와 상담 panel의 공통 surface 역할만 담당한다.
- 데이터 로딩, 클릭 동작, 도메인 상태는 소유하지 않는다.
### StudentHeader

- dashboard, 상담 신청, 공고, 폼, 프로필에서 재사용하는 Student 전용 navigation widget이다.
- 로고, 주요 Student route, 프로필, 로그아웃 진입점을 제공한다.
- Teacher/Admin route에서는 사용하지 않는다.
- 로그아웃 API 세부 구현은 기존 `features/logout`을 재사용한다.

## Styling

- 기존 global `body`/font 규칙은 Teacher/Admin에 영향이 갈 수 있으므로 수정하지 않는다.
- Student widget/page가 필요한 범위에서 Pretendard를 적용한다.
- 기존 `Button`, `Input`은 foundation에서 수정하지 않는다.
- 새 디자인 primitive를 별도 추가하고 후속 Student PR이 점진적으로 채택한다.

## Verification

- 새 primitive public API contract test를 추가한다.
- Teacher/Admin source diff가 0인지 검증한다.
- FSD boundary/convention 검사를 통과해야 한다.
- production build를 통과해야 한다.
- API contract test가 그대로 통과해야 한다.

## Scope enforcement

Teacher/Admin freeze is verified at PR time with VCS diff. It is intentionally not encoded as a permanent Harness rule or long-lived architecture constraint.
