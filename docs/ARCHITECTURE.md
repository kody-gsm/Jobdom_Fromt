# Frontend Architecture — Feature-Sliced Design

Jobdom frontend는 Next.js App Router와 Feature-Sliced Design(FSD)을 함께 사용한다.

## FSD root

Next.js routing은 root `app/`에 두고, 실제 frontend 구현은 `src/fsd/` 아래에서 관리한다.

```text
app/                         # Next.js route adapters
src/fsd/
  app/                       # providers, global config
  pages/                     # router-ready screens
  widgets/                   # large independent UI blocks
  features/                  # user actions
  entities/                  # domain concepts
  shared/                    # domain-independent foundation
```

## Layer dependency

Dependency direction:

```text
app → pages → widgets → features → entities → shared
```

상위 layer만 하위 layer를 import할 수 있다. 같은 layer의 서로 다른 slice를 직접 import하지 않는다.

## Slices and segments

`pages`, `widgets`, `features`, `entities`는 business 의미의 slice로 나눈다.

필요한 segment만 만든다.

- `ui`: React UI
- `model`: state, domain rule, types
- `api`: domain endpoint
- `lib`: slice 전용 pure helper
- `config`: slice 전용 configuration

빈 segment를 폴더 모양만 맞추려고 만들지 않는다.

## Public API

slice 외부에서는 `index.ts` public API를 사용한다. cross-layer import는 `@fsd/*` alias를 사용하며 다른 slice 내부 경로로 deep import하지 않는다.

같은 slice 내부 구현끼리는 상대경로를 사용할 수 있다. `shared`에는 특정 business rule을 넣지 않는다.

## Next.js route adapters

root `app/**/page.tsx`는 가능한 한 FSD page public API를 import하고 render하는 얇은 route adapter로 유지한다.

validation, state machine, payload mapping, 직접 fetch 같은 구현 책임은 route file에 두지 않는다.

```tsx
import { ConsultationPage } from "@fsd/pages/consultation";

export default function Page() {
  return <ConsultationPage />;
}
```
