import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  "AGENTS.md",
  "docs/harness/ARCHITECTURE.md",
  "docs/harness/WORKFLOW.md",
  "docs/harness/FUNCTION_RULES.md",
  "docs/harness/REFACTORING_RULES.md",
  "docs/harness/API_CONTRACT.md",
  "docs/harness/FEATURE_CONTRACT.md",
  "docs/harness/CODE_REVIEW.md",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `missing harness policy file: ${file}`);
}

let agentsIgnored = false;
try {
  execFileSync("git", ["check-ignore", "-q", "AGENTS.md"], { stdio: "ignore" });
  agentsIgnored = true;
} catch {}
assert.equal(agentsIgnored, false, "AGENTS.md must be tracked by git");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
assert.ok(packageJson.scripts, "package.json scripts are required");
assert.equal(
  packageJson.scripts["harness:preflight"],
  "node --no-warnings --experimental-strip-types scripts/harness/preflight.ts",
  "harness:preflight script is required",
);
assert.equal(
  packageJson.scripts["harness:scope"],
  "node --no-warnings --experimental-strip-types scripts/harness/changed-files-check.ts",
  "harness:scope script is required",
);