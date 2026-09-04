import assert from "node:assert/strict";
import { selectLintableFiles } from "./changed-lint.ts";

assert.deepEqual(
  selectLintableFiles(
    [
      "app/page.tsx",
      "features/auth/api/login.ts",
      "docs/harness/WORKFLOW.md",
      "app/teacher/page.tsx",
      "public/logo.svg",
      "scripts/deleted-check.ts",
    ],
    (path) => path !== "scripts/deleted-check.ts",
  ),
  ["app/page.tsx", "features/auth/api/login.ts"],
);

assert.deepEqual(
  selectLintableFiles(["README.md", "docs/a.md"], () => true),
  [],
);
