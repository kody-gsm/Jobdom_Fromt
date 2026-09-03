import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

interface VerificationStep {
  name: string;
  kind: "node" | "npm";
  target: string;
}

const NODE_CHECKS: VerificationStep[] = [
  { name: "harness config", kind: "node", target: "scripts/harness/harness-config-check.ts" },
  { name: "preflight unit", kind: "node", target: "scripts/harness/preflight.test.ts" },
  { name: "scope unit", kind: "node", target: "scripts/harness/changed-files-check.test.ts" },
  { name: "changed lint unit", kind: "node", target: "scripts/harness/changed-lint.test.ts" },
  { name: "fsd boundary unit", kind: "node", target: "scripts/harness/fsd-boundary-check.test.ts" },
  { name: "convention unit", kind: "node", target: "scripts/harness/convention-check.test.ts" },
  { name: "shared api unit", kind: "node", target: "scripts/harness/shared-api-client.test.ts" },
  { name: "user session unit", kind: "node", target: "scripts/harness/user-session.test.ts" },
  { name: "user auth rules unit", kind: "node", target: "scripts/harness/user-auth-rules.test.ts" },
  { name: "shared ui unit", kind: "node", target: "scripts/harness/shared-ui-contract.test.ts" },
  { name: "auth feature api unit", kind: "node", target: "scripts/harness/auth-feature-api.test.ts" },
  { name: "auth fsd pages unit", kind: "node", target: "scripts/harness/auth-fsd-pages.test.ts" },
];

export const getVerificationSteps = (regressionFiles?: string[]): VerificationStep[] => {
  const files = regressionFiles ?? readdirSync("scripts").filter((file) => file.endsWith("-check.ts"));
  const regressions = files
    .filter((file) => !["api-contract-check.ts", "form-answers-check.ts"].includes(file))
    .sort()
    .map((file) => ({
      name: `regression: ${file}`,
      kind: "node" as const,
      target: `scripts/${file}`,
    }));

  return [
    ...NODE_CHECKS,
    { name: "lint", kind: "npm", target: "harness:lint" },
    { name: "fsd boundary check", kind: "npm", target: "harness:fsd" },
    { name: "convention check", kind: "npm", target: "harness:convention" },
    { name: "api contract", kind: "npm", target: "check:api" },
    { name: "form contract", kind: "npm", target: "check:forms" },
    ...regressions,
    { name: "scope check", kind: "npm", target: "harness:scope" },
    { name: "build", kind: "npm", target: "build" },
  ];
};

const runNode = (target: string) =>
  spawnSync(
    process.execPath,
    ["--no-warnings", "--experimental-strip-types", target],
    { stdio: "inherit" },
  );

const runNpm = (target: string) =>
  spawnSync(`npm run ${target}`, {
    stdio: "inherit",
    shell: true,
  });

const runCli = () => {
  const steps = getVerificationSteps();
  console.log(`Jobdam Harness Verify: ${steps.length} steps`);

  for (const [index, step] of steps.entries()) {
    console.log(`\n[${index + 1}/${steps.length}] ${step.name}`);
    const result = step.kind === "node" ? runNode(step.target) : runNpm(step.target);
    if (result.status !== 0) {
      console.error(`\n✗ verification failed: ${step.name}`);
      process.exit(result.status ?? 1);
    }
  }

  console.log("\n✓ harness verification passed");
};

if (process.argv[1]?.endsWith("verify.ts")) runCli();
