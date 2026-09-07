# Student UX Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the student auth, dashboard, navigation, and profile experience to match the approved Jobdam UX while preserving existing frontend API contracts.

**Architecture:** Keep route adapters and existing FSD slices. Simplify shared auth layout, make login submit consume actual browser form values, replace staged home UI with a normal dashboard, and keep profile-photo persistence as a frontend-only local preference because the backend has no photo contract.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Node contract tests, Jobdam Harness.

**Spec:** `docs/superpowers/specs/2026-09-06-student-ux-cleanup-design.md`

## Global Constraints

- Backend is read-only; no backend changes, commits, pushes, or PRs.
- Work on `test/vercel-preview` only.
- Preserve existing API endpoints, HTTP methods, auth/session behavior, and Teacher/Admin behavior.
- Use the repository's original Jobdam and password-eye SVG assets.
- Every behavioral task follows RED → minimal implementation → GREEN → commit.

---

### Task 1: Simplify login/auth shell and fix browser autofill submit

**Files:**
- Modify: `tests/contracts/student-auth-layout-redesign.test.ts`
- Modify: `tests/contracts/student-login-redesign.test.ts`
- Modify: `tests/contracts/login-validation.test.ts`
- Modify: `src/fsd/widgets/auth-layout/ui/AuthLayout.tsx`
- Modify: `src/fsd/pages/login/ui/LoginPage.tsx`
- Modify: `src/fsd/features/login/ui/LoginForm.tsx`
- Modify: `src/fsd/features/login/model/useLoginForm.ts`
**Interfaces:**
- `AuthLayout` keeps `children` and allows optional `title`/`description` so signup/reset may keep concise copy while login omits it.
- `useLoginForm.submit(credentials?)` accepts optional `{ email, password }` overrides read from the real form element.

- [ ] **Step 1: Write failing contracts** asserting: no split promo panel, no CSS logo inversion, login copy excludes `다시 만나서 반가워요`, login form submit reads `FormData`, and submit button is disabled only while submitting.
- [ ] **Step 2: Run the focused auth contracts and confirm RED.**
- [ ] **Step 3: Implement the minimal auth shell and login submit changes.** Use `/JobdamIcon.svg` directly with no `brightness-0 invert`; in `onSubmit`, read `email` and `password` from `new FormData(event.currentTarget)` and pass them to `submit`.
- [ ] **Step 4: Run focused auth contracts and confirm GREEN.**
- [ ] **Step 5: Commit** with `fix : simplify login experience`.

### Task 2: Rename password-reset UX and prepare the requested account error copy

**Files:**
- Modify: `tests/contracts/forgot-password-behavior.test.ts`
- Modify: `tests/contracts/student-reset-password-redesign.test.ts`
- Modify: `src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx`
- Modify: `src/fsd/features/login/ui/LoginForm.tsx`
- Modify: `src/fsd/features/reset-password/model/useResetPasswordForm.ts`

**Interfaces:**
- Route remains `/forgot-password`.
- Visible label is `비밀번호 재설정`.
- `sendCode` keeps the existing API call. A genuine API failure in this account-check context surfaces `가입되지 않은 계정입니다.`; ambiguous HTTP 204 remains success because the frontend cannot infer hidden server state.

- [ ] **Step 1: Write failing contracts** for visible reset naming and exact account-error copy.
- [ ] **Step 2: Run reset contracts and confirm RED.**
- [ ] **Step 3: Implement minimal naming/error-copy changes without endpoint changes.**
- [ ] **Step 4: Run reset contracts and confirm GREEN.**
- [ ] **Step 5: Commit** with `fix : clarify password reset flow`.

### Task 3: Replace staged main page with the approved dashboard

**Files:**
- Modify: `tests/contracts/home-stage-transition.test.ts`
- Modify: `tests/contracts/home-dashboard-overview.test.ts`
- Modify: `tests/contracts/student-header.test.ts`
- Modify: `src/fsd/pages/home/ui/HomePage.tsx`
- Delete: `src/fsd/pages/home/model/useHomeStage.ts`
- Modify: `src/fsd/widgets/home-services/ui/HomeServices.tsx`
- Modify: `src/fsd/widgets/home-services/model/overview.ts`
- Modify: `src/fsd/widgets/student-header/model/navigation.ts`
- Modify: `src/fsd/widgets/student-header/ui/StudentHeader.tsx`
**Interfaces:**
- `HomePage` renders `StudentHeader` + `HomeServices` directly; no staged hero state.
- `HomeOverview.upcomingConsultations` returns all sorted items; the summary card chooses a small preview and the modal renders the full collection.
- Student navigation includes `/`, `/counsel`, `/recruit`.

- [ ] **Step 1: Rewrite home/header contracts to require:** no `useHomeStage`, no `JOBDAM STUDENT`, no `빠른 메뉴`, no English eyebrow labels, no inner `overflow-y-auto`, one `상담 신청` service entry, one full-width `취업 공고` section, modal-based upcoming consultation detail, and `/recruit` header navigation.
- [ ] **Step 2: Run focused home/header contracts and confirm RED.**
- [ ] **Step 3: Implement the dashboard:** two-column first row (`상담 신청`, `예정 상담`) and full-width second-row `취업 공고`; use local modal state for `전체 보기`.
- [ ] **Step 4: Delete the unused stage hook and update overview sorting so the modal can show all returned consultation items.**
- [ ] **Step 5: Run focused home/header contracts and confirm GREEN.**
- [ ] **Step 6: Commit** with `refactor : simplify student dashboard`.

### Task 4: Simplify profile and add local profile-photo editing

**Files:**
- Modify: `tests/contracts/student-profile-redesign.test.ts`
- Modify: `tests/contracts/profile-contract.test.ts`
- Create: `tests/contracts/profile-avatar.test.ts`
- Modify: `src/fsd/pages/profile/ui/ProfilePage.tsx`
- Modify: `src/fsd/pages/profile/model/useProfilePage.ts`
- Modify: `src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx`
- Create: `src/fsd/pages/profile/model/profileAvatar.ts`

**Interfaces:**
- `readProfileAvatar(userKey): string | null`
- `saveProfileAvatar(userKey, dataUrl): void`
- `validateProfileAvatarFile(file): string | null` returns a Korean error message or `null`.
- `ProfileConsultations` accepts reservations and cancellation only; no history/memo props or UI.

- [ ] **Step 1: Write failing profile contracts** asserting no hero copy, no 상담 기록/history detail/memo UI, presence of a profile-image file input/change control, and local avatar helper behavior.
- [ ] **Step 2: Run focused profile contracts and confirm RED.**
- [ ] **Step 3: Implement local avatar validation/persistence and wire it into `useProfilePage`/`ProfilePage`.** Accept `image/*`, cap at 2 MiB, convert with `FileReader`, save per current student key, and fall back to `/profileIcon.svg`.
- [ ] **Step 4: Reduce `ProfileConsultations` to current reservation summary/detail/cancel only.**
- [ ] **Step 5: Run focused profile contracts and confirm GREEN.**
- [ ] **Step 6: Commit** with `feat : add editable student profile photo` and `refactor : simplify profile consultations` if the diff cleanly separates.

### Task 5: Full verification and Vercel Preview deployment

**Files:** all changed files from Tasks 1-4 plus the approved spec/plan.

- [ ] **Step 1: Run `npm run harness:verify`; require 17/17, all contracts, lint, FSD, convention, diff check, and production build to pass.**
- [ ] **Step 2: Review `git diff origin/develop...HEAD` and working-tree diff; confirm Teacher/Admin changed-file count is zero.**
- [ ] **Step 3: Commit spec/plan if not already included, leaving a clean tree.**
- [ ] **Step 4: Run `npm run harness:ready` on the clean committed branch.**
- [ ] **Step 5: Push `test/vercel-preview`, verify local/remote SHA equality, wait for Vercel deployment success, and open the stable preview URL.**
