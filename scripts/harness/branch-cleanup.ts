import { execFileSync } from "node:child_process";

const ALWAYS_PROTECTED = new Set(["main", "develop"]);

type CleanupInput = {
  currentBranch: string;
  openPrHeads: string[];
  mergedLocalBranches: string[];
  mergedRemoteBranches: string[];
};

export const selectBranchCleanupCandidates = ({
  currentBranch,
  openPrHeads,
  mergedLocalBranches,
  mergedRemoteBranches,
}: CleanupInput) => {
  const protectedBranches = new Set([
    ...ALWAYS_PROTECTED,
    currentBranch,
    ...openPrHeads,
  ]);

  const local = mergedLocalBranches
    .map((branch) => branch.trim())
    .filter(Boolean)
    .filter((branch) => !protectedBranches.has(branch));

  const remote = mergedRemoteBranches
    .map((branch) => branch.trim())
    .filter((branch) => branch.startsWith("origin/"))
    .map((branch) => branch.slice("origin/".length))
    .filter((branch) => branch !== "HEAD" && !branch.includes(" -> "))
    .filter((branch) => !protectedBranches.has(branch));

  return {
    local: [...new Set(local)].sort(),
    remote: [...new Set(remote)].sort(),
  };
};

const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: "utf8" }).trim();

const getOpenPrHeads = () =>
  lines(
    run("gh", [
      "pr",
      "list",
      "--state",
      "open",
      "--json",
      "headRefName",
      "--jq",
      ".[].headRefName",
    ]),
  );

const printCandidates = (label: string, branches: string[]) => {
  console.log(`${label}: ${branches.length}`);
  for (const branch of branches) console.log(`  - ${branch}`);
};

const runCli = () => {
  const apply = process.argv.includes("--apply");
  const deleteRemote = process.argv.includes("--remote");

  run("git", ["fetch", "origin", "--prune"]);
  const currentBranch = run("git", ["branch", "--show-current"]);
  if (!currentBranch) throw new Error("branch cleanup requires an attached branch");

  const openPrHeads = getOpenPrHeads();
  const mergedLocalBranches = lines(
    run("git", [
      "for-each-ref",
      "--merged=origin/develop",
      "--format=%(refname:short)",
      "refs/heads",
    ]),
  );
  const mergedRemoteBranches = lines(
    run("git", [
      "for-each-ref",
      "--merged=origin/develop",
      "--format=%(refname:short)",
      "refs/remotes/origin",
    ]),
  );

  const candidates = selectBranchCleanupCandidates({
    currentBranch,
    openPrHeads,
    mergedLocalBranches,
    mergedRemoteBranches,
  });

  console.log(`Jobdam Branch Cleanup (${apply ? "apply" : "dry-run"})`);
  console.log(`protected: main, develop, ${currentBranch}, open PR heads`);
  printCandidates("local merged branches", candidates.local);
  printCandidates("origin merged branches", candidates.remote);

  if (!apply) {
    console.log("dry-run only: use --apply to delete local branches");
    console.log("add --remote with --apply to delete matching origin branches");
    return;
  }

  for (const branch of candidates.local) {
    execFileSync("git", ["branch", "-d", branch], { stdio: "inherit" });
  }

  if (deleteRemote) {
    for (const branch of candidates.remote) {
      execFileSync("git", ["push", "origin", "--delete", branch], {
        stdio: "inherit",
      });
    }
  }
};

if (process.argv[1]?.endsWith("branch-cleanup.ts")) runCli();
