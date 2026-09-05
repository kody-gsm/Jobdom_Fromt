import { execFileSync } from "node:child_process";

const ALWAYS_PROTECTED = new Set(["main", "develop"]);

type BranchRef = {
  name: string;
  authorEmail: string;
  oid?: string;
};

type MergedPrRef = {
  headRefName: string;
  headRefOid: string;
};

type CleanupInput = {
  currentBranch: string;
  openPrHeads: string[];
  ownerEmails: string[];
  mergedLocalBranches: BranchRef[];
  mergedRemoteBranches: BranchRef[];
  squashMergedLocalBranches?: BranchRef[];
  squashMergedRemoteBranches?: BranchRef[];
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
  squashMergedLocalBranches = [],
  squashMergedRemoteBranches = [],
}: CleanupInput) => {
  const protectedBranches = new Set([
    ...ALWAYS_PROTECTED,
    currentBranch,
    ...openPrHeads,
  ]);
  const normalizedOwnerEmails = new Set(
    ownerEmails.map(normalizeEmail).filter(Boolean),
  );
  const verifiedSquashLocalBranches = normalizedOwnerEmails.size > 0
    ? squashMergedLocalBranches.filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails))
    : squashMergedLocalBranches;
  const verifiedSquashRemoteBranches = normalizedOwnerEmails.size > 0
    ? squashMergedRemoteBranches.filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails))
    : squashMergedRemoteBranches;

  const local = [
    ...mergedLocalBranches.filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails)),
    ...verifiedSquashLocalBranches,
  ]
    .map((branch) => branch.name.trim())
    .filter(Boolean)
    .filter((branch) => !protectedBranches.has(branch));

  const remote = [
    ...mergedRemoteBranches.filter((branch) => isOwnedBranch(branch, normalizedOwnerEmails)),
    ...verifiedSquashRemoteBranches,
  ]
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

export const selectExactMergedPrRefs = (
  branches: BranchRef[],
  mergedPrRefs: MergedPrRef[],
  remote = false,
) => {
  const mergedKeys = new Set(
    mergedPrRefs
      .map((pr) => `${pr.headRefName.trim()}\0${pr.headRefOid.trim()}`)
      .filter((key) => !key.startsWith("\0") && !key.endsWith("\0")),
  );

  return branches.filter((branch) => {
    const rawName = branch.name.trim();
    const name = remote && rawName.startsWith("origin/")
      ? rawName.slice("origin/".length)
      : rawName;
    const oid = branch.oid?.trim() ?? "";
    return oid.length > 0 && mergedKeys.has(`${name}\0${oid}`);
  });
};

export const getLocalDeleteArgs = (branch: string, squashMergedHeads: Set<string>) =>
  ["branch", squashMergedHeads.has(branch) ? "-D" : "-d", branch];

const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const parseBranchRefs = (value: string): BranchRef[] =>
  lines(value).map((line) => {
    const [name, authorEmail = "", oid = ""] = line.split("\t");
    return { name: name.trim(), authorEmail: authorEmail.trim(), oid: oid.trim() };
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

const getMergedPrRefs = (): MergedPrRef[] => {
  const output = run("gh", [
    "pr",
    "list",
    "--state",
    "merged",
    "--author",
    "@me",
    "--base",
    "develop",
    "--limit",
    "200",
    "--json",
    "headRefName,headRefOid",
  ]);
  const parsed = JSON.parse(output || "[]") as MergedPrRef[];
  return parsed.filter((pr) => pr.headRefName?.trim() && pr.headRefOid?.trim());
};

const printCandidates = (label: string, branches: string[]) => {
  console.log(`${label}: ${branches.length}`);
  for (const branch of branches) console.log(`  - ${branch}`);
};

export const resolveOwnerEmails = (readEmail: () => string) => {
  try {
    const email = normalizeEmail(readEmail());
    return email ? [email] : [];
  } catch {
    return [];
  }
};

const getOwnerEmails = () =>
  resolveOwnerEmails(() => run("git", ["config", "--get", "user.email"]));

const getRefs = (refRoot: string) =>
  parseBranchRefs(
    run("git", [
      "for-each-ref",
      "--format=%(refname:short)\t%(authoremail)\t%(objectname)",
      refRoot,
    ]),
  );

const getMergedRefs = (refRoot: string) =>
  parseBranchRefs(
    run("git", [
      "for-each-ref",
      "--merged=origin/develop",
      "--format=%(refname:short)\t%(authoremail)\t%(objectname)",
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

  const openPrHeads = getOpenPrHeads();
  const mergedPrRefs = getMergedPrRefs();
  const mergedLocalBranches = getMergedRefs("refs/heads");
  const mergedRemoteBranches = getMergedRefs("refs/remotes/origin");
  const allLocalBranches = getRefs("refs/heads");
  const allRemoteBranches = getRefs("refs/remotes/origin");
  const exactSquashLocalBranches = selectExactMergedPrRefs(allLocalBranches, mergedPrRefs);
  const exactSquashRemoteBranches = selectExactMergedPrRefs(allRemoteBranches, mergedPrRefs, true);

  const candidates = selectBranchCleanupCandidates({
    currentBranch,
    openPrHeads,
    ownerEmails,
    mergedLocalBranches,
    mergedRemoteBranches,
    squashMergedLocalBranches: exactSquashLocalBranches,
    squashMergedRemoteBranches: exactSquashRemoteBranches,
  });

  console.log(`Jobdam Branch Cleanup (${apply ? "apply" : "dry-run"})`);
  console.log(
    ownerEmails.length > 0
      ? "ownership: branch tip author email must match git config user.email"
      : "ownership: git config user.email missing; ancestry-only candidates skipped",
  );
  console.log("squash merge evidence: merged PR authored by @me, base develop, exact head SHA");
  console.log(`protected: main, develop, ${currentBranch}, open PR heads`);
  printCandidates("local merged branches", candidates.local);
  printCandidates("origin merged branches", candidates.remote);

  if (!apply) {
    console.log("dry-run only: use --apply to delete local branches");
    console.log("add --remote with --apply to delete matching origin branches");
    return;
  }

  const squashMergedHeads = new Set(exactSquashLocalBranches.map((branch) => branch.name.trim()));
  for (const branch of candidates.local) {
    execFileSync("git", getLocalDeleteArgs(branch, squashMergedHeads), { stdio: "inherit" });
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
