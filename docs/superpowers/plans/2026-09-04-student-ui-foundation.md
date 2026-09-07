# Student UI Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the smallest reusable UI foundation needed for the new Student frontend design.

**Architecture:** Add new primitives under `shared/ui` without changing existing Student UI components. Put Student-only navigation in `widgets/student-header`. Preserve all API/auth contracts and keep Teacher/Admin source untouched.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Feature-Sliced Design

**Spec:** `docs/superpowers/specs/2026-09-04-student-ui-foundation-design.md`

## Global Constraints

- Teacher/Admin page/widget/feature actual source diff must stay zero.
- Existing `Button.tsx` and `Input.tsx` stay unchanged in this PR.
- No API endpoint, method, request/response or auth contract changes.
- New abstractions require an observed repeated UI responsibility.
- No generic `utils.ts` or speculative helper layer.

---
### Task 1: Student shared UI primitives

**Files:**
- Create `src/fsd/shared/ui/ActionButton.tsx`
- Create `src/fsd/shared/ui/TextField.tsx`
- Create `src/fsd/shared/ui/TextAreaField.tsx`
- Create `src/fsd/shared/ui/SegmentedTabs.tsx`
- Create `src/fsd/shared/ui/ContentCard.tsx`
- Modify `src/fsd/shared/ui/index.ts`
- Test `tests/contracts/student-ui-foundation.test.ts`

- [x] Write the failing public UI contract.
- [x] Verify RED because the new primitives do not exist.
- [x] Implement only the five new primitives and exports.
- [x] Run the contract, FSD boundary, and convention checks.
- [x] Commit as `feat : add student ui primitives`.

### Task 2: Student header widget

**Files:**
- Create `src/fsd/widgets/student-header/ui/StudentHeader.tsx`
- Create `src/fsd/widgets/student-header/model/navigation.ts`
- Create `src/fsd/widgets/student-header/index.ts`
- Test `tests/contracts/student-header.test.ts`
- [x] Write the failing Student header contract.
- [x] Verify RED because the widget does not exist.
- [x] Implement the header and pure active-route rule.
- [x] Run the header contract, FSD boundary, and convention checks.
- [x] Commit as `feat : add student navigation header`.

### Task 3: Foundation scope verification

**Files:**
- Document `docs/superpowers/specs/2026-09-04-student-ui-foundation-design.md`
- Document `docs/superpowers/plans/2026-09-04-student-ui-foundation.md`

- [x] Run every contract test.
- [x] Run Harness verification and production build.
- [x] Run `git diff --check`.
- [x] Verify Teacher/Admin source diff from base `109aa56` is empty.
- [x] Verify existing `shared/ui/Button.tsx` and `shared/ui/Input.tsx` diff is empty.
- [ ] Commit the design and plan documentation.

**Decision:** Teacher/Admin freeze is a temporary redesign scope constraint. It is verified with VCS diff rather than encoded as a permanent Harness or long-lived contract rule.
