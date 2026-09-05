import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export const selectContractTestFiles = (entries: string[]) =>
  entries.filter((entry) => entry.endsWith(".test.ts")).sort();

const runCli = () => {
  const root = "tests/contracts";
  const files = selectContractTestFiles(readdirSync(root));

  console.log(`Jobdam Contract Check: ${files.length} files`);
  if (files.length === 0) {
    console.error("x no contract tests found");
    process.exit(1);
  }

  for (const file of files) {
    const result = spawnSync(
      process.execPath,
      ["--no-warnings", "--experimental-strip-types", join(root, file)],
      { stdio: "inherit" },
    );
    if (result.status !== 0) {
      console.error(`x contract failed: ${file}`);
      process.exit(result.status ?? 1);
    }
  }

  console.log(`\u2713 contract suite passed (${files.length}/${files.length})`);
};

if (process.argv[1]?.endsWith("contract-check.ts")) runCli();
