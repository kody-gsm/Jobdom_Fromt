# Frontend Architecture — Feature-Sliced Design

## Migration matrix

### Backend / API contract

최우선 보호 대상이다. endpoint, method, request/response meaning, auth/session/reissue semantics를 유지한다.

### Student frontend

사용자 기능과 API contract를 보존한다. FSD 구조 정리 단계에서는 layer/slice/segment ownership을 정리한다. 사용자가 새 디자인을 전달한 뒤에는 기존 기능과 API/session 로직을 재사용하면서 UI, 함수, 컴포넌트, hook, state 구조를 새 디자인에 맞춰 재구성할 수 있다.

### Teacher / Admin

Teacher와 Admin도 FSD 구조 정리 대상이다. 다만 기존 기능, UI 의미, business rule을 보존하며 layer/slice/segment로 파일과 책임을 이동하는 structural migration만 수행한다. Student 디자인 재구성 단계에서는 Teacher/Admin 코드를 수정하지 않는다.

## FSD root

Next.js의 `app`/`pages` 예약 구조와 FSD layer 이름 충돌을 피하기 위해 framework routing은 root `app/`에 유지하고 FSD는 `src/fsd/` 아래에 둔다.

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

Dependency direction is:

```text
app → pages → widgets → features → entities → shared
```

상위 layer만 하위 layer를 import할 수 있다. 같은 layer의 서로 다른 slice를 직접 import하지 않는다.

## Slices and segments

`pages`, `widgets`, `features`, `entities`는 business 의미의 slice로 나눈다. slice 이름은 kebab-case를 사용한다.

필요한 segment만 만든다.

- `ui`: React UI
- `model`: state, domain rule, types
- `api`: domain endpoint
- `lib`: slice 전용 pure helper
- `config`: slice 전용 configuration

폴더 모양을 맞추기 위해 빈 segment를 미리 만들지 않는다.

## Public API

slice 외부에서는 `index.ts` public API만 사용한다. cross-layer import는 `@fsd/*` alias를 사용하며 다른 slice 내부 경로로 deep import하지 않는다.

같은 slice 내부에서는 상대경로 import를 허용한다. `shared`에 Jobdam 고유 business rule을 넣지 않는다.

## Next.js route adapters

Migration이 끝난 route의 root `app/**/page.tsx`는 FSD page public API를 import하고 render하는 adapter 역할만 한다. validation, state machine, payload mapping, 직접 fetch를 route file에 두지 않는다.

예:

```tsx
import { ConsultationPage } from "@fsd/pages/consultation";

export default function Page() {
  return <ConsultationPage />;
}
```

Teacher/Admin route는 structural migration 이후에도 behavior-preserving adapter 역할만 유지한다.

## Migration order

1. shared foundation
2. entities
3. auth / home
4. consultation
5. recruit
6. forms
7. profile
8. Teacher/Admin behavior-preserving FSD migration
9. legacy cleanup
10. 사용자가 새 디자인을 전달한 뒤 Student 페이지 재구성

10단계에서는 Teacher/Admin 보호 경로를 수정하지 않는다.
