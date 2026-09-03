import assert from "node:assert/strict";
import { selectLintableFiles } from "./changed-lint.ts";

assert.deepEqual(
  selectLintableFiles([
    "app/page.tsx",
    "features/auth/api/login.ts",
    "docs/harness/WORKFLOW.md",
    "app/teacher/page.tsx",
    "public/logo.svg",
  ]),
  ["app/page.tsx", "features/auth/api/login.ts"],
);

assert.deepEqual(selectLintableFiles(["README.md", "docs/a.md"]), []);