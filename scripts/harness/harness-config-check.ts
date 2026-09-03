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
assert.equal(
  packageJson.scripts["harness:verify"],
  "node --no-warnings --experimental-strip-types scripts/harness/verify.ts",
  "harness:verify script is required",
);
assert.equal(
  packageJson.scripts["harness:lint"],
  "node --no-warnings --experimental-strip-types scripts/harness/changed-lint.ts",
  "harness:lint script is required",
);
const prTemplatePath = ".github/pull_request_template.md";
const workflowPath = ".github/workflows/harness.yml";
assert.ok(existsSync(prTemplatePath), "Korean PR template is required");
assert.ok(existsSync(workflowPath), "harness GitHub Actions workflow is required");

const prTemplate = readFileSync(prTemplatePath, "utf8");
const requiredHeadings = [
  "# ✨ PR 내용",
  "## 📝 코드 변경 사항",
  "## 💡 변경 이유",
  "## 🛠️ 구현 방법",
  "## 📌 영향 범위",
  "## ✅ 테스트",
  "## 🌿 반영 브랜치",
];
let previousIndex = -1;
for (const heading of requiredHeadings) {
  const index = prTemplate.indexOf(heading);
  assert.ok(index > previousIndex, `PR heading missing or reordered: ${heading}`);
  previousIndex = index;
}

const workflow = readFileSync(workflowPath, "utf8");
assert.match(workflow, /pull_request:/, "workflow must run for pull requests");
assert.match(workflow, /npm run harness:verify/, "workflow must run harness:verify");