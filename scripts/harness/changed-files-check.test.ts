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
import { isTeacherMigrationAllowed } from "./changed-files-check.ts";

assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd", undefined), true);
assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd-dashboard", undefined), true);
assert.equal(isTeacherMigrationAllowed("refactor/consultation", undefined), false);
assert.equal(isTeacherMigrationAllowed("fix/teacher-layout", "1"), true);
assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd", "0"), true);
