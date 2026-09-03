import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routes = [
  ["app/teacher/page.tsx", "@fsd/pages/teacher"],
  ["app/teacher/forms/page.tsx", "@fsd/pages/teacher-forms"],
  ["app/teacher/forms/[id]/submissions/page.tsx", "@fsd/pages/teacher-form-submissions"],
  ["app/teacher/recruit/page.tsx", "@fsd/pages/teacher-recruit"],
] as const;

for (const [path, publicApi] of routes) {
  const source = readFileSync(path, "utf8");
  assert.ok(source.includes(publicApi), `${path} must import ${publicApi}`);
  assert.doesNotMatch(source, /useState|useEffect|app\/utils\/api|fetch\(/);
}

const teacherSources = [
  "src/fsd/pages/teacher/ui/TeacherPage.tsx",
  "src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx",
  "src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx",
  "src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx",
];

for (const path of teacherSources) {
  const source = readFileSync(path, "utf8");
  assert.doesNotMatch(source, /@\/app\/utils\/api/);
  assert.doesNotMatch(source, /@\/app\/components/);
}

console.log("teacher fsd completion contract passed");
