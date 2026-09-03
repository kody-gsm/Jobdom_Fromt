# FSD Shared API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 API/session 동작을 바꾸지 않고 HTTP transport 책임만 `src/fsd/shared/api`로 이동한다.

**Architecture:** `shared/api`는 Backend base URL, HTTP 요청/응답 parsing, `ApiError`만 소유한다. 기존 `app/utils/api.ts`는 session/reissue orchestration과 domain API facade를 유지하고 새 shared transport를 호출한다.

**Tech Stack:** Next.js 16, TypeScript, Node.js built-ins

**Spec:** `docs/superpowers/specs/2026-09-03-jobdam-fsd-convention-design.md`

## Global Constraints

- endpoint, method, payload, auth/session/reissue semantics를 변경하지 않는다.
- Teacher 및 기존 page import를 변경하지 않는다.
- `app/utils/api.ts` public exports를 유지한다.
- 새 runtime dependency를 추가하지 않는다.

---

### Task 1: Shared HTTP transport

**Files:**
- Create: `src/fsd/shared/api/ApiError.ts`
- Create: `src/fsd/shared/api/client.ts`
- Create: `src/fsd/shared/api/index.ts`
- Create: `scripts/harness/shared-api-client.test.ts`
- Modify: `scripts/harness/verify.ts`
- Modify: `scripts/harness/verify.test.ts`
**Interfaces:**
- `ApiError(message, status)` keeps current public error shape.
- `request<T>(path, init, { accessToken? })` performs one HTTP request only; session retry is not its responsibility.

- [ ] Write a failing unit test importing `../../src/fsd/shared/api/index.ts` and checking JSON response, Bearer header, 204 response, network error, and 500 error mapping.
- [ ] Run the test and confirm module-not-found RED.
- [ ] Implement `ApiError`, response error parsing, base URL normalization, JSON/text/204 handling, FormData content-type behavior, and optional Bearer token.
- [ ] Export only `ApiError` and `request` from `src/fsd/shared/api/index.ts`.
- [ ] Add the unit test to `harness:verify` and make verify-order tests pass.
- [ ] Run the new unit test, FSD boundary, convention check, and full harness verify.

### Task 2: Legacy API facade migration

**Files:**
- Modify: `app/utils/api.ts`
- Test: `scripts/api-contract-check.ts`

**Interfaces:**
- Existing page/Teacher imports from `@/app/utils/api` stay unchanged.
- Existing `ApiError` export stays available from `@/app/utils/api`.
- Existing 401 → reissue → one retry behavior stays in the legacy facade.

- [ ] Run existing `api-contract-check.ts` before migration to confirm baseline GREEN.
- [ ] Replace duplicate HTTP parsing/fetch code in `app/utils/api.ts` with `shared/api.request`.
- [ ] Keep reissue/session orchestration in `app/utils/api.ts` and call the raw shared request for `/auth/reissue`.
- [ ] Re-export `ApiError` from the legacy facade.
- [ ] Run `api-contract-check.ts` and auth/session regression checks.
- [ ] Run `npm run harness:verify` and `git diff --check`.
- [ ] Commit as `refactor : extract shared api transport`.
