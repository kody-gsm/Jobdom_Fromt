# Teacher FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every Teacher route into FSD without changing Teacher UI, user-visible behavior, business rules, routes, or backend API contracts.

**Architecture:** Root `app/teacher/**` files become thin Next.js route adapters. Existing Teacher page JSX/state/handlers move with minimal edits into `src/fsd/pages/*`; domain API/type ownership moves to existing consultation/form/recruit entities, while cross-domain recruit dashboard composition lives in a feature.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, existing Jobdam harness and contract scripts.

**Spec:** `docs/superpowers/specs/2026-09-03-jobdam-fsd-convention-design.md`

## Global Constraints

- Teacher migration is behavior-preserving only; no redesign or unrelated refactor.
- Preserve all existing Teacher labels, links, CSS class strings, validation messages, modal behavior, and route meaning.
- Preserve backend endpoints, HTTP methods, payload shapes, auth/session, and error behavior.
- `app/teacher/**/page.tsx` becomes routing-only.
- New FSD code must follow layer direction and public API rules.
- Existing CI/CD is untouched; verification uses `npm run harness:verify`.
- Teacher changes are allowed only on `refactor/teacher-fsd*` migration branches.

---

### Task 1: Freeze Teacher behavior with characterization contracts

**Files:**
- Create: `scripts/harness/teacher-characterization.test.ts`
- Modify: `scripts/harness/verify.ts`
- Modify: `scripts/harness/verify.test.ts`

**Interfaces:**
- Consumes: current four `app/teacher/**/page.tsx` implementations.
- Produces: baseline assertions for labels, links, API actions, upload limit, form lifecycle, consultation approval, and submission viewing.
- [ ] **Step 1: Add a baseline characterization test**

Assert the current source contains the existing Teacher contracts, including `/teacher/recruit`, `/teacher/forms`, `getTeacherConsultations("course")`, `approveConsultation("course", ...)`, form create/update/publish/close, submission detail loading, 10 MB recruit image limit, and existing Korean UI labels.

- [ ] **Step 2: Run the characterization test**

Run: `node --no-warnings --experimental-strip-types scripts/harness/teacher-characterization.test.ts`
Expected: PASS because this is a baseline characterization test, not a new behavior test.

- [ ] **Step 3: Register the test in harness verification**

Add `teacher characterization unit` to `NODE_CHECKS` and require it in `verify.test.ts`.

- [ ] **Step 4: Commit**

```bash
git commit -m "test : characterize teacher behavior"
```

### Task 2: Move Teacher-compatible domain API ownership into FSD

**Files:**
- Modify: `src/fsd/entities/consultation/model/types.ts`
- Modify: `src/fsd/entities/consultation/api/createConsultationApi.ts`
- Modify: `src/fsd/entities/consultation/index.ts`
- Modify: `src/fsd/entities/form/model/types.ts`
- Modify: `src/fsd/entities/form/api/createFormApi.ts`
- Modify: `src/fsd/entities/form/index.ts`
- Modify: `src/fsd/entities/recruit/model/types.ts`
- Modify: `src/fsd/entities/recruit/api/createRecruitApi.ts`
- Modify: `src/fsd/entities/recruit/index.ts`
- Test: `scripts/harness/teacher-domain-api.test.ts`

**Interfaces:**
- Produces consultation `getTeacher`, `approve`, `lock`; form teacher CRUD/publish/close/submission methods; recruit analyze/update/publish/teacher-list methods with the exact legacy contracts.
- [ ] **Step 1: Write failing endpoint/payload tests**

Test exact Teacher endpoint/method pairs before adding methods to the FSD factories.

- [ ] **Step 2: Run tests and confirm RED**

Expected: FAIL because Teacher methods/types are not yet exported from the FSD entities.

- [ ] **Step 3: Add the minimal types and factory methods**

Copy the existing legacy type shapes and request calls without renaming backend fields or changing payload construction.

- [ ] **Step 4: Run domain API, FSD boundary, and convention tests**

Run the focused test plus `npm run harness:fsd` and `npm run harness:convention`.

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor : move teacher api ownership to fsd"
```

### Task 3: Migrate Teacher consultation workspace

**Files:**
- Create: `src/fsd/features/navigate-home/ui/HomeLogoButton.tsx`
- Create: `src/fsd/features/navigate-home/index.ts`
- Modify: `app/components/atoms/HomeLogoButton.tsx` into a compatibility facade
- Create: `src/fsd/pages/teacher/api/teacher.ts`
- Create: `src/fsd/pages/teacher/ui/TeacherPage.tsx`
- Create: `src/fsd/pages/teacher/index.ts`
- Modify: `app/teacher/page.tsx`
- Test: `scripts/harness/teacher-consultation-page.test.ts`

**Interfaces:**
- Consumes: user session, consultation entity Teacher API, and existing Teacher JSX/state logic.
- Produces: `TeacherPage` with the same calendar, hard-coded schedule, modals, labels, links, request loading, and approval behavior.
- [ ] **Step 1: Write route/source preservation tests**

Assert the future route is adapter-only and the FSD page retains the existing Teacher consultation labels, link targets, schedule constants, request/confirm modal labels, and approval call semantics.

- [ ] **Step 2: Run and confirm RED**

Expected: FAIL because `src/fsd/pages/teacher` and `features/navigate-home` do not exist.

- [ ] **Step 3: Move implementation with minimal edits**

Move the current page body essentially verbatim; only change imports, exported component name, and API wiring needed to satisfy FSD ownership.

- [ ] **Step 4: Run focused contracts and build**

Run characterization, consultation page test, FSD boundary/convention, changed lint, and production build.

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor : migrate teacher consultation to fsd"
```

### Task 4: Migrate Teacher form management and submissions

**Files:**
- Create: `src/fsd/pages/teacher-forms/api/forms.ts`
- Create: `src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx`
- Create: `src/fsd/pages/teacher-forms/index.ts`
- Create: `src/fsd/pages/teacher-form-submissions/api/submissions.ts`
- Create: `src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx`
- Create: `src/fsd/pages/teacher-form-submissions/index.ts`
- Modify: `app/teacher/forms/page.tsx`
- Modify: `app/teacher/forms/[id]/submissions/page.tsx`
- Test: `scripts/harness/teacher-forms-pages.test.ts`

**Interfaces:**
- Preserves question types, draft editing, validation message order, create/update/publish/close lifecycle, clipboard student link, submission auto-selection, and detail rendering.
- [ ] **Step 1: Write failing page migration tests**

Assert FSD page files do not exist yet, then require future route adapters and unchanged lifecycle markers.

- [ ] **Step 2: Move both pages with import-only structural edits**

Use `SiteHeader` directly, reuse FSD form types/API factories, and preserve JSX/class strings and state logic.

- [ ] **Step 3: Run focused tests and build**

Run Teacher forms tests plus API/form regression checks and production build.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor : migrate teacher forms to fsd"
```

### Task 5: Migrate Teacher recruit workspace

**Files:**
- Create: `src/fsd/features/manage-recruit/model/dashboard.ts`
- Create: `src/fsd/features/manage-recruit/api/dashboard.ts`
- Create: `src/fsd/features/manage-recruit/index.ts`
- Create: `src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx`
- Create: `src/fsd/pages/teacher-recruit/index.ts`
- Modify: `app/teacher/recruit/page.tsx`
- Test: `scripts/harness/teacher-recruit-page.test.ts`

**Interfaces:**
- Preserves title-based recruit/form matching, search/status filtering, 10 MB image limit, analyze/update/publish calls, applicant display, edit form, and all existing Teacher links/messages.

- [ ] **Step 1: Write failing dashboard and page tests**

Test the existing name normalization/matching semantics and future adapter/page markers before implementation.

- [ ] **Step 2: Move dashboard composition without semantic changes**

Copy `normalizeName`, `findRecruitForm`, and dashboard aggregation semantics from the legacy API facade into the feature, using FSD recruit/form entity APIs.

- [ ] **Step 3: Move Teacher recruit JSX/state logic**

Keep UI strings, class names, upload validation, filtering, editor behavior, and links unchanged apart from imports.

- [ ] **Step 4: Verify and commit**

```bash
git commit -m "refactor : migrate teacher recruit to fsd"
```
### Task 6: Final Teacher migration verification and cleanup

**Files:**
- Modify: `scripts/harness/verify.ts`
- Modify: `scripts/harness/verify.test.ts`
- Modify legacy facades only when no runtime consumer requires their implementation.

**Interfaces:**
- Produces four thin `app/teacher/**` route adapters and a fully FSD-backed Teacher runtime.

- [ ] **Step 1: Assert all Teacher routes are adapter-only**

Require each root route to import one FSD page public API and contain no state, API call, validation, or direct `fetch` logic.

- [ ] **Step 2: Search runtime imports**

Confirm `src/fsd/pages/teacher*` does not import `app/utils/api.ts` or legacy `app/components` implementations.

- [ ] **Step 3: Run full verification**

Run `npm run harness:verify`, `git diff --check`, and confirm Teacher migration scope succeeds on `refactor/teacher-fsd*`.

- [ ] **Step 4: Compare characterization contracts**

Confirm every baseline Teacher label/link/action contract still passes after ownership moved.

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor : complete teacher fsd migration"
```
