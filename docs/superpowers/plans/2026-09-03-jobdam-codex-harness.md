# Jobdam Codex Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Codex가 Jobdam에서 정해진 아키텍처, 함수 규칙, API 계약, Git/PR 절차와 검증 게이트를 강제로 따르게 한다.

**Architecture:** `AGENTS.md`를 진입점으로 하고 `docs/harness`에 상세 정책을 분리한다. `scripts/harness`의 Node/TypeScript 스크립트가 preflight, 보호 경로 검사, 전체 verify를 수행한다. 기존 CI/CD는 유지하고 하네스는 별도 workflow를 추가하지 않는다.

**Tech Stack:** Next.js 16, TypeScript, Node.js built-ins, npm

**Spec:** `docs/superpowers/specs/2026-09-03-jobdam-codex-harness-design.md`

## Global Constraints

- Teacher 페이지는 수정하지 않는다.
- 기존 Backend API 계약을 변경하지 않는다.
- 추가 런타임 의존성을 설치하지 않는다.
- push, PR 생성, merge는 사용자 요청 전 수행하지 않는다.
- PR 템플릿은 사용자가 지정한 한국어 양식을 유지한다.

---

### Task 1: Harness policy layer

**Files:**
- Create: `AGENTS.md`
- Create: `docs/harness/ARCHITECTURE.md`
- Create: `docs/harness/WORKFLOW.md`
- Create: `docs/harness/FUNCTION_RULES.md`
- Create: `docs/harness/REFACTORING_RULES.md`
- Create: `docs/harness/API_CONTRACT.md`
- Create: `docs/harness/FEATURE_CONTRACT.md`
- Create: `docs/harness/CODE_REVIEW.md`
- Modify: `.gitignore`
- Test: `scripts/harness/harness-config-check.ts`

**Interfaces:**
- Produces: repository policy files consumed by Codex and later checks.

- [ ] Write `harness-config-check.ts` asserting required policy files exist and `AGENTS.md` is not ignored.
- [ ] Run it and confirm failure because policy files are missing/ignored.
- [ ] Add the minimal policy documents and unignore `AGENTS.md`.
- [ ] Re-run the check and confirm pass.
- [ ] Commit as `chore : add codex harness policies`.
### Task 2: Local safety checks

**Files:**
- Create: `scripts/harness/preflight.ts`
- Create: `scripts/harness/changed-files-check.ts`
- Modify: `scripts/harness/harness-config-check.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `harness:preflight` and `harness:scope` commands.

- [ ] Extend the failing config check to require both npm scripts.
- [ ] Run it and confirm failure.
- [ ] Implement preflight branch/status/conflict reporting with Node built-ins and Git commands.
- [ ] Implement protected-path detection for `app/teacher/**` against a configurable base ref.
- [ ] Add package scripts and confirm the config check passes.
- [ ] Run both commands on the harness branch and confirm success.
- [ ] Commit as `chore : add harness safety checks`.

### Task 3: Verification orchestration

**Files:**
- Create: `scripts/harness/verify.ts`
- Modify: `scripts/harness/harness-config-check.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `harness:verify` command usable locally and from existing CI/CD.

- [ ] Make the config check require `harness:verify` and fail first.
- [ ] Implement sequential execution of lint, API contract, form contract, existing regression checks, scope check, and build with fail-fast status reporting.
- [ ] Add the npm script and confirm config check passes.
- [ ] Run `harness:verify` and record any baseline environment failure separately from code failures.
- [ ] Commit as `chore : add harness verification gate`.
### Task 4: Pull request integration

**Files:**
- Create: `.github/pull_request_template.md`
- Modify: `scripts/harness/harness-config-check.ts`

**Interfaces:**
- Consumes: `npm run harness:verify` from Task 3.
- Produces: fixed Korean PR template without duplicating existing CI/CD.

- [ ] Extend config check to assert exact required PR headings and prevent a duplicate harness workflow.
- [ ] Add the Korean PR template exactly as approved by the user.
- [ ] Keep existing CI/CD untouched; expose `npm run harness:verify` as the integration command.
- [ ] Re-run config check and full verification.
- [ ] Review `git diff --check`, protected paths, and final diff.
- [ ] Commit as `chore : add harness pr template`.

## Final verification

- [ ] `node --no-warnings --experimental-strip-types scripts/harness/harness-config-check.ts`
- [ ] `npm run harness:preflight`
- [ ] `npm run harness:scope`
- [ ] `npm run harness:verify`
- [ ] `git diff --check`
- [ ] Confirm no `app/teacher/**` file changed.
- [ ] Do not push until the user explicitly requests it.