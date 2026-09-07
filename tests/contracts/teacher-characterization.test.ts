import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const source = (route: string, fsd: string) => read(existsSync(fsd) ? fsd : route);

const teacher = source(
  "app/teacher/page.tsx",
  "src/fsd/pages/teacher/ui/TeacherPage.tsx",
);
assert.match(teacher, /취업 공고 관리/);
assert.match(teacher, /진로 상담/);
assert.match(teacher, /상담 기록 작성/);
assert.match(teacher, /상담 예약 요청 목록/);
assert.match(teacher, /예약 확정 정보/);
assert.match(teacher, /\/teacher\/recruit/);
assert.match(teacher, /WEEKLY_CLASS_SCHEDULE/);
assert.match(teacher, /getTeacherConsultations\("course"\)/);
assert.match(teacher, /approveConsultation\("course",\s*reservationId\)/);

const forms = source(
  "app/teacher/forms/page.tsx",
  "src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx",
);
assert.match(forms, /폼 관리/);
assert.match(forms, /\/teacher\/recruit/);
assert.match(forms, /\/forms/);
assert.match(forms, /getTeacherForms/);
assert.match(forms, /getTeacherForm/);
assert.match(forms, /createForm/);
assert.match(forms, /updateForm/);
assert.match(forms, /publishForm/);
assert.match(forms, /closeForm/);
assert.match(forms, /폼 제목을 입력해주세요/);
assert.match(forms, /질문 제목을 모두 입력해주세요/);

const submissions = source(
  "app/teacher/forms/[id]/submissions/page.tsx",
  "src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx",
);
assert.match(submissions, /getTeacherForm/);
assert.match(submissions, /getFormSubmissions/);
assert.match(submissions, /getFormSubmission/);
assert.match(submissions, /\/teacher\/forms/);
assert.match(submissions, /제출된 응답이 없습니다/);

const recruit = source(
  "app/teacher/recruit/page.tsx",
  "src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx",
);
assert.match(recruit, /취업 공고 지원 현황/);
assert.match(recruit, /10 \* 1024 \* 1024/);
assert.match(recruit, /analyzeRecruit/);
assert.match(recruit, /getRecruitDashboard/);
assert.match(recruit, /updateRecruit/);
assert.match(recruit, /publishRecruit/);
assert.match(recruit, /\/teacher\/forms/);
assert.match(recruit, /선생님 계정으로 로그인해야 지원 현황을 볼 수 있습니다/);

console.log("teacher characterization contract passed");
