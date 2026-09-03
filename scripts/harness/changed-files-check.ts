import { execFileSync } from "node:child_process";

const PROTECTED_PREFIXES = ["app/teacher/"];

export const findProtectedPaths = (paths: string[]) =>
  paths
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix)));

const gitLines = (...args: string[]) => {
  const output = execFileSync("git", args, { encoding: "utf8" }).trim();
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
  const changedFiles = getChangedFiles(baseRef);
  const protectedPaths = findProtectedPaths(changedFiles);

  console.log(`Jobdam Harness Scope Check (base: ${baseRef})`);
  console.log(`??changed files: ${changedFiles.length}`);

  if (protectedPaths.length === 0) {
    console.log("??protected Teacher 寃쎈줈 蹂寃??놁쓬");
    return;
  }

  if (process.env.HARNESS_ALLOW_TEACHER_CHANGE === "1") {
    console.log(`??Teacher 蹂寃?override ?ъ슜:\n${protectedPaths.join("\n")}`);
    return;
  }

  console.error(`??protected Teacher 寃쎈줈 蹂寃?媛먯?:\n${protectedPaths.join("\n")}`);
  process.exit(1);
};

if (process.argv[1]?.endsWith("changed-files-check.ts")) runCli();
