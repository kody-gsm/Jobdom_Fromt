# Admin FSD Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve the administrator student-sync workflow while moving `/admin` to FSD.

**Architecture:** `features/sync-students` owns the authenticated POST action. `pages/admin` owns result/error UI and relies on the existing global AuthGate for ADMIN-only routing. The Next route becomes an adapter.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing harness.

**Spec:** `docs/harness/FRONTEND_CONTRACT_MAP.md`

## Constraints
- Preserve `POST /admin/students/sync`.
- Preserve synced count and run-time feedback.
- Preserve 401/403 administrator-only error semantics.
- Keep Teacher files unchanged.
- Do not duplicate the global `/admin` role guard in the page.
