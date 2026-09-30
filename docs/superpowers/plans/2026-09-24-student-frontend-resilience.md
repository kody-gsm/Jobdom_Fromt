# Student Frontend Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Harden student frontend asynchronous state, error handling, identity boundaries, and accessibility without changing backend or teacher-page source.

**Architecture:** Keep endpoint contracts unchanged and move each concern into its existing page/feature/entity/widget boundary. Use explicit loading/success/error state, request-version guards, user identity guards, and provider-owned notification state instead of broad `Promise.all` or stale local state. Shared frontend changes are limited to authenticated requests and `SegmentedTabs`, with student and teacher regression coverage.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Node contract harness, FSD aliases, backend contract documents.

**Spec:** `docs/superpowers/specs/2026-09-24-student-frontend-resilience-design.md`

## Global Constraints

- Student pages and related `feature`, `entity`, `widget`, and `shared` frontend code only.
- Do not modify teacher-page source or backend source.
- Preserve existing endpoint paths, HTTP methods, request payloads, and session/reissue contracts.
- Shared frontend changes must include regression coverage for student and teacher impact.
- Each task writes a failing regression contract first, observes the expected failure, implements the smallest fix, runs its focused and full checks, and ends in its own commit.
- Password-reset “unregistered account” precision remains deferred because the backend currently returns `204` for unknown emails.

## Review Focus

- A failed list or form request must not render an empty-state copy at the same time as an error.
- A late response from a previous form, upload, notification page, or avatar identity must never overwrite current state.
- A failed availability or submission lookup must fail closed and preserve independent successful data.
- A real-time event must update every open student surface without duplicate toasts or stale-list overwrites.
- A `403` permission response must not log the user out, while a failed `401` refresh must clear the session.

## Task 1: Harden recruit list and detail form linking

**Files:**
- Modify: `src/fsd/pages/recruit/model/useRecruitList.ts`
- Modify: `src/fsd/pages/recruit/ui/RecruitPage.tsx`
- Modify: `src/fsd/pages/recruit-detail/model/useRecruitDetail.ts`
- Modify: `src/fsd/pages/recruit-detail/model/formMatching.ts`
- Modify: `src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx`
- Test: `tests/contracts/student-recruit-resilience.test.ts`

**Interfaces:** `useRecruitList()` returns `{ items, loading, error, retry }`. `useRecruitDetail()` returns independent recruit/form states, `retryForm`, and a deterministic missing-form message.

- [ ] **Step 1: Write the failing contract.** Assert that the recruit list exposes retry and the page renders either error/retry or empty copy, never both. Assert that `findRecruitForm` does not match a company/title pair, that detail code requires exact `formId`, and that form errors expose retry without hiding recruit content.
- [ ] **Step 2: Run the focused contract.** Run `node --no-warnings --experimental-strip-types tests/contracts/student-recruit-resilience.test.ts`; expect failures for missing retry, fuzzy matching, and missing detail retry.
- [ ] **Step 3: Implement list state.** Add request version/mounted guards and `retry` to `useRecruitList`; branch `RecruitPage` as loading → error/retry → empty → data.
- [ ] **Step 4: Implement deterministic detail linking.** Remove the fuzzy fallback from `formMatching.ts`. When `formId` exists, link only a form with the same ID; when it is absent, keep `form` null and expose the exact missing-form message. Add independent form-list retry and preserve the recruit detail on form failure.
- [ ] **Step 5: Run focused and related contracts.** Run the new contract plus `student-resilience-regressions.test.ts`, `api-contract.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/pages/recruit src/fsd/pages/recruit-detail tests/contracts/student-recruit-resilience.test.ts && git commit -m "fix: harden student recruit loading"`

## Task 2: Isolate form detail and submission async state

**Files:**
- Modify: `src/fsd/features/submit-form/ui/SubmitForm.tsx`
- Modify: `src/fsd/features/submit-form/api/form.ts` only if a typed operation wrapper is required
- Test: `tests/contracts/student-form-async-state.test.ts`

**Interfaces:** Form detail state distinguishes `formLoading/formError` from `submissionLoading/submissionError`; submission actions are disabled while submission state is unknown. Every async operation checks the captured `formId` request version before updating state.

- [ ] **Step 1: Write the failing contract.** Cover form A → form B navigation, body success with submission failure, disabled action before submission lookup resolves, submission retry, and stale file-upload/submit results.
- [ ] **Step 2: Reproduce the real route transition.** Run the contract against the existing `/forms/[id]` route adapter and assert that changing the rendered `formId` invalidates the previous operation; expect failures because `Promise.all` currently collapses state and submit/upload callbacks are not versioned.
- [ ] **Step 3: Add independent state.** Track form and submission loading/error separately. Treat only 404 submission as “no existing submission”; all other submission errors disable submit and show retry while retaining the loaded form.
- [ ] **Step 4: Guard operations.** Capture an operation version and `formId` before loading, uploading, submitting, or resubmitting. Before each state update, require the component to be active and the version/form ID to match. Retry only the submission lookup.
- [ ] **Step 5: Run focused and existing form contracts.** Run the new contract, `student-form-resubmit.test.ts`, `form-answers.test.ts`, `student-forms-preview-fallback.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/features/submit-form tests/contracts/student-form-async-state.test.ts && git commit -m "fix: isolate student form async state"`

## Task 3: Fail closed on consultation availability and synchronize calendar month

**Files:**
- Modify: `src/fsd/features/submit-consultation/model/useConsultationAvailability.ts`
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Modify: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Test: `tests/contracts/student-consultation-availability-resilience.test.ts`

**Interfaces:** `useConsultationAvailability()` returns `availabilityStatus: "idle" | "loading" | "success" | "error"`, `retryAvailability`, and existing date/time APIs. Error status makes all periods unavailable until a successful retry.

- [ ] **Step 1: Write the failing contract.** Assert loading/success/error transitions, retry, fail-closed period disabling, and calendar month synchronization when `selectedDate` crosses into the next month.
- [ ] **Step 2: Run the focused contract.** Expect failure because the slot-status catch currently clears unavailable periods and makes periods selectable, while the calendar month is independent of selected date.
- [ ] **Step 3: Implement availability state.** Add status and retry version guards around slot-status requests. Set status to loading on date/type/teacher changes, success only on a valid response, and error on failure; make `isTimeUnavailable` return true for status error/loading.
- [ ] **Step 4: Synchronize month.** Add a Korea-date-safe selected-date-to-calendar-month helper and update `calendarDate` whenever `selectedDate` changes to a non-null value.
- [ ] **Step 5: Run focused consultation contracts.** Run the new contract, `student-consultation-slot-status-api.test.ts`, `student-consultation-schedule-panel.test.ts`, `student-consultation-submit-contract.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/features/submit-consultation tests/contracts/student-consultation-availability-resilience.test.ts && git commit -m "fix: fail closed on consultation availability errors"`

## Task 4: Preserve partial profile reservations and report stale cancel targets

**Files:**
- Modify: `src/fsd/pages/profile/api/profile.ts`
- Modify: `src/fsd/pages/profile/model/useProfilePage.ts`
- Modify: `src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx`
- Modify: `src/fsd/features/cancel-consultation/ui/ConsultationCancelDialog.tsx`
- Test: `tests/contracts/student-profile-reservation-resilience.test.ts`

**Interfaces:** Profile reservation state reports independent course/common errors, keeps successful results, and exposes a `reservationChangedMessage` when the open cancel target disappears during refresh.

- [ ] **Step 1: Write the failing contract.** Assert independent course/common fetches, retention of successful reservations when the other request rejects, and visible stale-target status instead of silent dialog disappearance.
- [ ] **Step 2: Run the focused contract.** Expect failure because `fetchProfileReservations` uses `Promise.all` and `ProfileConsultations` conditionally unmounts the dialog without notice.
- [ ] **Step 3: Split reservation reads.** Fetch course/common independently, return successful reservations plus scoped error details, and preserve existing refresh/version behavior.
- [ ] **Step 4: Handle stale target.** When reservations no longer contain `cancelTarget`, close the dialog in an effect and show a one-time status message. Clear the message only when the user dismisses it or opens a new target.
- [ ] **Step 5: Run profile contracts and typecheck.** Run the new contract, `profile-contract.test.ts`, `profile-fsd-pages.test.ts`, `student-consultation-refresh.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/pages/profile src/fsd/widgets/profile-consultations src/fsd/features/cancel-consultation tests/contracts/student-profile-reservation-resilience.test.ts && git commit -m "fix: preserve partial student reservations"`

## Task 5: Make notifications provider-owned, deduplicated, and retryable

**Files:**
- Modify: `src/fsd/features/notifications/model/NotificationContext.tsx`
- Modify: `src/fsd/features/notifications/ui/NotificationPanel.tsx`
- Modify: `src/fsd/features/notifications/ui/NotificationToast.tsx` only if presentation props change
- Test: `tests/contracts/student-notification-resilience.test.ts`

**Interfaces:** Provider exposes `notifications`, `notificationLoading`, `notificationError`, `retryNotifications`, `pushToast`, `dismissToast`, and existing unread operations. Panel consumes provider list/state instead of maintaining a competing list.

- [ ] **Step 1: Write the failing contract.** Cover duplicate notification IDs, SSE insertion into an open panel, panel retry, and stale page-0/page-1 responses.
- [ ] **Step 2: Run the focused contract.** Expect failure because duplicate toasts are appended, panel data is local, and `fetchPage` has no request guard or retry action.
- [ ] **Step 3: Move list state to provider.** Add dedupe-by-ID merge, ordered insertion, request-version guards, initial/retry loading state, and error state. Feed SSE items through the same merge path used by panel refresh.
- [ ] **Step 4: Update panel UI.** Render provider data, show error without empty copy, add retry button, preserve pagination, and keep read/read-all behavior.
- [ ] **Step 5: Run notification contracts.** Run the new contract, `notification.test.ts`, `requested-consultation-notification-fixes.test.ts`, `student-consultation-live-flow.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/features/notifications tests/contracts/student-notification-resilience.test.ts && git commit -m "fix: synchronize student notifications"`

## Task 6: Reset verification state and preserve auth error distinctions

**Files:**
- Modify: `src/fsd/features/signup/model/useSignupForm.ts`
- Modify: `src/fsd/features/reset-password/model/useResetPasswordForm.ts`
- Modify: `src/fsd/entities/user/model/auth-errors.ts`
- Modify: `src/fsd/features/reset-password/ui/ResetPasswordForm.tsx` if retry/status copy needs presentation
- Modify: `src/fsd/features/signup/ui/SignupForm.tsx` if reset state needs visible guidance
- Test: `tests/contracts/student-auth-code-resilience.test.ts`

**Interfaces:** Updating the email field clears code, sent state, verification countdown, resend cooldown, and related errors. Password-reset send errors map by API status/message without treating every error as “unregistered.”

- [ ] **Step 1: Write the failing contract.** Assert email-change reset behavior for signup/reset, server/network error copy preservation, and the explicit deferred backend case where unknown email returns 204.
- [ ] **Step 2: Run the focused contract.** Expect failure because `updateField` only changes the field and reset-password `sendCode` catches every error into the unregistered message.
- [ ] **Step 3: Implement reset semantics.** On email changes, reset verification code, sent state, countdown, resend cooldown, and verification errors; keep the new email available for a fresh send.
- [ ] **Step 4: Implement status-aware send errors.** Use existing `ApiError` status/message mapping for network/5xx/validation errors and retain the backend limitation as a general/non-specific result rather than inventing an unregistered response.
- [ ] **Step 5: Run auth contracts.** Run the new contract, `auth-error-message.test.ts`, `auth-validation-policy.test.ts`, `signup-behavior.test.ts`, `student-reset-password-redesign.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/features/signup src/fsd/features/reset-password src/fsd/entities/user/model/auth-errors.ts tests/contracts/student-auth-code-resilience.test.ts && git commit -m "fix: reset student verification state"`

## Task 7: Guard profile avatar cache and uploads by session identity

**Files:**
- Modify: `src/fsd/entities/user/model/profileAvatar.ts`
- Modify: `src/fsd/entities/user/model/useProfileAvatar.ts`
- Modify: `src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts`
- Modify: `src/fsd/entities/user/model/lifecycle.ts` only if logout/session events need a typed hook
- Test: `tests/contracts/student-profile-avatar-identity.test.ts`

**Interfaces:** Avatar loading and upload operations capture `{ userKey, sessionIdentity, requestVersion }`; completion updates state/cache only when the current session matches the captured identity.

- [ ] **Step 1: Write the failing contract.** Assert cache clearing on logout/session change, reloading by new user key, and ignoring a previous-user upload response after account change.
- [ ] **Step 2: Run the focused contract.** Expect failure because the avatar hook effect runs once, upload reads session only after completion, and cache events do not identify the current user.
- [ ] **Step 3: Implement identity-aware loading.** Subscribe to session events, invalidate the active request, clear old avatar state, compute the current key, and reload cache/profile for the new session.
- [ ] **Step 4: Implement identity-aware upload.** Capture identity before upload, verify it after upload, and update current state/cache only on a match; leave stale responses ignored.
- [ ] **Step 5: Run avatar/profile contracts and typecheck.** Run the new contract, `student-header-avatar.test.ts`, `profile-fsd-pages.test.ts`, `profile-contract.test.ts`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/entities/user src/fsd/features/change-profile-avatar tests/contracts/student-profile-avatar-identity.test.ts && git commit -m "fix: guard student avatar identity"`

## Task 8: Separate 401/403 behavior and improve SegmentedTabs keyboard access

**Files:**
- Modify: `src/fsd/shared/api/createAuthenticatedRequest.ts`
- Modify: `src/fsd/shared/ui/SegmentedTabs.tsx`
- Modify: `src/fsd/shared/ui/index.ts` only if new prop types are exported
- Test: `tests/contracts/student-auth-status-and-tabs.test.ts`
- Test: `tests/contracts/teacher-auth-status-and-tabs.test.ts` if existing teacher characterization needs an explicit shared regression

**Interfaces:** `createAuthenticatedRequest` clears session only after failed authentication/reissue, not on permission-only `403`. `SegmentedTabs` preserves its current props and adds correct roving tab keyboard behavior and ARIA linkage.

- [ ] **Step 1: Write the failing contract.** Assert 401 refresh and failed-refresh clearing, 403 session retention, click behavior, arrow/Home/End focus movement, `tabIndex`, and `aria-controls`.
- [ ] **Step 2: Run the focused contract.** Expect failure because current authenticated requests clear session on both 401 and 403 and tabs have no keyboard handler/tab index/linkage.
- [ ] **Step 3: Fix auth status policy.** Keep the existing single-flight reissue flow; only call `clearSession` for a terminal 401/reissue authentication failure, and rethrow 403 unchanged.
- [ ] **Step 4: Fix tabs accessibility.** Track focused index, assign roving `tabIndex`, support ArrowLeft/ArrowRight/Home/End with wrapping, and expose optional/derived `aria-controls` without changing click consumers.
- [ ] **Step 5: Run shared contracts and typecheck.** Run the new student/shared contract, existing auth route/session contracts, teacher characterization contracts, `npm run harness:fsd`, `npm run harness:convention`, and `npm run typecheck`; expect all to pass.
- [ ] **Step 6: Commit.** `git add src/fsd/shared/api/createAuthenticatedRequest.ts src/fsd/shared/ui/SegmentedTabs.tsx src/fsd/shared/ui/index.ts tests/contracts/student-auth-status-and-tabs.test.ts tests/contracts/teacher-auth-status-and-tabs.test.ts && git commit -m "fix: preserve auth permissions and keyboard tabs"`

## Final verification and push

- [ ] Run `npm run harness:contracts` and confirm every contract passes.
- [ ] Run `npm run harness:fsd`, `npm run harness:convention`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Run `npm run harness:verify`; record any pre-existing failure separately and do not claim a clean gate if it fails.
- [ ] Verify `git diff --name-only <base>...HEAD` contains no backend or teacher-page source.
- [ ] Verify `git status --short` is clean and each task has its own commit.
- [ ] Run `npm run harness:ready` only after all checks pass and the worktree is clean.
- [ ] Push `fix/student-frontend-resilience` to origin after verification.
