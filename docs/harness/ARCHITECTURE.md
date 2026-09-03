# Frontend Architecture

## Boundary

`app/teacher/**`는 legacy 영역으로 유지한다. 나머지 프론트엔드는 feature-based architecture로 점진 이관한다.

## Target structure

```text
app/                 # route와 layout, 조립만
features/
  auth/
  consultation/
  recruit/
  forms/
  profile/
shared/
  api/
  ui/
  hooks/
  lib/
  types/
```

## Dependency direction

Route → Feature UI → Feature hook/model → Feature API → Shared API client 순서를 기본으로 한다. `shared`는 특정 feature의 비즈니스 규칙을 알면 안 된다.

## Placement rule

- 한 feature에서만 쓰는 로직: `features/<feature>`
- 여러 feature가 같은 의미로 쓰는 UI/기반 코드: `shared`
- Next.js routing/layout 책임: `app`
- 기존 Teacher 구현: 이동하거나 정리하지 않는다.