import assert from "node:assert/strict";
import { findProtectedPaths } from "./changed-files-check.ts";

assert.deepEqual(
  findProtectedPaths(["app/page.tsx", "features/auth/api/login.ts"]),
  [],
);

assert.deepEqual(
  findProtectedPaths([
    "app/teacher/page.tsx",
    "app/teacher/forms/page.tsx",
    "app/counsel/page.tsx",
  ]),
  ["app/teacher/page.tsx", "app/teacher/forms/page.tsx"],
);