import { execFileSync } from "node:child_process";

interface PreflightInput {
  branch: string;
  conflicts: string[];
  changedFiles: string[];
}

export const evaluatePreflight = ({ branch, conflicts, changedFiles }: PreflightInput) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (["main", "develop"].includes(branch)) {
    errors.push(`protected branch '${branch}'에서 직접 구현하지 않는다`);
  }
  if (conflicts.length > 0) {
    errors.push(`merge conflict 존재: ${conflicts.join(", ")}`);
  }
  if (changedFiles.length > 0) {
    warnings.push(`기존 working-tree 변경 ${changedFiles.length}개 존재`);
  }

  return { errors, warnings };
};

const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();
const runCli = () => {
  const root = git("rev-parse", "--show-toplevel");
  const branch = git("branch", "--show-current");
  const conflicts = git("diff", "--name-only", "--diff-filter=U").split(/\r?\n/).filter(Boolean);
  const changedFiles = git("status", "--porcelain").split(/\r?\n/).filter(Boolean);
  const result = evaluatePreflight({ branch, conflicts, changedFiles });

  console.log("Jobdam Harness Preflight");
  console.log(`✓ repository: ${root}`);
  console.log(`✓ branch: ${branch || "detached HEAD"}`);
  for (const warning of result.warnings) console.log(`⚠ ${warning}`);
  for (const error of result.errors) console.error(`✗ ${error}`);

  if (result.errors.length > 0) process.exit(1);
  console.log("✓ preflight 통과");
};

if (process.argv[1]?.endsWith("preflight.ts")) runCli();