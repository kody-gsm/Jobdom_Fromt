import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createCancelProfileConsultation } from "../../src/fsd/features/cancel-consultation/model/createCancelProfileConsultation.ts";

const calls: Array<[string, number]> = [];
const cancel = createCancelProfileConsultation(async (kind, id) => {
  calls.push([kind, id]);
  return "ok";
});
await cancel(9);
assert.deepEqual(calls, [["common", 4]]);

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const route = read("app/profile/page.tsx");
const page = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const api = read("src/fsd/pages/profile/api/profile.ts");
const widget = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.match(route, /@fsd\/pages\/profile/);
assert.match(page, /StudentHeader/);
assert.match(page, /useProfilePage/);
assert.doesNotMatch(page, /fetchUserProfile|cancelProfileConsultation/);
assert.match(api, /getUpcoming/);
assert.doesNotMatch(api, /getAll/);
assert.match(api, /getSession/);
assert.match(api, /requestWithSession<[^>]+>\("\/auth\/profile"\)/);
assert.match(widget, /예약 현황/);
assert.match(widget, /예약 취소/);
assert.doesNotMatch(page, /studentId|학번/);
assert.doesNotMatch(widget, /상담 기록|myMemo|TextAreaField/);

console.log("profile fsd page contract passed");
