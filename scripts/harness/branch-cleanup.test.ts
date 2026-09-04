import assert from "node:assert/strict";
import { selectBranchCleanupCandidates } from "./branch-cleanup.ts";

const candidates = selectBranchCleanupCandidates({
  currentBranch: "refactor/fsd-foundation",
  openPrHeads: ["feat/open-pr"],
  mergedLocalBranches: [
    "main",
    "develop",
    "chore/codex-harness",
    "fix/pre-qa",
    "feat/open-pr",
    "refactor/fsd-foundation",
  ],
  mergedRemoteBranches: [
    "origin/HEAD -> origin/main",
    "origin/main",
    "origin/develop",
    "origin/chore/codex-harness",
    "origin/fix/pre-qa",
    "origin/feat/open-pr",
    "legacy-origin/feature/login",
  ],
});

assert.deepEqual(candidates.local, ["chore/codex-harness", "fix/pre-qa"]);
assert.deepEqual(candidates.remote, ["chore/codex-harness", "fix/pre-qa"]);

assert.deepEqual(
  selectBranchCleanupCandidates({
    currentBranch: "main",
    openPrHeads: [],
    mergedLocalBranches: ["main", "develop"],
    mergedRemoteBranches: ["origin/main", "origin/develop"],
  }),
  { local: [], remote: [] },
);
