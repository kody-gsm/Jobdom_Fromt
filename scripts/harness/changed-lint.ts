import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const LINTABLE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

type Exists = (path: string) => boolean;

export const selectLintableFiles = (
  paths: string[],
  exists: Exists = existsSync,
) =>
  paths
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => exists(path))
    .filter((path) => LINTABLE_EXTENSIONS.some((extension) => path.endsWith(extension)));

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
  const files = selectLintableFiles(getChangedFiles(baseRef));

  console.log(`Jobdam Harness Changed Lint (base: ${baseRef})`);
  if (files.length === 0) {
    console.log("✓ lint 대상 변경 파일 없음");
    return;
  }

  console.log(`✓ lint 대상 ${files.length}개`);
  const result = spawnSync(
    process.execPath,
    ["node_modules/eslint/bin/eslint.js", ...files],
    { stdio: "inherit" },
  );

  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log("✓ changed-file lint 통과");
};

if (process.argv[1]?.endsWith("changed-lint.ts")) runCli();
