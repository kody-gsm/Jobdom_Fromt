# Frontend Code Quality Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Jobdam frontend's TypeScript safety, Tailwind v4 design-system usage, and FSD enforcement without changing existing behavior or backend contracts.

**Architecture:** Keep the current FSD layer structure and public APIs. Centralize repeated visual tokens in Tailwind `@theme`, move duplicated consultation state/data to single sources of truth, strengthen the harness with full typechecking and relative-import validation, and split only the largest mixed-responsibility UI files.

**Tech Stack:** Next.js 16.2.7, React 19, TypeScript 5 strict mode, Tailwind CSS v4, Node contract tests, custom FSD/harness scripts.

**Spec:** `docs/superpowers/specs/2026-09-07-frontend-code-quality-refactor-design.md`

## Global Constraints

- Frontend repository only; backend production code changes are forbidden.
- Preserve all existing route, API, and user-visible behavior.
- Preserve `#02C551` as the main brand color.
- Do not introduce a new styling or state-management dependency.
- Use TDD: failing regression test first, then minimal implementation, then full harness.
- Keep existing public FSD APIs and no higher-layer imports.

---

### Task 1: Tailwind v4 semantic design tokens

**Files:**
- Modify: `app/globals.css`
- Modify: repeated student/shared TSX files using core colors/font inline styles
- Test: `tests/contracts/student-ui-foundation.test.ts`
- Test: `tests/contracts/student-brand-accent.test.ts`

**Interfaces:**
- Produces Tailwind utilities: `bg-brand`, `text-brand`, `bg-surface`, `text-ink`, `text-muted`, `border-border`, `font-sans`.

- [ ] **Step 1: Write a failing contract** asserting `globals.css` defines semantic `@theme` color/font tokens and does not force `body { display: block !important; }`.
- [ ] **Step 2: Run the focused UI contracts and verify RED.**
- [ ] **Step 3: Add semantic tokens to `@theme`, set the global font through Tailwind/body inheritance, remove repeated fixed `fontFamily` inline styles in touched student/shared files, and migrate repeated core hex utilities to semantic utilities without changing rendered values.**

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

- [ ] **Step 4: Run focused UI contracts, lint, and build; verify GREEN.**
- [ ] **Step 5: Commit:** `refactor : centralize tailwind design tokens`

---

### Task 2: Repository-wide TypeScript typecheck gate

**Files:**
- Modify: `package.json`
- Modify: `scripts/harness/verify.ts`
- Modify: `scripts/harness/verify.test.ts`
- Modify: currently failing contract test fixtures/types under `tests/contracts/**`

**Interfaces:**
- Produces npm script `typecheck` that runs `tsc --noEmit`.
- Produces harness step named `typecheck` before the production build.

- [ ] **Step 1: Update `verify.test.ts` to require a `typecheck` npm step and run it RED against the current 17-step harness.**
- [ ] **Step 2: Add `"typecheck": "tsc --noEmit"` and the harness step, then run `npm run typecheck`; capture the existing fixture failures.**
- [ ] **Step 3: Fix each failing test fixture/mocked generic signature without weakening production types.** Examples include adding `deadline: null` to `FormSummary` fixtures and making generic request stubs return `Promise<T>` safely inside tests.
- [ ] **Step 4: Replace the ES2018-only regex flag in `student-auth-autofill-style.test.ts` with an ES2017-compatible expression rather than changing the application target.**
- [ ] **Step 5: Run `npm run typecheck`, contracts, and full harness; verify GREEN with the new step count.**
- [ ] **Step 6: Commit:** `test : enforce frontend typecheck`

---

### Task 3: Consultation type/state and schedule source of truth

**Files:**
- Modify/Create within `src/fsd/entities/consultation/model/**`
- Modify: `src/fsd/features/submit-consultation/model/teacherOption.ts`
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Modify: `src/fsd/features/submit-consultation/model/schedulePresentation.ts`
- Test: consultation contract files

**Interfaces:**
- Produces one server-backed selected teacher object (`ConsultationTeacherOption | null`) as the source of truth.
- Produces one consultation schedule definition containing period, start time, and display range.

- [ ] **Step 1: Write failing contracts for dynamic teacher names and one shared schedule source.**
- [ ] **Step 2: Run focused consultation contracts and verify RED.**
- [ ] **Step 3: Remove the dynamic-name `as ConsultationTeacher` path; derive teacher label from `string` while storing the selected server teacher object.**
- [ ] **Step 4: Replace duplicated `selectedTeacher`/`selectedTeacherId` state with the object and derive `teacherId`/label at use sites.**
- [ ] **Step 5: Move period start/display metadata into one entity-level schedule constant and make presentation/time-policy helpers derive from it.**
- [ ] **Step 6: Run consultation contracts + typecheck + full harness; verify behavior unchanged.**
- [ ] **Step 7: Commit:** `refactor : simplify consultation domain state`

---

### Task 4: Close the FSD relative-import loophole

**Files:**
- Modify: `scripts/harness/fsd-boundary-check.ts`
- Modify: `scripts/harness/fsd-boundary-check.test.ts`
- Normalize any existing cross-layer relative imports in `src/fsd/**` to public `@fsd/*` imports

**Interfaces:**
- `validateFsdImport(sourceFile, specifier)` must validate alias and relative imports that resolve inside `src/fsd`.
- Cross-layer/slice imports must use public APIs.

- [ ] **Step 1: Add failing unit cases for a feature importing `../../../pages/...`, cross-slice relative imports, and valid same-slice relatives.**
- [ ] **Step 2: Run the FSD unit test and verify RED.**
- [ ] **Step 3: Resolve relative specifiers from `sourceFile`, normalize the resulting path, classify its FSD layer/slice, and apply the same rank/public-API checks.**
- [ ] **Step 4: Convert current cross-layer relatives such as `../../../entities/.../index.ts` to `@fsd/entities/...` public imports.**
- [ ] **Step 5: Run FSD unit + `npm run harness:fsd` + typecheck + full harness.**
- [ ] **Step 6: Commit:** `refactor : enforce relative fsd boundaries`

---

### Task 5: Split the teacher consultation page by responsibility

**Files:**
- Modify: `src/fsd/pages/teacher/ui/TeacherPage.tsx`
- Create focused `model` and `ui` files inside `src/fsd/pages/teacher/**` or move reusable domain behavior to the existing consultation entity/feature where appropriate
- Test: `tests/contracts/teacher-characterization.test.ts`
- Test: `tests/contracts/teacher-consultation-page.test.ts`

**Interfaces:**
- Page keeps the same exported `TeacherPage` API.
- Extract pure calendar/week/schedule calculations from JSX.
- Extract consultation request/confirmed presentation into focused UI components without changing API calls.

- [ ] **Step 1: Strengthen characterization contracts around visible labels, route links, approval calls, and slot rendering before moving code.**
- [ ] **Step 2: Run characterization tests GREEN before refactor.**
- [ ] **Step 3: Extract pure date/schedule helpers and types to model files; remove dead `periods`, `toRequestData`, and `API_URL` code currently reported by ESLint.**
- [ ] **Step 4: Extract calendar and schedule-grid presentation components with explicit typed props.**
- [ ] **Step 5: Keep API loading/approval orchestration in the smallest sensible model/page boundary; avoid introducing new global state.**
- [ ] **Step 6: Run teacher contracts, ESLint, typecheck, and full harness.**
- [ ] **Step 7: Commit:** `refactor : split teacher consultation page`

---

### Task 6: Focus teacher forms/recruit UI responsibilities and shared primitives

**Files:**
- Modify: `src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx`
- Modify: `src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx`
- Create focused child UI/model files only where code has an independent responsibility
- Modify shared UI only when replacing duplicated button/field behavior is low-risk
- Test: teacher forms/recruit contracts

**Interfaces:**
- Keep `TeacherFormsPage` and `TeacherRecruitPage` exports unchanged.
- Keep all current API calls and payload shapes unchanged.
- Reuse existing shared primitives; do not introduce a third button/input family.

- [ ] **Step 1: Add/strengthen characterization tests for create/edit/publish/close form actions and recruit filter/edit/publish behavior.**
- [ ] **Step 2: Run focused teacher contracts GREEN before structural moves.**
- [ ] **Step 3: Extract question editor/status/editor helpers from the page bodies into typed components where this materially shortens mixed-responsibility page code.**
- [ ] **Step 4: Replace repeated core design values in touched files with semantic Tailwind tokens from Task 1.**
- [ ] **Step 5: Remove duplicate/dead logic revealed by ESLint while preserving behavior.**
- [ ] **Step 6: Run teacher contracts, full ESLint, typecheck, FSD checks, and full harness.**
- [ ] **Step 7: Commit:** `refactor : focus teacher management pages`

---

### Task 7: Final verification and scope audit

**Files:**
- No intentional production changes; only fix regressions proven by verification.

- [ ] **Step 1: Run `npm run typecheck`. Expected: exit 0.**
- [ ] **Step 2: Run `npm run lint`. Expected: no errors and no new warnings in touched code.**
- [ ] **Step 3: Run `npm run harness:fsd`, `npm run harness:convention`, and `npm run harness:contracts`. Expected: all pass.**
- [ ] **Step 4: Run the complete harness. Expected: all steps pass, including the new typecheck step.**
- [ ] **Step 5: Run `git diff --check`, inspect changed production paths, and verify the backend repository has zero modified files.**
- [ ] **Step 6: Push `test/vercel-preview`, verify the Vercel status is `success`, then rerun the full harness on the committed tree.**

## Scope Amendment — 2026-09-07

- Teacher frontend production code and teacher contract tests are read-only for this refactor.
- Backend production code is read-only.
- Teacher-only FSD areas are excluded from the FSD boundary scan.
- Tasks 5 and 6 in this plan are cancelled and must not be executed.
- Remaining work is limited to student frontend, shared/entities code used by students, and harness/tests outside teacher scope.
- Final scope: teacher frontend and backend are fully excluded from this refactor, including teacher FSD/convention/typecheck targets. Existing teacher tests may run only as unchanged regression checks.
