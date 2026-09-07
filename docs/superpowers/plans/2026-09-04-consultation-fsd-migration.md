# Consultation FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `/counsel`의 상담 신청 기능과 API 계약을 보존하면서 FSD 구조와 새 UI로 재작성한다.

**Architecture:** 상담 도메인 규칙과 API factory는 `entities/consultation`, 실제 인증 요청 wiring과 신청 행동은 `features/submit-consultation`, 화면 조립은 `pages/counsel`에 둔다. Next `app/counsel/page.tsx`는 FSD page adapter만 남긴다.

**Tech Stack:** Next.js 16, React 19, TypeScript, FSD, Node contract checks

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints

- `/student/course`, `/student/common` endpoint/method/payload를 변경하지 않는다.
- 진로/일반 상담 구분과 `career → course`, `general → common` 매핑을 유지한다.
- 진로 상담 중복 신청 차단을 유지한다.
- 기존 선생님별 예약 가능 시간 규칙을 유지한다.
- 취소 시 toast 없이 `/`로 이동한다.
- Teacher 파일은 수정하지 않는다.

### Task 1: Consultation domain contracts

**Files:**
- Create: `src/fsd/entities/consultation/model/types.ts`
- Create: `src/fsd/entities/consultation/model/rules.ts`
- Create: `src/fsd/entities/consultation/api/createConsultationApi.ts`
- Create: `src/fsd/entities/consultation/index.ts`
- Test: `scripts/harness/consultation-contract.test.ts`

- [ ] RED: test weekday dates, teacher periods, validation, title prefix and exact endpoints.
- [ ] GREEN: implement pure rules and request-injected API factory.
- [ ] Run FSD/convention checks.

### Task 2: Submit consultation feature

**Files:**
- Create: `src/fsd/features/submit-consultation/api/consultation.ts`
- Create: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Create: `src/fsd/features/submit-consultation/index.ts`

- [ ] Wire `requestWithSession` to consultation API factory.
- [ ] Preserve query type, duplicate-career check, timers/toast, submit/cancel behavior.
- [ ] Rebuild the form UI without preserving legacy inline styles.

### Task 3: Counsel FSD page and regression contracts

**Files:**
- Create: `src/fsd/pages/counsel/ui/CounselPage.tsx`
- Create: `src/fsd/pages/counsel/index.ts`
- Modify: `app/counsel/page.tsx`
- Modify: `scripts/counsel-cancel-routing-check.ts`
- Modify: `scripts/harness/verify.ts`
- Modify: `scripts/harness/verify.test.ts`

- [ ] Make the Next route a thin `@fsd/pages/counsel` adapter.
- [ ] Update cancellation regression to inspect the FSD feature rather than legacy page structure.
- [ ] Add the consultation contract test to `harness:verify`.
- [ ] Run `npm run harness:verify` and `git diff --check`.
- [ ] Commit consultation migration as a logical unit.
