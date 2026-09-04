# Home FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Student Home의 애니메이션, 서비스 이동, 공통 헤더 기능을 보존하면서 FSD 구조로 이전한다.

**Architecture:** 로그아웃은 `features/logout`, 공통 사이트 헤더는 `widgets/site-header`, 홈 서비스 목록은 `widgets/home-services`, 홈 전환 상태는 `pages/home/model`, 화면 조립은 `pages/home/ui`가 담당한다. Next `app/page.tsx`는 FSD page adapter만 남긴다.

**Tech Stack:** Next.js 16, React 19, TypeScript, FSD, Node contract checks

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints

- `/counsel?type=career`, `/counsel?type=general`, `/recruit` 이동 의미를 유지한다.
- hero → hero-exit → services 전환 시간 1200ms + 1000ms + 600ms를 유지한다.
- 로그아웃 시 session을 먼저 비우고 `/auth/logout` 계약을 유지한다.
- 기존 CI/CD와 Teacher 파일은 수정하지 않는다.
- 디자인 클래스는 회귀 계약으로 고정하지 않는다.

---

### Task 1: Logout feature and student header

**Files:**
- Create: `src/fsd/features/logout/api/logout.ts`
- Create: `src/fsd/features/logout/index.ts`
- Create: `src/fsd/widgets/site-header/ui/SiteHeader.tsx`
- Create: `src/fsd/widgets/site-header/index.ts`
- Modify: `app/components/organisms/Header.tsx`

**Interfaces:**
- Consumes: `shared/api.request`, `entities/user.getSession`, `entities/user.clearSession`.
- Produces: `logout(): Promise<void>`, `SiteHeader` public API.

- [ ] Write a failing executable logout/header contract test.
- [ ] Implement logout with the existing `/auth/logout` payload contract.
- [ ] Move Header behavior into `widgets/site-header` and leave legacy Header as a re-export facade.
- [ ] Run FSD/convention and auth/session regression checks.
- [ ] Commit the independently working header/logout migration.

### Task 2: Home stage model and services widget

**Files:**
- Create: `src/fsd/pages/home/model/useHomeStage.ts`
- Create: `src/fsd/widgets/home-services/ui/HomeServices.tsx`
- Create: `src/fsd/widgets/home-services/index.ts`
- Test: `scripts/harness/home-fsd-page.test.ts`

**Interfaces:**
- Produces: `useHomeStage()` returning `{ stage, isHeroVisible, isServicesStage }`.
- Produces: `HomeServices({ visible: boolean })` with career/general/recruit links.

- [ ] Write the failing Home FSD structure/behavior test.
- [ ] Move stage timers into the page model without changing timing.
- [ ] Implement service navigation in the widget with the same href contracts.
- [ ] Run the focused Home contract test.

### Task 3: Home page adapter

**Files:**
- Create: `src/fsd/pages/home/ui/HomePage.tsx`
- Create: `src/fsd/pages/home/index.ts`
- Modify: `app/page.tsx`
- Modify: `scripts/home-stage-transition-check.ts`

- [ ] Compose `SiteHeader`, hero UI and `HomeServices` in the FSD page.
- [ ] Replace `app/page.tsx` with a thin `@fsd/pages/home` adapter.
- [ ] Change the legacy Home regression test to follow the new source-of-truth and avoid design locking.
- [ ] Run `npm run harness:verify`, `git diff --check`, then commit.
