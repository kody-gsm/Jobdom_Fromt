import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const route = read("app/page.tsx");
const page = read("src/fsd/pages/home/ui/HomePage.tsx");
const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.match(route, /@fsd\/pages\/home/);
assert.doesNotMatch(route, /useState|useEffect|setTimeout/);
assert.match(page, /StudentHeader/);
assert.match(page, /HomeServices/);
assert.doesNotMatch(page, /useHomeStage|JOBDAM STUDENT|학생 대시보드에서 바로 시작하세요/);
assert.doesNotMatch(page, /@\/app\//);
assert.match(services, /href="\/counsel"/);
assert.match(services, /상담 신청/);
assert.match(services, /예정 상담/);
assert.match(services, /취업 공고/);
assert.doesNotMatch(services, /CAREER|LIFE|COUNSEL|RECRUIT|빠른 메뉴|GSM 취업/);
assert.doesNotMatch(services, /counsel\?type=career|counsel\?type=general/);
assert.doesNotMatch(services, /overflow-y-auto/);
assert.match(services, /role="dialog"/);

console.log("home fsd cleanup contract passed");
