# Code Review Rules

## Review order

1. Correctness: 요청한 동작을 정확히 구현했는가?
2. Regression: 기존 기능 계약이 깨지지 않았는가?
3. Scope: 작업 범위 밖 파일을 수정하지 않았는가?
4. API: Backend 계약을 그대로 유지했는가?
5. Architecture: route/UI/domain/API 경계가 적절한가?
6. Function design: 함수 책임과 존재 이유가 명확한가?
7. Type safety: 불필요한 `any`, 강제 캐스팅, 모호한 타입이 없는가?
8. Side effects: API/storage/navigation/state 변경이 숨겨져 있지 않은가?
9. Dead code: 임시 코드, debug 출력, 사용하지 않는 추상화가 없는가?

## Function design review

새 함수와 크게 변경된 함수는 다음을 별도로 확인한다.

- 이름만 읽어도 도메인 의도가 보이는가?
- 함수 설명에 `그리고`가 반복될 정도로 책임이 섞이지 않았는가?
- UI event와 business rule이 분리되어 있는가?
- pure logic과 side effect가 분리되어 있는가?
- 실제 같은 의미가 아닌 코드를 억지로 shared로 공통화하지 않았는가?
- 큰 page state나 전역 상태에 불필요하게 의존하지 않는가?
- React/DOM 없이 테스트할 수 있는 규칙이 component 안에 묶여 있지 않은가?

## Severity

- Blocker: 기능/API/보호 경로/데이터 손상 위험
- Major: 구조 위반, 회귀 가능성, 잘못된 추상화
- Minor: 이름, 가독성, 작은 중복 등 비차단 개선

Blocker 또는 Major가 남아 있으면 merge 후보로 표시하지 않는다.