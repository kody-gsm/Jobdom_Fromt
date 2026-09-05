import { spawnSync } from "node:child_process";

interface VerificationStep {
  name: string;
  kind: "node" | "npm";
  target: string;
}

interface StepResultSummary {
  status: number | null;
  errorCode?: string;
}

export const DEFAULT_STEP_TIMEOUT_MS = 600_000;

export const resolveStepTimeoutMs = (value = process.env.HARNESS_STEP_TIMEOUT_MS) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STEP_TIMEOUT_MS;
};

export const classifyStepResult = ({ status, errorCode }: StepResultSummary) => {
  if (errorCode === "ETIMEDOUT") return "timeout" as const;
  return status === 0 ? "ok" as const : "failed" as const;
};

const NODE_CHECKS: VerificationStep[] = [
  { name: "harness config", kind: "node", target: "scripts/harness/harness-config-check.ts" },
  { name: "preflight unit", kind: "node", target: "scripts/harness/preflight.test.ts" },
  { name: "changed lint unit", kind: "node", target: "scripts/harness/changed-lint.test.ts" },
  { name: "contract check unit", kind: "node", target: "scripts/harness/contract-check.test.ts" },
  { name: "diff check unit", kind: "node", target: "scripts/harness/diff-check.test.ts" },
  { name: "fsd boundary unit", kind: "node", target: "scripts/harness/fsd-boundary-check.test.ts" },
  { name: "convention unit", kind: "node", target: "scripts/harness/convention-check.test.ts" },
  { name: "branch cleanup unit", kind: "node", target: "scripts/harness/branch-cleanup.test.ts" },
  { name: "readiness unit", kind: "node", target: "scripts/harness/readiness.test.ts" },
  { name: "lightweight harness unit", kind: "node", target: "scripts/harness/lightweight-harness.test.ts" },
  { name: "verify unit", kind: "node", target: "scripts/harness/verify.test.ts" },
];

export const getVerificationSteps = (): VerificationStep[] => [
  ...NODE_CHECKS,
  { name: "contracts", kind: "npm", target: "harness:contracts" },
  { name: "lint", kind: "npm", target: "harness:lint" },
  { name: "fsd boundary check", kind: "npm", target: "harness:fsd" },
  { name: "convention check", kind: "npm", target: "harness:convention" },
  { name: "diff check", kind: "npm", target: "harness:diff" },
  { name: "build", kind: "npm", target: "build" },
];

const runNode = (target: string, timeout: number) =>
  spawnSync(process.execPath, ["--no-warnings", "--experimental-strip-types", target], {
    stdio: "inherit",
    timeout,
  });

const runNpm = (target: string, timeout: number) =>
  spawnSync(`npm run ${target}`, {
    stdio: "inherit",
    shell: true,
    timeout,
  });

const runCli = () => {
  const steps = getVerificationSteps();
  const timeout = resolveStepTimeoutMs();
  console.log(`Jobdam Harness Verify: ${steps.length} steps (timeout: ${timeout}ms/step)`);

  for (const [index, step] of steps.entries()) {
    console.log(`\n[${index + 1}/${steps.length}] ${step.name}`);
    const result = step.kind === "node" ? runNode(step.target, timeout) : runNpm(step.target, timeout);
    const errorCode = result.error && "code" in result.error && typeof result.error.code === "string"
      ? result.error.code
      : undefined;
    const outcome = classifyStepResult({ status: result.status, errorCode });
    if (outcome === "timeout") {
      console.error(`\nx verification timed out after ${timeout}ms: ${step.name}`);
      process.exit(124);
    }
    if (outcome === "failed") {
      console.error(`\nx verification failed: ${step.name}`);
      process.exit(result.status ?? 1);
    }
  }

  console.log("\n\u2713 harness verification passed");
};

if (process.argv[1]?.endsWith("verify.ts")) runCli();
