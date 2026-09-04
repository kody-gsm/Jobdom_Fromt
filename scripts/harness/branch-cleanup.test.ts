import assert from "node:assert/strict";
import { selectBranchCleanupCandidates } from "./branch-cleanup.ts";

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
