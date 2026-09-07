import assert from "node:assert/strict";
import { validatePrMetadata } from "./pr-metadata.ts";

const validBody = [
  "# ✨ PR 내용",
  "## 📝 코드 변경 사항",
  "## 💡 변경 이유",
  "## 🛠️ 구현 방법",
  "## 📌 영향 범위",
  "## ✅ 테스트",
  "- [x] harness:verify",
  "## 🌿 반영 브랜치",
].join("\n");

assert.deepEqual(validatePrMetadata({
  title: "feat : 상담 화면 개선",
  baseRefName: "develop",
  body: validBody,
}), []);

assert.match(validatePrMetadata({
  title: "feat: bad title",
  baseRefName: "main",
  body: "",
})[0] ?? "", /title|base|body/);

console.log("PR metadata contract passed");
