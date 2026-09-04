import assert from "node:assert/strict";
import { findProtectedPaths, isTeacherMigrationAllowed } from "./changed-files-check.ts";

assert.deepEqual(
  findProtectedPaths(["app/page.tsx", "features/auth/api/login.ts"]),
  [],
);

assert.deepEqual(
  findProtectedPaths([
    "app/teacher/page.tsx",
    "app/teacher/forms/page.tsx",
    "app/admin/page.tsx",
    "app/counsel/page.tsx",
  ]),
  ["app/teacher/page.tsx", "app/teacher/forms/page.tsx", "app/admin/page.tsx"],
);

assert.deepEqual(
  findProtectedPaths([
    "src/fsd/pages/teacher/ui/TeacherPage.tsx",
    "src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx",
    "src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx",
    "src/fsd/pages/admin/ui/AdminPage.tsx",
    "src/fsd/pages/home/ui/HomePage.tsx",
  ]),
  [
    "src/fsd/pages/teacher/ui/TeacherPage.tsx",
    "src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx",
    "src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx",
    "src/fsd/pages/admin/ui/AdminPage.tsx",
  ],
);

assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd", undefined), true);
assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd-dashboard", undefined), true);
assert.equal(isTeacherMigrationAllowed("refactor/consultation", undefined), false);
assert.equal(isTeacherMigrationAllowed("fix/teacher-layout", "1"), true);
assert.equal(isTeacherMigrationAllowed("refactor/teacher-fsd", "0"), true);
