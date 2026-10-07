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
assert.match(forms, /URLSearchParams\(window.location.search\)/);
assert.match(forms, /createForm/);
assert.match(forms, /updateForm/);
assert.match(forms, /publishForm/);
assert.match(forms, /closeForm/);
assert.match(forms, /학생 응답 링크를 복사했습니다/);
assert.match(forms, /폼 제목을 입력해주세요/);
assert.match(forms, /getFormInputLimitError\(\{ title, description, questions: editableQuestions \}\)/);
assert.match(forms, /if \(limitError\) return setMessage\(\{ text: limitError, error: true \}\), null/);
assert.equal((forms.match(/maxLength=\{FORM_EDITOR_LIMITS\.TITLE\}/g) ?? []).length, 2);
assert.equal((forms.match(/maxLength=\{FORM_EDITOR_LIMITS\.DESCRIPTION\}/g) ?? []).length, 2);
assert.match(forms, /maxLength=\{FORM_EDITOR_LIMITS\.OPTION\}/);
assert.match(forms, /\{title\.length\}\/\{FORM_EDITOR_LIMITS\.TITLE\}자/);
assert.match(forms, /\{question\.title\.length\}\/\{FORM_EDITOR_LIMITS\.TITLE\}자/);
assert.match(forms, /\{option\.length\}\/\{FORM_EDITOR_LIMITS\.OPTION\}자/);
assert.doesNotMatch(forms, />학생 화면</);
assert.doesNotMatch(forms, /@\/app\/utils\/api|@\/app\/components/);
assert.match(forms, /getFormSubmissions/);
assert.match(forms, /const questionsEditable = selectedId === null \|\| hasResponses === false/);
assert.match(forms, /<fieldset disabled=\{working\}/, "metadata must remain editable for published and closed forms");
assert.match(forms, /<fieldset disabled=\{!questionsEditable\}/, "questions must stay locked until no responses are confirmed");
assert.match(forms, /수정 저장/);
assert.match(forms, /질문을 수정하려면 응답 여부를 다시 확인해주세요/);
assert.match(forms, /응답 여부 다시 확인/);
assert.match(forms, /const hasQuestionChanges = JSON\.stringify\(questions\) !== JSON\.stringify\(savedQuestions\)/);
assert.match(forms, /questionsEditable && hasQuestionChanges/);
assert.match(forms, /\? input : \{ title: input\.title, description: input\.description \}/);
assert.match(forms, /질문 변경 취소/);
assert.match(forms, /!questionsEditable && hasQuestionChanges && <button/);
assert.match(forms, /setQuestions\(savedQuestions\)/);
assert.match(forms, /requests\.current\.isLatest\(requestVersion\)/);
assert.match(forms, /requests\.current\.next\(\)/);
assert.match(forms, /caught instanceof ApiError && caught\.status === 409/);
assert.match(forms, /if \(isQuestionUpdate && caught instanceof ApiError && caught\.status === 409\)/);
assert.match(forms, /questionPatchPending = false;\s*const published = await publishForm/);
assert.match(forms, /handleSaveError\(caught, "공개하지 못했습니다\.", questionPatchPending\)/);
assert.doesNotMatch(forms, /const editable = status === "DRAFT"/);
assert.match(read("src/fsd/pages/teacher-forms/api/forms.ts"), /getFormSubmissions = formApi\.getSubmissions/);

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
