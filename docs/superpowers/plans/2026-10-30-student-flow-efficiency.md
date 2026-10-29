# Student flow efficiency implementation plan

> **For agentic workers:** Follow the scoped tasks below, reproduce regressions before fixing them, and report changed paths and verification. Independent domains may run in parallel under the dispatching-parallel-agents workflow.

**Goal:** Prevent student input/session loss and stale data while reducing unnecessary requests and loading delays.

**Architecture:** Keep the existing Next.js App Router and FSD boundaries. Fix lifecycle ownership in each feature; share only transport/cache and deadline primitives. Consume the backend's additive submitted field without changing endpoints or payloads.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing Node unit/contract harness.

**Spec:** `C:/Users/user/Documents/jobdam2/student-frontend-efficiency-audit-2026-10-29.md` (A1–A9, B1–B6, C1–C3).

## Global constraints

- Frontend only; backend is read-only, including its existing dirty test file.
- Branch starts at latest fetched origin/main `684092e50f847c54e5457dec69ab5c2375ddc7fd`.
- Keep ninth-period consultation support from latest main.
- Keep endpoint paths, HTTP methods, request payloads, signup/login validation and roles.
- Preserve FSD public APIs and existing UI meaning; no unrelated redesign.
- No push, PR, merge or deployment in this task.
- Make commits by logical domain after integration and verification.
- Backend origin/develop `89da03a` includes submitted on GET /form and closed form reads. Deployment parity is unverified: retain bounded legacy fallback when submitted is absent.

## Review focus

- A superseded request must never mutate the next session or selection.
- An invalidated in-flight GET must never repopulate the cache.
- Draft hydration and new user edits must not overwrite one another.
- Deadline transitions and visibility resume must refresh status without per-second page rerenders.
- Notification bursts must retain an authoritative trailing count refresh and clean up on logout/unmount.

## Task 1: Consultation lifecycle (A1, A2, A4, B2; A9 availability)

**Files:** `src/fsd/features/submit-consultation/**`, focused consultation regression tests.

- [x] Reproduce same-tab loading lock, slow hydration autosave, draft date waterfall and repeat submit.
- [x] Ignore unchanged tabs; retain immutable draft restoration until teachers/slots resolve; apply valid saved date before availability lookup.
- [x] Lock a successful submit until navigation, use a synchronous in-flight guard and clean up navigation timers.
- [x] Explicit availability retry must fetch current data using existing no-store transport option.
- [x] Run focused regression tests; report paths and command/results.

## Task 2: Auth and avatar lifecycle (A5, A6, A7)

**Files:** `src/fsd/features/login/**`, `src/fsd/features/change-profile-avatar/**`, `src/fsd/entities/user/model/session.ts`, `src/fsd/entities/user/api/sessionRequest.ts`, `src/fsd/shared/lib/useCountdown.ts`, `src/fsd/shared/lib/countdown.ts`, signup/reset code expiry consumers; focused auth tests.

- [x] Reproduce delayed restore success/401 vs manual login/logout/unmount, timer suspension and overlapping avatar writes.
- [x] Guard all restore save/clear operations by session/request generation, including common reissue.
- [x] Derive code expiry from a wall-clock deadline and recheck at resume/submission.
- [x] Serialize avatar writes or synchronously lock selection while upload is pending.
- [x] Run focused auth regression tests; report paths and command/results.

## Task 3: Forms and recruit reads (A3, A8, B1, B4)

**Files:** `src/fsd/features/submit-form/**`, `src/fsd/pages/forms/**`, `src/fsd/entities/form/**`, `src/fsd/pages/recruit/**`, `src/fsd/pages/recruit-detail/**`, focused form/recruit tests; shared `useDeadlineClock.ts` only if needed.

- [x] Reproduce late submission response clearing input and deadline transitions.
- [x] Lock questions until initial submission lookup finishes; preserve upload results and retries.
- [x] Consume boolean submitted from GET /form; show list immediately; only missing metadata uses bounded fallback with safe negative caching tied to account and invalidation.
- [x] Refresh deadline-derived states at relevant deadlines and on visibility resume, without recurring whole-page ticks.
- [x] Skip forms lookup for recruit details with no formId; preserve existing linked-form matching semantics.
- [x] Do not parallelize file uploads without actual speed evidence (C1 conditional); record this decision.
- [x] Run focused regressions; report changed paths and command/results.

## Task 4: Notifications (B5, B6)

**Files:** `src/fsd/features/notifications/**` and its consumers, focused notification tests.

- [x] Reproduce burst unread-count overlap and cross-context update propagation.
- [x] Coalesce pending refreshes with a final authoritative refresh; reject obsolete generations after cleanup.
- [x] Split unread, list, toast, action subscriptions and stabilize action references.
- [x] Preserve lazy list loading, SSE reconnect behavior and existing read/delete UI.
- [x] Run focused notification tests; report changed paths and command/results.

## Task 5: Cache freshness and bounded transport (A9, B3, C2, C3)

**Files:** `src/fsd/shared/api/{client,createAuthenticatedRequest}.ts`, `src/fsd/shared/lib/requestCache.ts`, `src/fsd/widgets/home-services/**`, `src/fsd/pages/profile/**`, focused transport/cache tests.

- [x] Add failing tests for domain invalidation, fresh event reload, bounded cache retention and timeout/body stalls.
- [x] Invalidate only domains affected by known mutations; retain conservative invalidation for unknown mutations. Notification ticket must not clear unrelated data.
- [x] Event-driven home/profile refresh uses no-store; ordinary navigation retains cache reuse.
- [x] Replace retained generation-map keys with in-flight identity checks; prune expired values and bound retained entries.
- [x] Apply bounded request lifetimes covering body parsing, preserve caller cancellation and avoid cancelling shared requests from one subscriber.
- [x] Run targeted cache/transport tests and review interaction with session generation guards.

## Task 6: Integration and verification

- [x] Register meaningful new tests in the existing harness, update affected contract assertions and contract documentation.
- [x] Review the combined diff against the audit, new backend contract and React quality checklist.
- [x] Run full `npm run harness:verify`; investigate every failure.
- [x] Obtain independent whole-branch review; address material regressions with focused tests.
- [x] Commit by consultation, auth/avatar, form/recruit, notification, cache/transport and integration domains.
- [x] Report verified scope and limitations, including unmeasured mobile timings and conditional upload optimization.

## Execution record

- Preflight passed; baseline `npm run check:unit` passed before implementation.
- Task 5 regression `shared-request-resilience.test.ts`: initial failure proved unrelated GET was evicted by ticket POST (`2 !== 1`); scoped invalidation, force refresh, bounded LRU, in-flight invalidation, session replacement/rotation, stalled response body and caller cancellation now pass.
- Task 5 existing request/cache/consultation/recruit API and home/profile regression checks pass. Final full harness remains required after all workers complete.
- Ruling: preserve serial multi-file uploads (C1) until real network timing justifies concurrency; this avoids speculative server load and preserves successful-upload reuse.
- Ruling: no extra negative submission-status cache for legacy servers; current metadata removes the N+1 path, and a four-request fallback preserves compatibility without a second account-scoped cache to invalidate.
- Task ownership: consultation (Dirac), auth/avatar (Curie), forms/recruit (Jason), notifications (Peirce); parent owns shared request/cache and final integration. Workers never stage or commit.
- Integrated regressions: consultation 18/18, auth/avatar/reissue 33/33, forms/recruit 19/19, notifications 17/17. Shared request regression runs with contracts; matching React renderer is pinned as a dev dependency and uses no machine-specific runtime path.
- Full `npm run harness:verify`: 19/19 steps passed, including 112/112 contract files, changed-file lint (one existing img warning), FSD/convention/diff checks, typecheck and production build. Log: `C:/Users/user/Documents/jobdam2/student-efficiency-verify.log`.
- Backend working tree still contains only its pre-existing modified `CommonServiceTest.java`; no backend source changes were made.
- Independent review inspected all 38 production files and reproduced three Important races: draft edits not persisted during failed/pending restoration, login redirect lost to ordinary background token rotation, and notification write completion lost across same-owner reconnect. No Critical/Minor findings.
- Review fix 1: current title/content/category now autosave with immutable pending selection even during failed reads; resolving a missing teacher also updates the saved partial draft. Four added cases failed before the fix; 22/22 consultation cases and existing resilience contract now pass. Removed the restoration-only persistence gate rather than sacrificing current edits.
- Review fix 2: login and background requests share one guarded reissue. Ordinary same-owner rotation completes one redirect using current credentials; manual login, replacement and unmount suppression remain. Three actual React renderer regressions failed before the repair; 37/37 auth cases now pass.
- Review fix 3: notification writes follow session ownership/provider lifetime across SSE connection replacement. A pending list reconciles successful read changes so a late unread snapshot cannot revert them. Initial six plus two late-list cases failed before their repairs; 33/33 notification cases now pass.
- Final combined verification after review fixes: `npm run harness:verify` passed 19/19, including 111 focused lifecycle cases (22 consultation, 37 auth, 19 forms/recruit, 33 notifications), 112/112 contracts, lint, FSD/convention/diff checks, typecheck and production build. Initial log preserved as `student-efficiency-verify-initial.log`; final log is `student-efficiency-verify.log` in the workspace root.
- Review boundaries accepted: real device/browser timing and deployed server parity were not certified; server transaction/idempotency guarantees and unchanged attachment replacement policy stay outside this frontend patch. No deferred minor code finding was reported.
