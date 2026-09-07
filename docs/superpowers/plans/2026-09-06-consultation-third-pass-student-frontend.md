# Consultation Third-Pass Student Frontend Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Improve only the student consultation request UI without modifying backend, Teacher/Admin, home, profile, or shared UI code.

**Architecture:** Keep all behavioral changes inside `features/submit-consultation`. Reuse existing shared controls through their public props. Use the existing backend contracts only; do not add endpoints or change server state handling.

**Tech Stack:** Next.js 16.2.7, React 19, TypeScript, Tailwind CSS v4, Node contract tests.

**Spec:** `docs/superpowers/specs/2026-09-06-consultation-third-pass-design.md`, constrained by the user's frontend-only scope override.

## Scope Override

- DO modify only `src/fsd/features/submit-consultation/**` and focused student consultation contract tests.
- DO NOT modify backend files.
- DO NOT modify Teacher/Admin files.
- DO NOT modify home/profile or unrelated student features.
- DO NOT modify shared UI components; consume existing `error`, `className`, and native DOM props only.
- Keep existing backend `WAITING -> RESERVED` behavior; student UI must call submission a request, not a confirmed reservation.
- Do not invent unavailable data. Only a backend conflict/locked response may mark the attempted slot `예약 불가` for the current browser session.

## Task 1: Validation target and focus behavior

**Files:**
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Modify: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Test: `tests/contracts/student-consultation-error-focus.test.ts`

- [ ] Write RED contract for `title|content|teacher|date|period` target mapping, red border markers, `scrollIntoView`, and `focus`.
- [ ] Run the focused contract and confirm the expected failure.
- [ ] Implement local error target state/ref focusing only inside submit-consultation.
- [ ] Clear only the active target when its value changes.
- [ ] Run focused contract GREEN and commit.

## Task 2: Student consultation visual third pass

**Files:**
- Modify: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Test: `tests/contracts/student-consultation-third-pass.test.ts`

- [ ] Write RED assertions for two-column desktop layout, main `#02C551`, removed permission warning, and slot-row UI.
- [ ] Assert `예약 가능` and `선택됨` are absent from source.
- [ ] Implement the image-inspired content/schedule card layout without changing StudentHeader or page shell.
- [ ] Keep mobile layout single-column.
- [ ] Run focused contract GREEN and commit.

## Task 3: Student request semantics and teacherId payload

**Files:**
- Modify: `src/fsd/features/submit-consultation/api/consultation.ts`
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Modify: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Test: `tests/contracts/student-consultation-submit-contract.test.ts`

- [ ] Write RED assertions that `/student/teachers` is read inside the submit-consultation feature and submitted JSON includes `teacherId`.
- [ ] Keep teacher selection inside the student form; do not modify shared user/entity APIs.
- [ ] Change success copy to `상담 신청 요청을 보냈습니다`; do not describe POST success as confirmed reservation.
- [ ] Do not locally force the request into an approved/reserved state after POST.
- [ ] On a server conflict/locked error for the selected slot, remember that exact teacher/date/period key locally and render only `예약 불가`; clear the selected time and focus the period group.
- [ ] Run focused contract GREEN and commit.

## Task 4: Harness and scope gate

**Files:**
- No new production scope.

- [ ] Run `npm run harness:contracts` and confirm all contracts pass.
- [ ] Run `node --no-warnings --experimental-strip-types scripts/harness/verify.ts` and confirm all 17 steps pass.
- [ ] Run `git diff --check`.
- [ ] Prove changed production paths are only `src/fsd/features/submit-consultation/**`.
- [ ] Prove backend repository remains clean and Teacher/Admin/home/profile/shared UI have zero diffs.
- [ ] Commit any final test-only cleanup, then push only `test/vercel-preview`.
