# Forms FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 공개 신청 폼 목록/응답/기존 제출 조회 기능을 FSD 구조로 이전한다.

**Architecture:** 폼 타입, 답변 변환 규칙, API factory는 `entities/form`; 실제 응답 작성/제출 UI는 `features/submit-form`; 목록과 상세 조립은 `pages/forms`, `pages/form-detail`에 둔다. `app/utils/formAnswers.ts`는 compatibility facade로 남긴다.

**Tech Stack:** Next.js 16, React 19, TypeScript, FSD, Node contract checks

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Global Constraints
- `GET /form`, `GET /form/{id}`를 유지한다.
- `GET/POST /student/form/{id}/submission`을 유지한다.
- 기존 제출 조회 404는 미제출 상태로 처리한다.
- 필수 질문 validation과 answer payload 변환을 유지한다.
- 제출 409는 `이미 제출한 폼입니다.`로 표시한다.
- 모든 기존 질문 타입을 유지한다.
- Teacher 파일은 수정하지 않는다.

### Task 1: Form entity contracts
- Move types and answer rules into `entities/form`.
- Add request-injected public form API factory.
- Keep legacy answer utility as facade and update executable contract tests.

### Task 2: Forms list and submit feature
- Migrate list to `pages/forms` with SiteHeader.
- Build `submit-form` feature for all question types and existing submission rendering.

### Task 3: Detail page adapters and verification
- Migrate `/forms/[id]` to `pages/form-detail`.
- Add FSD/endpoint/behavior contract tests to harness.
- Run full verify/build and commit logical units.
