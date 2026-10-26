# 회원가입 약관 동의 흐름 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 반응형 약관 동의 모달에서 `동의하기`를 누르면 해당 약관이 자동 체크되고, 회원가입 화면의 필수 동의 흐름을 자연스럽게 완성한다.

**Architecture:** 최신 `origin/main`에서 분기한 `fix/signup-consent-flow` 프론트 worktree에서 작업한다. 약관 문서와 순수 판정 함수는 signup model에 두고, 모달은 동의 결과를 콜백으로 반환한다. 백엔드와 API 계약은 변경하지 않는다.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-10-26-signup-consent-flow-design.md`

## Global Constraints

- 기존 Next.js App Router와 FSD 구조를 유지한다.
- 기존 인증 코드·비밀번호 가입 계약은 변경하지 않는다.
- `main`에는 직접 작업하지 않고 `fix/signup-consent-flow` worktree에서 작업한다.
- 백엔드 저장소와 API 계약은 작업 범위에서 제외한다.

## Review Focus

- 약관 본문이 짧거나 큰 화면에서 스크롤되지 않아도 동의 버튼이 활성화되는가 — consent model 테스트.
- `X`/Escape 닫기와 `동의하기`가 서로 다른 결과를 내는가 — dialog interaction 테스트.
- 320px 수준의 좁은 화면에서도 약관 행과 액션이 겹치지 않는가 — responsive class contract와 수동 렌더 확인.
- 동의하지 않은 필수 항목이 있으면 프론트 회원가입 제출이 막히는가 — signup validation 테스트.

### Task 1: Consent model and client state

**Files:**
- Modify: `src/fsd/features/signup/model/consentContent.ts`
- Modify: `src/fsd/features/signup/model/useSignupForm.ts`
- Test: `tests/unit/authValidationPresentation.test.ts`
- Test: `tests/contracts/signup-behavior.test.ts`

**Interfaces:**
- Produce consent read-state and agreement callbacks while preserving the existing signup API payload.

- [x] **Step 1: Write failing tests** for the short-document initial-ready case and automatic agreement callback.
- [x] **Step 2: Run the focused unit and contract tests** and confirm they fail because the new contract is absent.
- [x] **Step 3: Implement the consent model and client state mapping** without changing the signup API payload.
- [x] **Step 4: Run the focused tests** and confirm they pass.

### Task 2: Modal agreement behavior and responsive UI

**Files:**
- Modify: `src/fsd/features/signup/ui/SignupConsentDialog.tsx`
- Modify: `src/fsd/features/signup/ui/SignupForm.tsx`
- Modify: `src/fsd/features/signup/model/useSignupForm.ts`
- Test: `tests/unit/authValidationPresentation.test.ts`
- Test: `tests/contracts/signup-behavior.test.ts`

**Interfaces:**
- `SignupConsentDialog` consumes `onAgree: () => void`, `onClose: () => void`, `onReadToEnd: () => void`, `hasReadToEnd: boolean`, and returns no bottom close action.
- `useSignupForm` exposes `agreeToConsent(document)` and keeps the selected document state independent.

- [x] **Step 1: Add failing source-contract assertions** for `동의하기`, automatic agreement callback, removal of bottom `닫기`, Escape handling, and responsive action layout.
- [x] **Step 2: Run the focused contract tests** and confirm failure.
- [x] **Step 3: Implement the modal flow**: large disabled-until-ready `동의하기`, X/Escape cancel close, agreement callback, initial overflow measurement, focus management, and body-scroll locking.
- [x] **Step 4: Implement responsive consent rows** with a full-size `자세히 보기` control and consistent `개인정보 수집·이용 동의` copy.
- [x] **Step 5: Run focused tests and inspect the responsive classes/build output** for desktop and narrow mobile widths.

### Task 3: Full verification and review

**Files:**
- Modify only files from Tasks 1–2 if verification exposes a scoped defect.

- [x] **Step 1: Run frontend unit/contract checks.**
- [x] **Step 2: Run `npm run harness:verify` in the frontend worktree.**
- [x] **Step 3: Review the diff for scope, responsive classes, accessibility, and preservation of unrelated changes.**
- [x] **Step 4: Report any pre-existing verification failures separately from changes made here.**
