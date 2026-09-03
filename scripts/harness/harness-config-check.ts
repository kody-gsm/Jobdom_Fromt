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
const duplicateHarnessWorkflowPath = ".github/workflows/harness.yml";
assert.ok(existsSync(prTemplatePath), "Korean PR template is required");
assert.equal(existsSync(duplicateHarnessWorkflowPath), false, "harness must not add a duplicate CI/CD workflow");

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

const expectedPrTemplate = [
  "# ✨ PR 내용",
  "",
  "## 📝 코드 변경 사항", "- ", "",
  "## 💡 변경 이유", "- ", "",
  "## 🛠️ 구현 방법", "- ", "",
  "## 📌 영향 범위", "- ", "",
  "## ✅ 테스트", "- [ ] ", "",
  "**테스트 결과 / 참고 사항**", "- ", "",
  "## 🌿 반영 브랜치", "- main", "",
].join("\n");
assert.equal(prTemplate, expectedPrTemplate, "PR template must match the approved Korean format exactly");

const scopeSource = readFileSync("scripts/harness/changed-files-check.ts", "utf8");
assert.match(scopeSource, /✓ changed files:/, "scope output must be readable UTF-8/ASCII");
assert.match(scopeSource, /✓ protected Teacher paths unchanged/, "scope success output must be readable");
const verifySource = readFileSync("scripts/harness/verify.ts", "utf8");
assert.match(verifySource, /✓ harness verification passed/, "verify success output must be readable");
assert.match(verifySource, /✗ verification failed:/, "verify failure output must be readable");

const plan = readFileSync("docs/superpowers/plans/2026-09-03-jobdam-codex-harness.md", "utf8");
assert.doesNotMatch(plan, /---###/, "plan task headings must start on a new line");

const gitignore = readFileSync(".gitignore", "utf8");
assert.ok(!gitignore.startsWith("\uFEFF"), ".gitignore must not contain a UTF-8 BOM");

const codeConventionPath = "docs/harness/CODE_CONVENTION.md";
assert.ok(existsSync(codeConventionPath), "CODE_CONVENTION.md is required");
const codeConvention = readFileSync(codeConventionPath, "utf8");
assert.match(codeConvention, /@fsd\/\*/, "code convention must define the FSD import alias");
assert.match(codeConvention, /api[\s\S]*segment[\s\S]*fetch/, "code convention must protect direct fetch usage");
const architecture = readFileSync("docs/harness/ARCHITECTURE.md", "utf8");
assert.match(architecture, /src\/fsd\//, "architecture must define the FSD root");
assert.match(architecture, /app → pages → widgets → features → entities → shared/, "architecture must define FSD layer order");
const agentsGuide = readFileSync("AGENTS.md", "utf8");
assert.match(agentsGuide, /Teacher[\s\S]*FSD migration/, "AGENTS must define Teacher migration policy");
assert.equal(
  packageJson.scripts["harness:fsd"],
  "node --no-warnings --experimental-strip-types scripts/harness/fsd-boundary-check.ts",
  "harness:fsd script is required",
);
assert.equal(
  packageJson.scripts["harness:convention"],
  "node --no-warnings --experimental-strip-types scripts/harness/convention-check.ts",
  "harness:convention script is required",
);
const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8"));
assert.deepEqual(tsconfig.compilerOptions?.paths?.["@fsd/*"], ["./src/fsd/*"], "@fsd/* alias is required");
const scopePolicySource = readFileSync("scripts/harness/changed-files-check.ts", "utf8");
assert.doesNotMatch(scopePolicySource, /HARNESS_ALLOW_TEACHER_CHANGE/, "generic Teacher override must not be used");
assert.match(scopePolicySource, /HARNESS_TEACHER_MIGRATION/, "Teacher migration must use the dedicated gate");
