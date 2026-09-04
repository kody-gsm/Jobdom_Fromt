import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { getChangedFiles } from "./changed-files-check.ts";

const LINTABLE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

type Exists = (path: string) => boolean;

export const selectLintableFiles = (
  paths: string[],
  exists: Exists = existsSync,
) =>
  paths
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => exists(path))
    .filter((path) => !path.startsWith("app/teacher/"))
    .filter((path) => LINTABLE_EXTENSIONS.some((extension) => path.endsWith(extension)));

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
