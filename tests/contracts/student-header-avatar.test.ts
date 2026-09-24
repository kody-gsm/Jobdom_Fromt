import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const header = read("src/fsd/widgets/student-header/ui/StudentHeader.tsx");
const userIndex = read("src/fsd/entities/user/index.ts");

assert.match(userIndex, /readProfileAvatar/);
assert.match(userIndex, /getProfileAvatarUserKey/);
assert.match(userIndex, /useProfileAvatar/);
assert.match(header, /useProfileAvatar/);
assert.doesNotMatch(header, /requestWithSession/);
assert.doesNotMatch(header, /"\/auth\/profile"/);
assert.doesNotMatch(header, /NEXT_PUBLIC_API_BASE_URL/);
assert.match(header, /profileAvatar/);
assert.match(header, /src=\{profileAvatar\}/);
assert.match(header, /\/profileIcon\.svg/);

console.log("student header avatar contract passed");
