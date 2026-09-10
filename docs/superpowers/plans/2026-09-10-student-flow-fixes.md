# Student Flow Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct student consultation, response-form, recruitment, and notification behavior while preserving backend contracts.

**Architecture:** Extend existing FSD model/API/UI slices. Pure scheduling/status/routing decisions are tested as functions; React components only coordinate state, API calls, toast, modal, and navigation.

**Tech Stack:** Next.js App Router, React, TypeScript, Node contract tests, existing harness.

**Spec:** `docs/superpowers/specs/2026-09-10-student-flow-fixes-design.md`

## Global Constraints

- Do not change endpoint, HTTP method, payload, auth/session, or response contracts unless the existing backend contract proves a missing field/endpoint.
- Keep cross-slice imports through public `@fsd/*` APIs.
- Follow existing notification provider/toast and `router.push` patterns.
- Every behavior change starts with a failing test.
- Run `npm run harness:verify` before claiming completion.

---

### Task 1: Consultation availability and category defaults

**Files:**
- Modify: `src/fsd/entities/consultation/model/rules.ts`, `src/fsd/features/submit-consultation/model/schedulePresentation.ts`, `src/fsd/features/submit-consultation/model/useConsultationForm.ts`, `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Test: `tests/contracts/consultation-contract.test.ts`, add focused scheduling contract coverage

- [ ] Write tests proving past periods are rejected, exhausted today advances to the next available date, and the category starts empty.
- [ ] Run the focused contract test and confirm the new assertions fail for the current implementation.
- [ ] Implement minimal pure date/period filtering and next-date selection; remove category initialization while preserving required validation.
- [ ] Run focused tests and typecheck.

### Task 2: Consultation status, cancellation confirmation, and success routing

**Files:**
- Modify: `src/fsd/entities/consultation/model/profile.ts`, `src/fsd/widgets/home-services/model/overview.ts`, `src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx`, `src/fsd/features/cancel-consultation/*`, `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Test: `tests/contracts/counsel-cancel-routing.test.ts`, add status/copy tests

- [ ] Add failing assertions that pending career requests are not upcoming confirmed consultations and that the action copy is `신청 취소`.
- [ ] Add a failing interaction/source test requiring a confirmation modal before cancellation.
- [ ] Run tests and confirm expected failures.
- [ ] Implement status filtering, copy, modal confirmation, and success toast followed by `router.push("/")`.
- [ ] Run focused tests and typecheck.

### Task 3: Response-form re-response

**Files:**
- Inspect/modify: `src/fsd/entities/form/api/*`, `src/fsd/features/submit-form/*`, `src/fsd/pages/forms/*`
- Test: `tests/contracts/form-answers.test.ts`, `tests/contracts/api-contract.test.ts`

- [ ] Locate the backend re-response endpoint and expected method/payload from existing API code/contracts.
- [ ] Add a failing contract test for loading an existing answer and submitting the revised answer.
- [ ] Run the test to verify the current frontend is missing the behavior.
- [ ] Implement the smallest API/UI connection using existing form answer mapping and error handling.
- [ ] Run focused tests and typecheck.

### Task 4: Notifications, routing, and unread badge

**Files:**
- Modify: `src/fsd/features/notifications/api/notificationStream.ts`, `src/fsd/features/notifications/model/NotificationContext.tsx`, `src/fsd/features/notifications/ui/NotificationBell.tsx`, `src/fsd/features/notifications/ui/NotificationPanel.tsx`
- Test: `tests/contracts/notification.test.ts`, add target-routing/unread-count cases

- [ ] Add failing tests for notification refresh after delivery, consultation-request target routing, and unread-count badge rendering.
- [ ] Run notification tests and confirm failures.
- [ ] Fix SSE/list refresh fallback, map notification types to the correct student destinations, and render the numeric red badge.
- [ ] Run notification tests and typecheck.

### Task 5: Recruitment deadline cleanup and timetable feasibility

**Files:**
- Modify: `src/fsd/pages/recruit/ui/RecruitPage.tsx` only for the duplicate student-card deadline
- Test: relevant recruitment contract test
- Report only: `src/fsd/pages/teacher/model/calendar.ts` and backend contract/search results for timetable investigation

- [ ] Add a failing assertion that the student recruitment card has one deadline presentation.
- [ ] Remove only the duplicate top-right deadline.
- [ ] Run the focused test.
- [ ] Search all frontend API contracts and repository references for a teacher-specific timetable endpoint; document whether it exists and why implementation is or is not possible.

### Task 6: Full verification

- [ ] Run `npm run harness:verify`.
- [ ] Fix any changed-file lint, FSD boundary, contract, or build failures.
- [ ] Run `git diff --check` and review the final diff against the spec.
