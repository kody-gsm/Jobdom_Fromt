import assert from "node:assert/strict";
import { getLocalDeleteArgs, resolveOwnerEmails, selectBranchCleanupCandidates, selectExactMergedPrRefs } from "./branch-cleanup.ts";

const candidates = selectBranchCleanupCandidates({
  currentBranch: "refactor/fsd-foundation",
  openPrHeads: ["feat/open-pr"],
  ownerEmails: ["me@example.com"],
  mergedLocalBranches: [
    { name: "main", authorEmail: "me@example.com" },
    { name: "develop", authorEmail: "me@example.com" },
    { name: "chore/codex-harness", authorEmail: "me@example.com" },
    { name: "fix/pre-qa", authorEmail: "ME@example.com" },
    { name: "feat/open-pr", authorEmail: "me@example.com" },
    { name: "feat/teammate", authorEmail: "other@example.com" },
    { name: "feat/unknown", authorEmail: "" },
    { name: "refactor/fsd-foundation", authorEmail: "me@example.com" },
  ],
  mergedRemoteBranches: [
    { name: "origin/HEAD -> origin/main", authorEmail: "me@example.com" },
    { name: "origin/main", authorEmail: "me@example.com" },
    { name: "origin/develop", authorEmail: "me@example.com" },
    { name: "origin/chore/codex-harness", authorEmail: "me@example.com" },
    { name: "origin/fix/pre-qa", authorEmail: "<me@example.com>" },    { name: "origin/feat/open-pr", authorEmail: "me@example.com" },
    { name: "origin/feat/teammate", authorEmail: "other@example.com" },
    { name: "origin/feat/unknown", authorEmail: "" },
    { name: "legacy-origin/feature/login", authorEmail: "me@example.com" },
  ],
});

assert.deepEqual(candidates.local, ["chore/codex-harness", "fix/pre-qa"]);
assert.deepEqual(candidates.remote, ["chore/codex-harness", "fix/pre-qa"]);

assert.deepEqual(
  selectBranchCleanupCandidates({
    currentBranch: "main",
    openPrHeads: [],
    ownerEmails: ["me@example.com"],
    mergedLocalBranches: [
      { name: "main", authorEmail: "me@example.com" },
      { name: "develop", authorEmail: "me@example.com" },
    ],
    mergedRemoteBranches: [
      { name: "origin/main", authorEmail: "me@example.com" },
      { name: "origin/develop", authorEmail: "me@example.com" },
    ],
  }),
  { local: [], remote: [] },
);

assert.deepEqual(
  selectBranchCleanupCandidates({
    currentBranch: "feat/current",
    openPrHeads: [],
    ownerEmails: [],
    mergedLocalBranches: [{ name: "fix/mine", authorEmail: "me@example.com" }],
    mergedRemoteBranches: [{ name: "origin/fix/mine", authorEmail: "me@example.com" }],
  }),
  { local: [], remote: [] },
);

const squashCandidates = selectBranchCleanupCandidates({
  currentBranch: "feat/current",
  openPrHeads: ["fix/open"],
  ownerEmails: ["me@example.com"],
  mergedLocalBranches: [],
  mergedRemoteBranches: [],
  squashMergedLocalBranches: [
    { name: "fix/squash-done", authorEmail: "me@example.com" },
    { name: "fix/squash-teammate", authorEmail: "other@example.com" },
  ],
  squashMergedRemoteBranches: [
    { name: "origin/fix/squash-done", authorEmail: "me@example.com" },
    { name: "origin/fix/squash-teammate", authorEmail: "other@example.com" },
  ],
});

assert.deepEqual(squashCandidates.local, ["fix/squash-done"]);
assert.deepEqual(squashCandidates.remote, ["fix/squash-done"]);
assert.deepEqual(getLocalDeleteArgs("fix/regular", new Set(["fix/squash-done"])), ["branch", "-d", "fix/regular"]);
assert.deepEqual(getLocalDeleteArgs("fix/squash-done", new Set(["fix/squash-done"])), ["branch", "-D", "fix/squash-done"]);

const exactMergedRefs = selectExactMergedPrRefs(
  [
    { name: "fix/squash-done", authorEmail: "me@example.com", oid: "abc" },
    { name: "fix/reused-after-merge", authorEmail: "me@example.com", oid: "new" },
  ],
  [
    { headRefName: "fix/squash-done", headRefOid: "abc" },
    { headRefName: "fix/reused-after-merge", headRefOid: "old" },
  ],
);
assert.deepEqual(exactMergedRefs.map((branch) => branch.name), ["fix/squash-done"]);

const exactMergedRemoteRefs = selectExactMergedPrRefs(
  [{ name: "origin/fix/squash-done", authorEmail: "me@example.com", oid: "abc" }],
  [{ headRefName: "fix/squash-done", headRefOid: "abc" }],
  true,
);
assert.deepEqual(exactMergedRemoteRefs.map((branch) => branch.name), ["origin/fix/squash-done"]);

const noEmailSquashCandidates = selectBranchCleanupCandidates({
  currentBranch: "feat/current",
  openPrHeads: [],
  ownerEmails: [],
  mergedLocalBranches: [{ name: "fix/ancestry", authorEmail: "me@example.com" }],
  mergedRemoteBranches: [{ name: "origin/fix/ancestry", authorEmail: "me@example.com" }],
  squashMergedLocalBranches: [{ name: "fix/squash-done", authorEmail: "other@example.com" }],
  squashMergedRemoteBranches: [{ name: "origin/fix/squash-done", authorEmail: "other@example.com" }],
});
assert.deepEqual(noEmailSquashCandidates.local, ["fix/squash-done"]);
assert.deepEqual(noEmailSquashCandidates.remote, ["fix/squash-done"]);
assert.deepEqual(resolveOwnerEmails(() => "<ME@example.com>"), ["me@example.com"]);
assert.deepEqual(resolveOwnerEmails(() => { throw new Error("missing config"); }), []);
