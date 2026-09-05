import { spawnSync } from "node:child_process";

export const getDiffCheckArgs = (baseRef: string) => [
  ["diff", "--check", `${baseRef}...HEAD`],
  ["diff", "--check"],
  ["diff", "--cached", "--check"],
];

const runCli = () => {
  const baseRef = process.env.HARNESS_BASE_REF || "origin/develop";
  console.log(`Jobdam Diff Check (base: ${baseRef})`);

  for (const args of getDiffCheckArgs(baseRef)) {
    const result = spawnSync("git", args, { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  console.log("\u2713 diff check passed");
};

if (process.argv[1]?.endsWith("diff-check.ts")) runCli();
