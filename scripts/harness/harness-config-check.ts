import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  "AGENTS.md",
  "docs/ARCHITECTURE.md",
  "docs/harness/WORKFLOW.md",
  "docs/harness/CODE_CONVENTION.md",
  "docs/harness/CODE_REVIEW.md",
  "docs/contracts/API_CONTRACT.md",
  "docs/contracts/FEATURE_CONTRACT.md",
  "docs/contracts/FRONTEND_CONTRACT_MAP.md",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `missing project/harness file: ${file}`);
}

let agentsIgnored = false;
try {
  execFileSync("git", ["check-ignore", "-q", "AGENTS.md"], { stdio: "ignore" });
  agentsIgnored = true;
} catch {}
assert.equal(agentsIgnored, false, "AGENTS.md must be tracked by git");

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const expectedScripts = {
  "harness:preflight": "node --no-warnings --experimental-strip-types scripts/harness/preflight.ts",
  "harness:verify": "node --no-warnings --experimental-strip-types scripts/harness/verify.ts",
  "harness:lint": "node --no-warnings --experimental-strip-types scripts/harness/changed-lint.ts",
  "harness:contracts": "node --no-warnings --experimental-strip-types scripts/harness/contract-check.ts",
  "harness:diff": "node --no-warnings --experimental-strip-types scripts/harness/diff-check.ts",
  "harness:ready": "node --no-warnings --experimental-strip-types scripts/harness/readiness.ts",
  "harness:fsd": "node --no-warnings --experimental-strip-types scripts/harness/fsd-boundary-check.ts",
  "harness:convention": "node --no-warnings --experimental-strip-types scripts/harness/convention-check.ts",
  "harness:branches": "node --no-warnings --experimental-strip-types scripts/harness/branch-cleanup.ts",
};

for (const [name, command] of Object.entries(expectedScripts)) {
  assert.equal(packageJson.scripts?.[name], command, `${name} script is required`);
}
assert.equal(packageJson.scripts?.["harness:scope"], undefined, "task-specific scope guard must stay out of the harness");

const prTemplatePath = ".github/pull_request_template.md";
assert.ok(existsSync(prTemplatePath), "Korean PR template is required");
assert.equal(
  existsSync(".github/workflows/harness.yml"),
  false,
  "harness must not add a duplicate CI/CD workflow",
);

const prTemplate = readFileSync(prTemplatePath, "utf8").replace(/\r\n?/g, "\n");
const expectedPrTemplate = [
  "# ✨ PR 내용",
  "",
  "## 📝 코드 변경 사항", "- ", "",
  "## 💡 변경 이유", "- ", "",
  "## 🛠️ 구현 방법", "- ", "",
  "## 📌 영향 범위", "- ", "",
  "## ✅ 테스트", "- [ ] ", "",
  "**테스트 결과 / 참고 사항**", "- ", "",
  "## 🌿 반영 브랜치", "- develop", "",
].join("\n");
assert.equal(prTemplate, expectedPrTemplate, "PR template must match the approved Korean format exactly");

const workflow = readFileSync("docs/harness/WORKFLOW.md", "utf8");
assert.match(workflow, /base\/반영 브랜치는 `develop`으로 고정/, "workflow must fix normal PR base to develop");
assert.match(workflow, /`main` 직접 반영.*release\/hotfix/, "main must be reserved for explicitly requested release/hotfix work");
assert.match(workflow, /하나의 리뷰 가능한 목적/, "workflow must define PR granularity by reviewable purpose");
assert.match(workflow, /harness:ready/, "workflow must require the PR readiness gate");

const architecture = readFileSync("docs/ARCHITECTURE.md", "utf8");
assert.match(architecture, /src\/fsd\//, "architecture must define the FSD root");
assert.match(
  architecture,
  /app → pages → widgets → features → entities → shared/,
  "architecture must define FSD layer order",
);
assert.doesNotMatch(
  architecture,
  /Migration order|Student design rebuild|Teacher\/Admin structural migration/,
  "architecture must describe current structure, not a one-off migration plan",
);

const codeConvention = readFileSync("docs/harness/CODE_CONVENTION.md", "utf8");
assert.match(codeConvention, /@fsd\/\*/, "code convention must define the FSD import alias");
assert.match(codeConvention, /api[\s\S]*segment[\s\S]*fetch/, "code convention must protect direct fetch usage");
assert.doesNotMatch(codeConvention, /FUNCTION_RULES\.md/, "function rules must be consolidated into code convention");

const agentsGuide = readFileSync("AGENTS.md", "utf8");
assert.match(agentsGuide, /작업 방식과 검증 기준/, "AGENTS must define harness ownership");
assert.match(agentsGuide, /harness:ready/, "AGENTS must block PR creation when readiness fails");
assert.doesNotMatch(agentsGuide, /Teacher\/Admin 보호 범위|Student 디자인 재구성/, "AGENTS must not encode one-off task scope");

const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8"));
assert.deepEqual(tsconfig.compilerOptions?.paths?.["@fsd/*"], ["./src/fsd/*"], "@fsd/* alias is required");
