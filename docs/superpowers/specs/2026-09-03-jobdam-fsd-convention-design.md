# Jobdam FSD & Code Convention Design

## Goal

Jobdam 프론트엔드의 최종 구조를 Feature-Sliced Design(FSD)로 고정하고, Codex가 동일한 코드 컨벤션과 migration 정책을 따르도록 하네스에서 검증한다.

## Migration policy

프로젝트를 세 가지 보호 수준으로 나눈다.

1. Backend/API contract: endpoint, method, payload, auth/session 의미를 보존한다.
2. Teacher: 기존 기능·디자인·비즈니스 동작을 보존하고 FSD 구조로만 이전한다.
3. Student frontend: 사용자 기능과 API contract는 보존하되 UI, 함수, 컴포넌트, 상태 구조와 내부 구현은 재작성할 수 있다.

Teacher migration은 `refactor/teacher-fsd*` 브랜치 또는 명시적 migration mode에서만 허용한다.

## FSD root

Next.js App Router와 FSD `pages` layer의 이름 충돌을 피하기 위해 framework route는 root `app/`에 유지하고 실제 FSD 코드는 `src/fsd/`에 둔다.

```text
app/                # Next.js route adapters only
src/fsd/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

## Layer responsibilities

Layer dependency order is `app > pages > widgets > features > entities > shared`.

- `shared`: application-domain independent UI, API client, generic lib/config/types.
- `entities`: user, consultation, recruit, form 같은 도메인 개념.
- `features`: login, logout, submit-consultation 같은 사용자 행동.
- `widgets`: 하위 layer를 조합한 독립적인 큰 UI 블록.
- `pages`: router에 연결 가능한 전체 화면 조립.
- `app`: provider, global config와 애플리케이션 초기화.

`entities/features/widgets/pages`는 slice 단위로 나누고 필요한 경우 `ui`, `model`, `api`, `lib`, `config` segment를 사용한다.

## Dependency rules

- 상위 layer만 하위 layer를 import한다.
- 같은 layer의 서로 다른 slice를 직접 import하지 않는다.
- slice 밖에서 내부 파일을 deep import하지 않고 slice `index.ts` public API를 사용한다.
- 같은 slice 내부에서는 상대경로 import를 허용한다.
- `shared`에는 Jobdam 고유 business rule을 넣지 않는다.
- entity cross-import가 필요하면 우선 모델 경계를 재검토하며 임의 예외를 만들지 않는다.

Cross-layer import에는 `@fsd/* -> ./src/fsd/*` alias를 사용한다.

## Route adapter rule

root `app/**/page.tsx`는 routing adapter다. 상태, validation, 직접 fetch, business rule을 넣지 않고 FSD page public API를 import하여 render하는 수준으로 유지한다.

Teacher는 migration 완료 전까지 legacy route implementation을 허용하지만, migration 시에도 사용자 동작과 디자인을 바꾸지 않는다.

## Code convention

- slice/segment directory: kebab-case slice names, fixed segment names.
- React component file/name: `PascalCase.tsx` / `PascalCase`.
- hook: `useSomething.ts` / `useSomething`.
- function/variable: camelCase; boolean은 `is/has/can/should` prefix.
- constant: 실제 불변 설정값만 `UPPER_SNAKE_CASE`.
- type은 기본 `type`; declaration merging/확장 계약이 명확할 때만 `interface`.
- `any`, 무근거 type assertion, 빈 `catch {}`, 중첩 ternary, commit된 `console.log`를 새 FSD 코드에서 금지한다.
- `useEffect`를 derived-state 계산용으로 사용하지 않는다.
- `'use client'`는 browser API, event, React client hook이 필요한 경계에만 둔다.
- API mechanics는 `shared/api`, domain endpoint는 owning entity/feature `api` segment에 둔다.
- 직접 `fetch`는 FSD의 `api` segment 밖에서 사용하지 않는다.
- `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts` 같은 generic dump file을 만들지 않는다.
- 함수 설계 세부 규칙은 `FUNCTION_RULES.md`를 따른다.

## Automated enforcement

Harness는 다음을 자동 검증한다.

- `CODE_CONVENTION.md`와 FSD architecture 문서가 존재하는지 확인한다.
- `@fsd/*` alias가 설정되어 있는지 확인한다.
- FSD layer 방향, same-layer cross-slice import, public API deep import 위반을 검사한다.
- FSD 경로/segment/name 기본 규칙과 generic dump file을 검사한다.
- Teacher 수정은 일반 branch에서 차단하고 teacher migration mode에서만 허용한다.
- 기존 API/form/regression/build gate는 유지한다.

## Migration order

Shared foundation → Entities → Auth/Home → Consultation → Recruit → Forms → Profile → Teacher behavior-preserving migration → legacy cleanup 순으로 진행한다.
