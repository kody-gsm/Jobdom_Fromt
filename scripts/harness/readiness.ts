import { execFileSync, spawnSync } from "node:child_process";

interface ReadinessInput {
  branch: string;
  statusLines: string[];
  aheadCount: number;
  baseRefFresh?: boolean;
}

export const evaluateReadiness = ({ branch, statusLines, aheadCount, baseRefFresh = true }: ReadinessInput) => {
  const errors: string[] = [];
  if (["main", "develop"].includes(branch)) errors.push(`protected branch '${branch}' is not PR-ready`);
  if (statusLines.length > 0) errors.push(`working tree must be clean (${statusLines.length} change(s))`);
  if (aheadCount < 1) errors.push("branch has no commits ahead of the base ref");
  if (baseRefFresh === false) errors.push("base ref could not be refreshed from origin");
  return { errors };
};

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();

const runCli = () => {
  const baseRef = process.env.HARNESS_BASE_REF || "origin/develop";
  const preflight = spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", "scripts/harness/preflight.ts"],
    { stdio: "inherit" },
  );
  if (preflight.status !== 0) process.exit(preflight.status ?? 1);

  let baseRefFresh = true;
  try {
    execFileSync("git", ["fetch", "origin", "develop", "--quiet"], { stdio: "ignore" });
  } catch {
    baseRefFresh = false;
  }
  const branch = git("branch", "--show-current");
  const status = git("status", "--porcelain");
  const statusLines = status ? status.split(/\r?\n/).filter(Boolean) : [];
  const aheadCount = Number(git("rev-list", "--count", `${baseRef}..HEAD`) || "0");
  const readiness = evaluateReadiness({ branch, statusLines, aheadCount, baseRefFresh });

  console.log(`Jobdam PR Readiness (base: ${baseRef})`);
  console.log(`\u2713 branch: ${branch || "detached HEAD"}`);
  for (const error of readiness.errors) console.error(`x ${error}`);
  if (readiness.errors.length > 0) process.exit(1);

  const verify = spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", "scripts/harness/verify.ts"],
    { stdio: "inherit" },
  );
  if (verify.status !== 0) {
    console.error("x PR readiness blocked by harness verification");
    process.exit(verify.status ?? 1);
  }

  const prMetadata = spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", "scripts/harness/pr-metadata.ts"],
    { stdio: "inherit" },
  );
  if (prMetadata.status !== 0) process.exit(prMetadata.status ?? 1);

  console.log("\u2713 PR readiness passed");
};

if (process.argv[1]?.endsWith("readiness.ts")) runCli();
