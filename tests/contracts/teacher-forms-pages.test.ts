import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const formsRoute = read("app/teacher/forms/page.tsx");
const forms = read("src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx");
const submissionsRoute = read("app/teacher/forms/[id]/submissions/page.tsx");
const submissions = read(
  "src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx",
);

assert.match(formsRoute, /@fsd\/pages\/teacher-forms/);
assert.doesNotMatch(formsRoute, /useState|getTeacherForms|createForm/);
assert.match(forms, /폼 관리/);
assert.match(forms, /getTeacherForms/);
assert.match(forms, /getTeacherForm/);
assert.match(forms, /createForm/);
assert.match(forms, /updateForm/);
assert.match(forms, /publishForm/);
assert.match(forms, /closeForm/);
assert.match(forms, /학생 응답 링크를 복사했습니다/);
assert.match(forms, /폼 제목을 입력해주세요/);
assert.doesNotMatch(forms, /@\/app\/utils\/api|@\/app\/components/);

assert.match(submissionsRoute, /@fsd\/pages\/teacher-form-submissions/);
assert.doesNotMatch(submissionsRoute, /useState|getFormSubmissions/);
assert.match(submissions, /getTeacherForm/);
assert.match(submissions, /getFormSubmissions/);
assert.match(submissions, /getFormSubmission/);
assert.match(submissions, /loadedSubmissions\[0\]/);
assert.match(submissions, /제출된 응답이 없습니다/);
assert.match(submissions, /\/teacher\/forms/);
assert.doesNotMatch(submissions, /@\/app\/utils\/api|@\/app\/components/);

console.log("teacher forms pages contract passed");
