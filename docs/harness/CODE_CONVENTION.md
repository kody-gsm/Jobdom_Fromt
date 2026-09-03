# Code Convention

## Naming

- FSD slice directory: kebab-case (`submit-consultation`, `recruit-application`).
- FSD segment directory: `ui`, `model`, `api`, `lib`, `config` 중 필요한 것만 사용한다.
- React component/file: `PascalCase` / `PascalCase.tsx`.
- React hook/file: `useSomething` / `useSomething.ts`.
- function/variable: camelCase.
- boolean: `is`, `has`, `can`, `should` prefix를 우선한다.
- 실제 불변 설정 상수만 `UPPER_SNAKE_CASE`를 사용한다.
- `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts` 같은 generic dump file을 만들지 않는다.

## TypeScript

- `strict`를 전제로 작성한다.
- 새 FSD 코드에서 `any`를 사용하지 않는다. 외부 경계는 `unknown`으로 받고 좁힌다.
- 무근거 `as` assertion으로 타입 오류를 숨기지 않는다.
- object contract는 `type`을 기본으로 한다. declaration merging/명시적 확장 계약이 필요한 경우만 `interface`를 사용한다.
- discriminated union으로 상태와 validation result를 표현하는 것을 선호한다.
- type-only dependency는 `import type`을 사용한다.

## React

- root `app/**/page.tsx`는 route adapter로 유지한다.
- business rule, validation, API payload mapping을 React component 안에 직접 묶지 않는다.
- `useEffect`는 외부 시스템 동기화에 사용하고 derived state 계산용으로 사용하지 않는다.
- `'use client'`는 event, browser API, client hook이 필요한 경계에만 둔다.
- component props가 계속 늘어나면 props grouping보다 component responsibility부터 재검토한다.
- 조건부 UI는 읽기 쉬운 early return을 우선하고 중첩 ternary를 사용하지 않는다.

## Imports and FSD

- cross-layer/cross-slice import는 `@fsd/*` alias를 사용한다.
- 같은 slice 내부 구현끼리는 상대경로를 사용할 수 있다.
- slice 외부에서는 반드시 slice `index.ts` public API를 통해 import한다.
- 같은 layer의 다른 slice를 직접 import하지 않는다.
- 상위 layer가 하위 layer만 import할 수 있다.
- wildcard `export *`보다 의도적인 named export를 선호한다.

## API and side effects

- HTTP client/reissue/error parsing 같은 transport 책임은 `shared/api`에 둔다.
- domain endpoint는 owning `entities/*/api` 또는 `features/*/api`에 둔다.
- 새 FSD 코드에서 `api` segment 밖의 직접 `fetch`를 금지한다.
- 조회처럼 보이는 함수가 navigation/storage/API mutation을 숨기지 않는다.

## Errors and logging

- 빈 `catch {}`로 오류를 숨기지 않는다.
- `.catch(() => undefined)`는 의도적 무시 이유가 명확한 경우만 허용한다.
- 사용자 메시지와 domain/API error를 분리한다.
- commit되는 코드에 `console.log`를 남기지 않는다. 필요한 operational logging은 목적이 드러나는 별도 경계를 사용한다.

## Functions

함수 추출, naming, pure logic, side effect, abstraction 기준은 `FUNCTION_RULES.md`를 우선한다. 코드 줄 수보다 책임과 존재 이유를 기준으로 판단한다.
