import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hookPath = "src/fsd/pages/profile/model/useProfilePage.ts";
assert.ok(existsSync(hookPath), "profile page hook is required");

const page = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const hook = read(hookPath);
const consultations = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.match(page, /StudentHeader/);
assert.match(page, /ContentCard/);
assert.match(page, /useProfilePage/);
assert.doesNotMatch(page, /PROFILE|나의 상담 현황|예약된 상담과 지난 상담 기록/);
assert.match(page, /type="file"/);
assert.match(page, /accept="image\/\*"/);
assert.match(page, /사진 변경/);
assert.match(page, /profileAvatar/);
assert.match(hook, /handleAvatarChange/);
assert.match(hook, /readProfileAvatar/);
assert.match(consultations, /예약 현황/);
assert.match(consultations, /예약 취소/);
assert.doesNotMatch(consultations, /상담 기록|상담 상세기록|나의 메모|myMemo|TextAreaField/);
assert.doesNotMatch(page, /history=|handleSaveMemo/);

console.log("student profile cleanup contract passed");
