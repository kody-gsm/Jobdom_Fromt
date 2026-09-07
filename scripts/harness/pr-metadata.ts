import { execFileSync } from "node:child_process";

interface PrMetadata {
  title: string;
  baseRefName: string;
  body: string;
}

const REQUIRED_SECTIONS = [
  "## 📝 코드 변경 사항",
  "## 💡 변경 이유",
  "## 🛠️ 구현 방법",
  "## 📌 영향 범위",
  "## ✅ 테스트",
  "## 🌿 반영 브랜치",
];

export const validatePrMetadata = (metadata: PrMetadata) => {
  const errors: string[] = [];
  if (!/^(feat|fix|refactor|test|chore) : .+/.test(metadata.title)) {
    errors.push("PR title must match '<type> : <Korean description>'");
  }
  if (metadata.baseRefName !== "develop") errors.push("PR base must be develop");
  for (const section of REQUIRED_SECTIONS) {
    if (!metadata.body.includes(section)) errors.push(`PR body is missing: ${section}`);
  }
  if (!metadata.body.includes("[x]")) errors.push("PR body must include a checked test result");
  return errors;
};

const runCli = () => {
  let raw: string;
  try {
    raw = execFileSync("gh", ["pr", "view", "--json", "title,baseRefName,body"], { encoding: "utf8" });
  } catch {
    console.log("PR metadata check skipped: no open PR or gh authentication unavailable");
    return;
  }

  const errors = validatePrMetadata(JSON.parse(raw) as PrMetadata);
  if (errors.length > 0) {
    for (const error of errors) console.error(`x ${error}`);
    process.exit(1);
  }
  console.log("✓ PR metadata valid");
};

if (process.argv[1]?.endsWith("pr-metadata.ts")) runCli();
