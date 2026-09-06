import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const header = read("src/fsd/widgets/student-header/ui/StudentHeader.tsx");
const userIndex = read("src/fsd/entities/user/index.ts");

assert.match(userIndex, /readProfileAvatar/);
assert.match(userIndex, /getProfileAvatarUserKey/);
assert.match(header, /getSession/);
assert.match(header, /readProfileAvatar/);
assert.match(header, /profileAvatar/);
assert.match(header, /src=\{profileAvatar\}/);
assert.match(header, /\/profileIcon\.svg/);

console.log("student header avatar contract passed");