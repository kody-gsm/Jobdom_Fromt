import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = "src/fsd/features";
const findTests = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findTests(path);
    return entry.isFile() && entry.name.endsWith(".test.ts") ? [path] : [];
  });

const tests = findTests(root).sort();
if (tests.length === 0) {
  console.error("x no unit tests found");
  process.exit(1);
}

for (const test of tests) {
  console.log(`\n> ${test}`);
  const result = spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", test],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error(`x unit test failed: ${test}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\n✓ unit tests passed (${tests.length}/${tests.length})`);
