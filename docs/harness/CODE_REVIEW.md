# Code Review Rules

## Review order

1. Correctness: 요청한 동작을 정확히 구현했는가?
2. Regression: 기존 feature contract가 깨지지 않았는가?
3. API: endpoint/method/payload/auth/session 의미를 그대로 유지했는가?
4. Migration mode: Student rebuild인지 Teacher structural migration인지 범위가 맞는가?
5. FSD boundary: layer 방향, slice ownership, public API가 맞는가?
6. Function design: 함수 책임과 존재 이유가 명확한가?
7. Code convention: naming, TypeScript, React, import, error 규칙을 지켰는가?
8. Side effects: API/storage/navigation/state 변경이 숨겨져 있지 않은가?
9. Dead code: debug 출력, 임시 코드, 사용하지 않는 abstraction이 없는가?

## FSD review

- root `app/**/page.tsx`가 migration 이후 route adapter 수준으로 얇은가?
- `app > pages > widgets > features > entities > shared` 방향을 위반하지 않는가?
- 같은 layer의 다른 slice를 직접 import하지 않는가?
- 다른 slice 내부 파일을 deep import하지 않고 public API를 사용하는가?
- Jobdam domain rule을 `shared`로 밀어 넣지 않았는가?
- feature와 entity의 ownership이 action vs domain concept 기준으로 구분되는가?

## Teacher review

Teacher migration PR에서는 UI redesign, business rule 변경, API 변경을 Blocker로 본다. 파일 split/move와 import/public API 정리 외의 rewrite는 migration에 꼭 필요한지 근거를 확인한다.

## Function design review

- 이름만 읽어도 도메인 의도와 side effect를 예상할 수 있는가?
- 함수 설명에 `그리고`가 반복될 정도로 책임이 섞이지 않았는가?
- UI event와 business rule이 분리되어 있는가?
- pure logic과 side effect가 분리되어 있는가?
- 실제 같은 의미가 아닌 코드를 억지로 shared로 공통화하지 않았는가?
- 큰 page state나 전역 상태에 불필요하게 의존하지 않는가?
- React/DOM 없이 테스트할 수 있는 규칙이 component 안에 묶여 있지 않은가?

## Severity

- Blocker: 기능/API/Teacher 보존/FSD 보호 경계 위반
- Major: 잘못된 ownership, 구조 위반, 회귀 가능성, wrong abstraction
- Minor: 이름, 가독성, 작은 중복 등 비차단 개선

Blocker 또는 Major가 남아 있으면 merge 후보로 표시하지 않는다.
