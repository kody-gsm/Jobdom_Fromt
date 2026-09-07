# Frontend Code Quality Refactor Design

## Goal

Keep all current Jobdam frontend behavior and API contracts while making the TypeScript, Tailwind CSS, and FSD architecture more maintainable, type-safe, and resistant to regression.

## Scope

- Frontend repository only.
- No backend production code changes.
- No intentional UI/UX behavior changes.
- Preserve student, teacher, and admin routes and API contracts.
- Preserve the current main brand color `#02C551` and visual appearance.
- Use TDD/contract tests and the existing harness for every production change.

## Current Findings

- TypeScript uses `strict: true` and avoids `any`, but some runtime values are forced into narrow unions with assertions.
- Tailwind v4 is configured, but repeated fixed hex values are used as arbitrary values across many files.
- Pretendard font styling is repeated with inline `style` props instead of being a Tailwind theme token.
- The current FSD checker validates alias imports but ignores relative imports that cross layer boundaries.
- The existing 17-step harness does not run repository-wide `tsc --noEmit`, so contract-test type drift can survive while runtime contracts pass.
- Several page-level components contain feature/model responsibilities and have grown too large.
## Tailwind Design

Use Tailwind v4 `@theme` as the single source for repeated design tokens. This is Tailwind configuration, not a return to component CSS classes.

Initial semantic tokens:

```css
@theme {
  --color-brand: #02C551;
  --color-brand-hover: #02A946;
  --color-ink: #13233A;
  --color-muted: #8A95A3;
  --color-surface: #F4F6F8;
  --color-border: #DDE2E7;
  --font-sans: "Pretendard Variable", Pretendard, Arial, Helvetica, sans-serif;
}
```

Repeated fixed values migrate to utilities such as `bg-brand`, `text-ink`, `text-muted`, `bg-surface`, and `border-border`.

Keep arbitrary values when they represent genuinely unique layout math or dynamic behavior, such as `lg:grid-cols-[minmax(0,1fr)_520px]` or calculated inline `top` values.

Keep CSS where CSS is the correct abstraction, especially browser-specific autofill selectors and reduced-motion behavior.
## TypeScript Design

- Replace duplicated consultation teacher state (`selectedTeacher` plus `selectedTeacherId`) with one server-backed teacher object where possible.
- Remove the hardcoded `ConsultationTeacher` assertion path for dynamically returned teacher names.
- Keep narrow unions where the backend contract itself is finite, such as reservation states and form statuses.
- Consolidate consultation schedule metadata so display time and start-time policy derive from one source of truth.
- Add a repository typecheck command and make the harness run it.
- Fix all currently failing TypeScript contract fixtures rather than weakening production types.

## FSD Design

- Keep the existing layer order: `shared -> entities -> features -> widgets -> pages -> app`.
- Preserve slice public APIs (`index.ts`) for cross-slice imports.
- Upgrade the boundary checker so relative imports are resolved to real target files and checked with the same layer/public-API rules as `@fsd/*` imports.
- Refactor oversized page components only where responsibilities are mixed; do not perform broad churn for file-size aesthetics alone.
- Page components should primarily compose widgets/features, while reusable behavior and domain state move to model/feature/widget slices.

## Component Refactor Priorities

1. Consultation model: teacher state and schedule source of truth.
2. Teacher page: calendar/schedule calculation and consultation presentation split into focused units.
3. Teacher forms/recruit pages: extract repeated editors/status/presentation helpers where this reduces mixed responsibilities.
4. Shared UI: prefer the newer `ActionButton`/field primitives and avoid creating a third component family.
## Verification and Acceptance

The refactor is complete only when all of the following are true:

- Existing user-visible behavior and route/API contracts remain unchanged.
- Backend working tree has zero modified files.
- Tailwind semantic tokens replace repeated core brand/surface/text/border hex values in touched frontend areas.
- No new CSS component classes are introduced for styling that Tailwind utilities already express well.
- `npm run typecheck` passes repository-wide.
- FSD boundary tests cover alias and relative import violations.
- Existing FSD/convention checks pass.
- Existing contract suite passes.
- ESLint passes with no new warnings in changed files.
- Next.js production build passes.
- Full harness passes after each committed batch and again after the final commit.

## Non-Goals

- No backend API redesign.
- No visual redesign.
- No new framework or styling dependency.
- No wholesale rewrite of every teacher/admin component.
- No performance micro-optimization without evidence of a real rendering/network bottleneck.
