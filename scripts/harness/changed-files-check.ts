import { execFileSync } from "node:child_process";

const TEACHER_PREFIXES = ["app/teacher/"];
const TEACHER_MIGRATION_BRANCH_PREFIX = "refactor/teacher-fsd";

export const findProtectedPaths = (paths: string[]) =>
  paths
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => TEACHER_PREFIXES.some((prefix) => path.startsWith(prefix)));

export const isTeacherMigrationAllowed = (branch: string, migrationEnv?: string) =>
  migrationEnv === "1" || branch.startsWith(TEACHER_MIGRATION_BRANCH_PREFIX);

const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();

const gitLines = (...args: string[]) => {
  const output = git(...args);
  return output ? output.split(/\r?\n/).filter(Boolean) : [];
};

export const getChangedFiles = (baseRef: string) => {
  const committed = gitLines("diff", "--name-only", `${baseRef}...HEAD`);
  const working = gitLines("diff", "--name-only");
  const staged = gitLines("diff", "--cached", "--name-only");
  const untracked = gitLines("ls-files", "--others", "--exclude-standard");
  return [...new Set([...committed, ...working, ...staged, ...untracked])];
};

const runCli = () => {
  const baseRef = process.env.HARNESS_BASE_REF || "origin/develop";
  const branch = git("branch", "--show-current");
  const changedFiles = getChangedFiles(baseRef);
  const teacherPaths = findProtectedPaths(changedFiles);

  console.log(`Jobdam Harness Scope Check (base: ${baseRef})`);
  console.log(`✓ changed files: ${changedFiles.length}`);

  if (teacherPaths.length === 0) {
    console.log("✓ protected Teacher paths unchanged");
    return;
  }

  if (isTeacherMigrationAllowed(branch, process.env.HARNESS_TEACHER_MIGRATION)) {
    console.log(`⚠ Teacher FSD migration mode enabled:\n${teacherPaths.join("\n")}`);
    return;
  }

  console.error(
    `✗ Teacher paths changed outside migration mode:\n${teacherPaths.join("\n")}\n` +
    `Use a '${TEACHER_MIGRATION_BRANCH_PREFIX}*' branch for behavior-preserving FSD migration.`,
  );
  process.exit(1);
};

if (process.argv[1]?.endsWith("changed-files-check.ts")) runCli();
