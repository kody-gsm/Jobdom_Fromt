import { spawnSync } from "node:child_process";

interface VerificationStep {
  name: string;
  kind: "node" | "npm";
  target: string;
}

const NODE_CHECKS: VerificationStep[] = [
  { name: "harness config", kind: "node", target: "scripts/harness/harness-config-check.ts" },
  { name: "preflight unit", kind: "node", target: "scripts/harness/preflight.test.ts" },
  { name: "changed lint unit", kind: "node", target: "scripts/harness/changed-lint.test.ts" },
  { name: "fsd boundary unit", kind: "node", target: "scripts/harness/fsd-boundary-check.test.ts" },
  { name: "convention unit", kind: "node", target: "scripts/harness/convention-check.test.ts" },
  { name: "branch cleanup unit", kind: "node", target: "scripts/harness/branch-cleanup.test.ts" },
  { name: "lightweight harness unit", kind: "node", target: "scripts/harness/lightweight-harness.test.ts" },
  { name: "verify unit", kind: "node", target: "scripts/harness/verify.test.ts" },
];

export const getVerificationSteps = (): VerificationStep[] => [
  ...NODE_CHECKS,
  { name: "lint", kind: "npm", target: "harness:lint" },
  { name: "fsd boundary check", kind: "npm", target: "harness:fsd" },
  { name: "convention check", kind: "npm", target: "harness:convention" },
  { name: "build", kind: "npm", target: "build" },
];

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
