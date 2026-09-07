# Recruit FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 취업 공고 목록/상세 기능과 API 계약을 유지하면서 FSD 구조로 이전한다.

**Architecture:** 공고 타입과 API factory는 `entities/recruit`, 링크 복사 행동은 `features/copy-recruit-link`, 목록/상세 데이터 wiring과 화면 조립은 각각 `pages/recruit`, `pages/recruit-detail`에 둔다. 기존 Next route는 FSD page adapter로 축소한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, FSD, Node contract checks

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints

- `GET /recruit`, `GET /recruit/{id}` 계약을 변경하지 않는다.
- 401 목록 조회 오류는 로그인 안내를 유지한다.
- 상세 화면의 신청 링크 복사 대상은 `/recruit/{id}/apply`를 유지한다.
- `/recruit/{id}/apply`는 `/forms` redirect를 유지한다.
- Teacher 파일은 수정하지 않는다.

### Task 1: Recruit entity and API contract
- Create `entities/recruit` types and request-injected API factory.
- RED/GREEN exact list/detail endpoints and public API.

### Task 2: Recruit list/detail FSD pages
- Rebuild list and detail UI with `SiteHeader`.
- Keep empty/loading/error behavior and application navigation.
- Move clipboard behavior into `features/copy-recruit-link`.

### Task 3: Route adapters and verification
- Reduce `/recruit` and `/recruit/[id]` routes to FSD adapters.
- Keep `/recruit/[id]/apply` redirect routing-only.
- Add executable contract checks, run full harness/build, commit.
