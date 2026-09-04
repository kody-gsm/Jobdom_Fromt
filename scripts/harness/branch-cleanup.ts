import { execFileSync } from "node:child_process";

const ALWAYS_PROTECTED = new Set(["main", "develop"]);

type BranchRef = {
  name: string;
  authorEmail: string;
};

type CleanupInput = {
  currentBranch: string;
  openPrHeads: string[];
  ownerEmails: string[];
  mergedLocalBranches: BranchRef[];
  mergedRemoteBranches: BranchRef[];
};

const normalizeEmail = (email: string) =>
  email.trim().replace(/^</, "").replace(/>$/, "").toLowerCase();

const isOwnedBranch = (branch: BranchRef, ownerEmails: Set<string>) => {
  const authorEmail = normalizeEmail(branch.authorEmail);
  return authorEmail.length > 0 && ownerEmails.has(authorEmail);
};
export const selectBranchCleanupCandidates = ({
  currentBranch,
  openPrHeads,
  ownerEmails,
  mergedLocalBranches,
  mergedRemoteBranches,
}: CleanupInput) => {
  const protectedBranches = new Set([
    ...ALWAYS_PROTECTED,
    currentBranch,
    ...openPrHeads,
  ]);
  const normalizedOwnerEmails = new Set(
    ownerEmails.map(normalizeEmail).filter(Boolean),
  );

  const local = mergedLocalBranches
    .filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails))
    .map((branch) => branch.name.trim())
    .filter(Boolean)
    .filter((branch) => !protectedBranches.has(branch));

  const remote = mergedRemoteBranches
    .filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails))
    .map((branch) => branch.name.trim())
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

const parseBranchRefs = (value: string): BranchRef[] =>
  lines(value).map((line) => {
    const [name, authorEmail = ""] = line.split("\t");
    return { name: name.trim(), authorEmail: authorEmail.trim() };
  });

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

const getOwnerEmails = () => {
  const email = normalizeEmail(run("git", ["config", "--get", "user.email"]));
  return email ? [email] : [];
};

const getMergedRefs = (refRoot: string) =>
  parseBranchRefs(
    run("git", [
      "for-each-ref",
      "--merged=origin/develop",
      "--format=%(refname:short)\t%(authoremail)",
      refRoot,
    ]),
  );

const runCli = () => {
  const apply = process.argv.includes("--apply");
  const deleteRemote = process.argv.includes("--remote");

  run("git", ["fetch", "origin", "--prune"]);
  const currentBranch = run("git", ["branch", "--show-current"]);
  if (!currentBranch) throw new Error("branch cleanup requires an attached branch");

  const ownerEmails = getOwnerEmails();
  if (ownerEmails.length === 0) {
    throw new Error("branch cleanup requires git config user.email");
  }

  const openPrHeads = getOpenPrHeads();
  const mergedLocalBranches = getMergedRefs("refs/heads");
  const mergedRemoteBranches = getMergedRefs("refs/remotes/origin");

  const candidates = selectBranchCleanupCandidates({
    currentBranch,
    openPrHeads,
    ownerEmails,
    mergedLocalBranches,
    mergedRemoteBranches,
  });

  console.log(`Jobdam Branch Cleanup (${apply ? "apply" : "dry-run"})`);
  console.log("ownership: branch tip author email must match git config user.email");
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
