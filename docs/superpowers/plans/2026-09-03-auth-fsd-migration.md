# Auth FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 로그인, 회원가입, 비밀번호 재설정을 기존 API/validation/session 계약을 유지한 채 FSD 구조로 이전한다.

**Architecture:** 사용자 credential/session 규칙은 `entities/user`, 사용자 행동 API는 각 `features/*`, 화면 조립은 `pages/*`, Next route는 얇은 adapter로 둔다. 기존 `app/utils/*`는 legacy facade로 유지한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, FSD, Node contract checks

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints

- Backend endpoint/method/payload를 변경하지 않는다.
- remember-login storage key와 role redirect 의미를 유지한다.
- 로그인은 GSM 이메일 형식을 프론트에서 강제하지 않는다.
- 회원가입/비밀번호 재설정은 기존 GSM email/password 정책을 유지한다.
- Teacher 파일은 수정하지 않는다.
- root auth `page.tsx`는 FSD page adapter만 남긴다.

### Task 1: User auth rules

**Files:**
- Create: `src/fsd/entities/user/model/credentials.ts`
- Create: `src/fsd/entities/user/model/auth-errors.ts`
- Modify: `src/fsd/entities/user/index.ts`
- Test: existing auth validation/error contract checks

- [ ] Move GSM email/password rules into the user entity.
- [ ] Move auth server-message mapping into the user entity.
- [ ] Keep legacy utility files as re-export facades.
- [ ] Run auth validation/error checks.

### Task 2: Shared auth UI

**Files:**
- Create: `src/fsd/shared/ui/Button.tsx`
- Create: `src/fsd/shared/ui/Input.tsx`
- Create: `src/fsd/shared/ui/index.ts`

- [ ] Recreate the current generic Button/Input contracts in shared UI.
- [ ] Keep visual behavior compatible while making width controlled by callers.
- [ ] Run FSD/convention checks.

### Task 3: Auth feature APIs

**Files:**
- Create: `src/fsd/features/login/api/login.ts`
- Create: `src/fsd/features/signup/api/signup.ts`
- Create: `src/fsd/features/reset-password/api/resetPassword.ts`
- Add each slice public `index.ts`.

- [ ] Call the exact existing auth endpoints through `shared/api`.
- [ ] Persist login session through `entities/user`.
- [ ] Keep request payloads unchanged.
- [ ] Add executable contract tests for the feature APIs.

### Task 4: Auth FSD pages and route adapters

**Files:**
- Create: `src/fsd/pages/login`, `signup`, `forgot-password`.
- Modify: `app/(auth)/*/page.tsx` into thin adapters.
- Modify: source-based auth checks to inspect FSD page implementations.

- [ ] Preserve validation, timers, remember-login and role redirects.
- [ ] Use FSD shared UI and feature/entity public APIs only.
- [ ] Run `npm run harness:verify` and production build.
- [ ] Commit the migration as logical units.
