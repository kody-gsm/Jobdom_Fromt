import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const avatar = read("src/fsd/entities/user/model/useProfileAvatar.ts");
const change = read("src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts");
const helper = read("src/fsd/entities/user/model/profileAvatar.ts");

assert.match(helper, /CustomEvent/);
assert.match(helper, /userKey/);
assert.match(avatar, /jobdam-session/);
assert.match(avatar, /requestVersion/);
assert.match(avatar, /getProfileAvatarUserKey/);
assert.match(change, /uploadRequestVersion/);
assert.match(change, /const session = getSession\(\)/);
assert.match(change, /getSession\(\)[\s\S]*userKey/);
assert.match(change, /saveProfileAvatar\(userKey/);

console.log("student profile avatar identity contract passed");
