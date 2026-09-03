# Function Design Rules

## Goal

함수 개수를 늘리는 것이 목적이 아니다. 각 함수가 왜 존재하는지, 무엇을 책임지는지, 어디에 속하는지, 어떤 side effect를 가지는지 예측 가능한 코드를 만든다.

## 1. Extract by responsibility, not line count

함수를 추출하기 전에 답한다.

1. 이 코드가 표현하는 하나의 책임은 무엇인가?
2. 별도 이름을 붙이면 호출부의 의도가 더 명확해지는가?
3. 독립적으로 검증해야 하는 비즈니스 규칙인가?
4. 단지 파일이나 함수 길이를 줄이려는 추출은 아닌가?
5. 실제로 같이 변경되는 코드인가?

JSX가 길다는 이유, 코드가 3줄 이상이라는 이유, 언젠가 재사용될 것 같다는 이유만으로 추출하지 않는다.

## 2. One responsibility

한 함수에 validation, mapping, API, storage, navigation을 동시에 넣지 않는다.

```text
UI event
  → domain validation
  → request mapping
  → API side effect
  → UI feedback/navigation
```

각 단계가 복잡하거나 독립 규칙을 가지면 별도 책임으로 분리한다.
## 3. Separate UI event from domain logic

`handleSubmit`, `handleClick`, `handleChange`는 UI와 로직을 연결하는 얇은 함수로 유지한다.

Bad:

```ts
const handleSubmit = async () => {
  if (!title.trim()) return;
  if (hasCareerReservation) return;
  const payload = { title: title.trim(), date: formatDate(date) };
  await fetch("/backend/student/course", { method: "POST", body: JSON.stringify(payload) });
};
```

Better:

```ts
const handleSubmit = async () => {
  const validation = validateConsultation(form, reservations);
  if (!validation.valid) return showValidationError(validation);
  await createConsultation(createConsultationRequest(form));
};
```

## 4. Prefer pure domain functions

계산, 필터링, validation, mapping은 가능하면 같은 입력에 같은 출력을 주고 외부 상태를 변경하지 않는 pure function으로 만든다. API, storage, navigation, React state 변경은 side effect 경계로 분리한다.
## 5. Name by intent

피한다: `processData`, `handleStuff`, `helper`, `commonUtil`, `convert`, `check`.

선호한다:

- 조회: `get...`, `find...`, `select...`
- 판단: `is...`, `has...`, `can...`, `should...`
- 검증: `validate...`
- 변환: `to...`, `map...`, `normalize...`, `format...`, `create...Request`
- side effect: `save...`, `submit...`, `create...`, `update...`, `delete...`, `request...`

Boolean 함수는 질문처럼 읽혀야 한다.

```ts
if (!canApplyCareerConsultation(consultations)) return;
```

## 6. Make dependencies explicit

함수는 필요한 값만 전달받는다. 전체 page state, global object, DOM을 몰래 읽지 않는다.

Bad: `validateConsultation(pageState)`

Better: `validateConsultation(form, existingConsultations)`

인자가 많고 하나의 의미 있는 입력을 구성한다면 객체 parameter를 사용한다. 인자 1~2개가 명확한 경우에는 억지 객체화를 하지 않는다.
## 7. Return meaningful results

검증 실패 이유가 중요하면 boolean 하나로 정보를 버리지 않는다.

```ts
type ValidationResult =
  | { valid: true }
  | { valid: false; code: "TITLE_REQUIRED" | "DATE_REQUIRED" | "PERIOD_REQUIRED" };
```

비즈니스 판단은 code를 반환하고 사용자 메시지 표현은 UI 계층에서 결정할 수 있게 한다.

## 8. Do not hide side effects

`get...`, `find...`, `format...` 같은 이름의 함수가 navigation, storage write, API mutation을 몰래 수행하면 안 된다. 함수 이름과 실제 행동이 일치해야 한다.

에러를 특별한 이유 없이 `catch {}` 또는 `.catch(() => undefined)`로 삼키지 않는다. 의도적으로 무시해야 한다면 호출부나 주석에서 그 이유가 보여야 한다.

## 9. Avoid wrong abstractions

중복 코드를 발견했다고 즉시 `shared`로 옮기지 않는다.

```text
중복 발견
  → 같은 비즈니스 의미인가?
  → 앞으로 같은 이유로 변경되는가?
  → 둘 다 YES일 때만 공통화 검토
```

약간의 읽기 쉬운 중복은 잘못된 공통화보다 낫다.
## 10. Place functions by ownership

- entity 자체의 domain rule/type: `src/fsd/entities/<entity>/model`
- 사용자 행동의 rule/state: `src/fsd/features/<feature>/model`
- domain endpoint: owning entity/feature의 `api` segment
- React state/lifecycle 캡슐화: owning slice의 `model` 또는 UI hook
- 특정 component만 쓰는 작은 UI handler: component 내부
- domain-independent 기반 유틸: `src/fsd/shared/lib`

모든 함수를 `utils.ts` 하나에 넣지 않는다.

## 11. Custom hooks are React boundaries

Custom hook은 단순 함수 모음이 아니다. React state, effect, memoization, lifecycle을 하나의 feature 책임으로 묶을 때 사용한다.

`useConsultationUtils()`처럼 format, API, toast, random helper를 한데 섞지 않는다. Pure domain logic은 hook 밖으로 둔다.

## 12. Keep abstraction levels consistent

하나의 함수 안에서 고수준 domain 호출과 저수준 문자열 조립, 직접 fetch, navigation이 뒤섞이지 않게 한다. 호출부는 위에서 아래로 의도가 읽혀야 한다.

```ts
const validation = validateConsultation(form);
if (!validation.valid) return showValidationError(validation);
const request = createConsultationRequest(form);
await createConsultation(request);
```

## 13. Prefer guard clauses

깊은 중첩 조건문보다 실패 조건을 먼저 반환해 핵심 흐름을 평평하게 유지한다.
## 14. Function length is a signal, not a target

`10줄 이하` 같은 기계적 제한은 두지 않는다. 대신 다음은 분리 신호다.

- 설명에 `그리고`가 반복된다.
- 여러 상태를 서로 다른 이유로 변경한다.
- validation + mapping + API + UI feedback이 같이 있다.
- 조건문 중첩 때문에 핵심 흐름이 보이지 않는다.
- 테스트하려면 React/DOM/API를 모두 준비해야 한다.

## 15. Comments explain why

함수 이름과 코드가 이미 말하는 WHAT을 반복하지 않는다. API 제약, 브라우저 특성, 호환성, 비즈니스 규칙처럼 코드만 보고 알기 어려운 WHY를 설명한다.

## 16. Minimize mutation

입력 객체를 직접 수정하기보다 새 값을 반환하는 방식을 기본으로 한다. 숨은 mutation은 호출부의 예측 가능성을 떨어뜨린다.

## 17. Design for testing

React와 무관한 규칙은 component 밖으로 꺼내 입력/출력만으로 테스트할 수 있게 한다. DOM query나 global state를 함수 내부에서 직접 읽는 방식은 피한다.

## 18. Review every changed function

새 함수나 크게 변경한 함수는 완료 전에 아래 질문으로 다시 본다.
### Responsibility

- 정확히 하나의 책임을 가지는가?
- 함수가 없어지면 어떤 의도가 다시 호출부에 흩어지는가?

### Naming

- 이름만 보고 역할과 side effect를 예상할 수 있는가?
- `process`, `helper`, `common`, `data`, `stuff`에 기대고 있지 않은가?

### Abstraction

- 실제 같은 의미를 공유해서 공통화한 것인가?
- 단순 중복 제거 또는 미래 재사용 예상 때문에 추출한 것은 아닌가?

### Dependency and side effects

- 불필요하게 큰 state/object를 받지 않는가?
- API, storage, navigation, state 변경이 숨겨져 있지 않은가?

### Placement and testability

- 정말 `shared`에 속하는가, 아니면 feature 내부 책임인가?
- React/DOM 없이 테스트 가능한 로직을 UI 안에 묶어두지 않았는가?

## Final principle

좋은 함수는 단순히 짧은 함수가 아니다. 존재 이유, 책임, 입력, 출력, side effect, 소유 feature, 변경 영향 범위를 코드에서 예측할 수 있는 함수다.