import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/teacher/recruit/page.tsx", "utf8");
const page = readFileSync("src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx", "utf8");

assert.match(route, /@fsd\/pages\/teacher-recruit/);
assert.doesNotMatch(route, /useState|useEffect|app\/utils\/api|fetch\(/);
assert.match(page, /TEACHER WORKSPACE/);
assert.match(page, /취업 공고 지원 현황/);
assert.match(page, /10 \* 1024 \* 1024/);
assert.match(page, /AI로 공고 초안 생성/);
assert.match(page, /\/teacher\/forms/);
assert.match(page, /\/teacher\/forms\?formId=\$\{row\.form\.id\}/);
assert.match(page, /\/teacher\/forms\/\$\{selected\.form\.id\}\/submissions/);
assert.match(page, /onClick=\{\(\) => select\(row\)\}/);
assert.match(page, /onKeyDown=\{\(event\) =>/);
assert.match(page, /tabIndex=\{0\}/);
assert.match(page, /연결 폼 작성하기/);
assert.match(page, /analyzeRecruit/);
assert.match(page, /updateRecruit/);
assert.match(page, /publishRecruit/);
assert.match(page, /deleteRecruit/);
assert.match(page, /DELETE|삭제/);
assert.match(page, /getRecruitDashboard/);
assert.doesNotMatch(page, />학생 화면</);
assert.doesNotMatch(page, /@\/app\/utils\/api|@\/app\/components/);

console.log("teacher recruit page contract passed");
