# Profile FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve profile reservations/history/cancellation/local memo behavior while replacing the legacy profile page and API facade with FSD ownership.

**Architecture:** Consultation record mapping lives in `entities/consultation`. Cancellation is a user action in `features/cancel-consultation`. Profile aggregation/loading lives in `pages/profile`, while reservation/history presentation lives in a widget. The Next route stays a thin adapter.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing harness.

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints

- Preserve existing API endpoints and authenticated request behavior.
- Preserve profile composite reservation id semantics for cancellation.
- Preserve reservation/history views and local-only memo editing.
- Teacher files remain unchanged.
- Do not reuse legacy `api/api.ts` from new FSD code.

---

### Task 1: Profile consultation model
- Add profile consultation mapping and composite id decode rules to `entities/consultation`.
- Add pure profile aggregation model under `pages/profile/model`.
- Cover both with a failing contract test before implementation.

### Task 2: Cancellation feature and profile API
- Build profile data with `course/common` all/upcoming requests and current user session.
- Decode composite ids before calling consultation cancel API.
- Keep API calls on `requestWithSession`.

### Task 3: Profile UI migration
- Add a profile consultations widget for reservation/history/detail/local memo UI.
- Add a new `pages/profile` screen using `SiteHeader`.
- Replace `app/profile/page.tsx` with a route adapter.

### Task 4: Legacy cleanup and verification
- Stop Profile from importing `api/api.ts` and legacy HeaderTwo/Modal.
- Update implementation-coupled regression checks if any fail only because ownership moved.
- Add profile contract tests to `harness:verify`.
- Run full harness verification, production build, and `git diff --check`.
