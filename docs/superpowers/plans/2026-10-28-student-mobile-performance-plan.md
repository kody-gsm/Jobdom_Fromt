# Student Mobile Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모바일 오버레이 위치 오류와 인증/반복 조회로 인한 초기 렌더링 지연을 백엔드 변경 없이 해결한다.

**Architecture:** AuthGate는 확인 중 children을 유지하고, 인증 GET 요청은 shared transport에서 세션별 in-flight dedupe와 30초 메모리 캐시를 적용한다. 알림 목록은 열기 시점에 지연 요청하며, 각 floating UI는 모바일 viewport-safe CSS를 사용한다.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, 기존 Node unit harness

**Spec:** `docs/superpowers/specs/2026-10-28-student-mobile-performance-design.md`

## Global Constraints

- 백엔드 파일과 API 계약을 변경하지 않는다.
- 기존 FSD layer와 public API 규칙을 유지한다.
- 일반 작업 PR의 base는 `develop`이다.
- 커밋은 하나의 논리적 이유로 나눈다.

## Review Focus

- 인증 확인 중 초기 HTML이 빈 화면이 되지 않는지: AuthGate presentation test
- 같은 인증 GET 요청이 동시에 한 번만 전송되는지: request cache unit test
- mutation/세션 종료 후 이전 사용자 데이터가 남지 않는지: cache invalidation unit test
- 320px viewport에서 필터·알림·토스트가 좌우로 잘리지 않는지: mobile browser smoke check
- 모바일 헤더 두 줄과 알림 패널/토스트가 서로 겹치지 않는지: mobile browser smoke check

### Task 1: 인증 게이트와 GET 요청 캐시

**Files:**
- Create: `src/fsd/shared/lib/requestCache.ts`
- Create: `src/fsd/app/auth-gate/model/authGatePresentation.ts`
- Modify: `src/fsd/shared/lib/index.ts`
- Modify: `src/fsd/shared/api/createAuthenticatedRequest.ts`
- Modify: `src/fsd/app/auth-gate/ui/AuthGate.tsx`
- Test: `tests/unit/requestCache.test.ts`
- Test: `tests/unit/authGatePresentation.test.ts`

- [ ] Write failing tests for in-flight dedupe, TTL reuse, invalidation, and rendering while auth status is checking.
- [ ] Run the two focused tests and confirm the expected failures.
- [ ] Implement the smallest cache and auth presentation helpers.
- [ ] Integrate authenticated GET caching and non-blocking AuthGate behavior without changing API contracts.
- [ ] Run the focused tests, `npm run typecheck`, and commit as `fix : reduce auth and duplicate read delay`.

### Task 2: Notification request timing and mobile floating UI

**Files:**
- Modify: `src/fsd/features/notifications/model/NotificationContext.tsx`
- Modify: `src/fsd/features/notifications/ui/NotificationPanel.tsx`
- Modify: `src/fsd/features/notifications/ui/NotificationToast.tsx`
- Modify: `src/fsd/features/notifications/ui/NotificationBell.tsx`
- Modify: `src/fsd/pages/home/ui/HomePage.tsx`
- Test: `tests/unit/notificationPresentation.test.ts` when a pure presentation helper is needed

- [ ] Add lazy notification-list loading when the panel first mounts, while keeping unread-count refresh and SSE behavior.
- [ ] Make the panel mobile viewport-safe and place it below the mobile header instead of aligning to the bell’s narrow wrapper.
- [ ] Make toast containers fit `viewport - 2rem` and start below the mobile header.
- [ ] Align the home success toast with the same mobile-safe spacing.
- [ ] Run focused notification tests/typecheck and commit as `fix : stabilize mobile notification layout`.

### Task 3: Filter menus and header navigation responsiveness

**Files:**
- Modify: `src/fsd/shared/ui/ListFilterMenu.tsx`
- Modify: `src/fsd/shared/ui/ListMultiFilterMenu.tsx`
- Modify: `src/fsd/widgets/student-header/ui/StudentHeader.tsx`
- Modify: `src/fsd/widgets/teacher-header/ui/TeacherHeader.tsx`
- Modify: `src/fsd/widgets/site-header/ui/SiteHeader.tsx` only if the shared notification placement requires it

- [ ] Anchor mobile filter menus from the left/full available content area, retain desktop right alignment, and add bounded height with internal scrolling.
- [ ] Add outside-click/Escape dismissal so multiple menus cannot remain open on mobile.
- [ ] Make student and teacher nav labels shrink or wrap without horizontal collision, and reduce mobile action spacing where needed.
- [ ] Run typecheck and a 320px/375px browser smoke check for recruit, forms, and header actions.
- [ ] Commit as `fix : repair mobile filters and header spacing`.

### Task 4: Full verification and review

- [ ] Run `npm run harness:verify` from the worktree.
- [ ] Inspect the diff to confirm only frontend files and planned docs changed.
- [ ] Run `npm run harness:ready` only after commits are clean and the user requests push/PR.
- [ ] Request code review before any merge or PR completion claim.
