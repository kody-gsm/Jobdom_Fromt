# Jobdam FSD & Convention Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FSD architecture, code convention, Teacher migration policy를 Codex 하네스의 실행 가능한 규칙으로 만든다.

**Architecture:** Next.js route는 root `app/`에 유지하고 FSD layer는 `src/fsd/`에 둔다. 문서 규칙과 TypeScript 기반 boundary/convention checks를 `harness:verify`에 연결한다.

**Tech Stack:** Next.js 16, TypeScript, Node.js built-ins, npm, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-09-03-jobdam-fsd-convention-design.md`

## Global Constraints

- Backend/API contract는 변경하지 않는다.
- Teacher 기능/디자인/business behavior는 유지하고 FSD 구조로만 이전한다.
- Student frontend는 기능과 API contract를 보존하며 내부 구현과 디자인을 재작성할 수 있다.
- FSD layer order는 `app > pages > widgets > features > entities > shared`이다.
- 새 런타임 dependency를 추가하지 않는다.

---

### Task 1: Policy and convention layer

**Files:**
- Create: `docs/harness/CODE_CONVENTION.md`
- Modify: `AGENTS.md`
- Modify: `docs/harness/ARCHITECTURE.md`
- Modify: `docs/harness/REFACTORING_RULES.md`
- Modify: `docs/harness/FEATURE_CONTRACT.md`
- Modify: `docs/harness/CODE_REVIEW.md`
- Modify: `docs/harness/FUNCTION_RULES.md`
- Modify: `scripts/harness/harness-config-check.ts`

**Interfaces:**
- Produces: Codex가 읽는 FSD/code convention/migration policy.

- [ ] `harness-config-check.ts`에 `CODE_CONVENTION.md` 필수 검사를 먼저 추가하고 실패를 확인한다.
- [ ] 기존 정책 문서를 FSD 6-layer와 migration matrix 기준으로 갱신한다.
- [ ] `CODE_CONVENTION.md`에 naming, TypeScript, React, import, API, error 규칙을 작성한다.
- [ ] config check를 다시 실행해 통과를 확인한다.
- [ ] `git diff --check` 후 `chore : define fsd and code conventions`로 커밋한다.

### Task 2: Executable FSD boundaries

**Files:**
- Create: `scripts/harness/fsd-boundary-check.ts`
- Create: `scripts/harness/fsd-boundary-check.test.ts`
- Create: `scripts/harness/convention-check.ts`
- Create: `scripts/harness/convention-check.test.ts`
- Modify: `tsconfig.json`
- Modify: `package.json`
- Modify: `scripts/harness/harness-config-check.ts`
- Modify: `scripts/harness/verify.ts`

**Interfaces:**
- Produces: `harness:fsd`, `harness:convention`, `@fsd/*` alias.
- FSD check consumes TypeScript/JavaScript import specifiers under `src/fsd`.

- [ ] FSD import validation unit tests를 작성해 module missing으로 RED를 확인한다.
- [ ] layer direction, same-layer cross-slice, deep import/public API 규칙을 최소 구현한다.
- [ ] convention path/source unit tests를 RED로 만들고 kebab-case/segment/generic dump-file 규칙을 구현한다.
- [ ] `@fsd/*` alias와 npm scripts를 추가한다.
- [ ] 두 checks를 `harness:verify`에 연결하고 unit/config tests를 통과시킨다.
- [ ] 전체 verify 후 `chore : enforce fsd architecture boundaries`로 커밋한다.

### Task 3: Teacher migration gate

**Files:**
- Modify: `scripts/harness/changed-files-check.ts`
- Modify: `scripts/harness/changed-files-check.test.ts`
- Modify: `.github/workflows/harness.yml`
- Modify: `docs/harness/WORKFLOW.md`

**Interfaces:**
- Default branches keep Teacher paths protected.
- `refactor/teacher-fsd*` or `HARNESS_TEACHER_MIGRATION=1` enables behavior-preserving Teacher migration mode.

- [ ] migration-mode unit tests를 먼저 추가하고 실패를 확인한다.
- [ ] branch/env 기반 Teacher migration permission을 구현한다.
- [ ] CI가 teacher-fsd branch에서만 migration mode를 전달하도록 설정한다.
- [ ] WORKFLOW에 Teacher migration 전 characterization/regression 고정 규칙을 추가한다.
- [ ] `harness:verify`와 build를 다시 실행한다.
- [ ] `chore : add teacher fsd migration gate`로 커밋한다.

## Final verification

- [ ] `npm run harness:preflight`
- [ ] `npm run harness:fsd`
- [ ] `npm run harness:convention`
- [ ] `npm run harness:scope`
- [ ] `npm run harness:verify`
- [ ] `git diff --check`
- [ ] Push to PR #16 only after all checks pass.
