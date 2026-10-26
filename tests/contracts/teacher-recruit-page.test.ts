import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/teacher/recruit/page.tsx", "utf8");
const page = readFileSync("src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx", "utf8");
const header = readFileSync("src/fsd/widgets/teacher-header/ui/TeacherHeader.tsx", "utf8");

assert.match(route, /@fsd\/pages\/teacher-recruit/);
assert.doesNotMatch(route, /useState|useEffect|app\/utils\/api|fetch\(/);
assert.match(page, /TEACHER WORKSPACE/);
assert.match(page, /취업 공고 지원 현황/);
assert.match(page, /10 \* 1024 \* 1024/);
assert.match(page, /\+ 공고 작성/);
assert.match(page, /createRecruit/);
assert.match(page, /creating/);
assert.match(page, /이미지로 AI 초안 채우기/);
assert.match(page, /이미지 없이 직접 작성해도 됩니다/);
assert.match(page, /\/teacher\/forms/);
assert.doesNotMatch(page, />신청 폼 관리<\//);
assert.match(header, /href: "\/teacher\/forms", label: "신청 폼 관리"/);
assert.match(page, /router\.push\(`\/teacher\/forms\?formId=\$\{recruit\.formId\}`\)/);
assert.match(page, /\/teacher\/forms\/\$\{selected\.form\.id\}\/submissions/);
assert.match(page, /onClick=\{\(\) => select\(row\)\}/);
assert.match(page, /onKeyDown=\{\(event\) =>/);
assert.match(page, /tabIndex=\{0\}/);
assert.match(page, /폼 작성 후 공개/);
assert.match(page, /공개하려면 연결된 지원 폼을 먼저 작성해주세요/);
assert.doesNotMatch(page, /publishRecruit/, "공고는 폼 화면에서 지원 폼과 함께 공개한다");
assert.match(page, /analyzeRecruit/);
assert.match(page, /updateRecruit/);
assert.match(page, /deleteRecruit/);
assert.match(page, /DELETE|삭제/);
assert.match(page, /getRecruitDashboard/);
assert.doesNotMatch(page, />학생 화면</);
assert.doesNotMatch(page, /@\/app\/utils\/api|@\/app\/components/);

console.log("teacher recruit page contract passed");
