import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const avatarPath = "src/fsd/entities/user/model/profileAvatar.ts";
assert.equal(existsSync(avatarPath), true, "profile avatar helper must exist");

const {
  MAX_PROFILE_AVATAR_BYTES,
  validateProfileAvatarFile,
} = await import("../../src/fsd/entities/user/model/profileAvatar.ts");

assert.equal(MAX_PROFILE_AVATAR_BYTES, 2 * 1024 * 1024);
assert.equal(validateProfileAvatarFile({ type: "image/png", size: 100 }), null);
assert.equal(validateProfileAvatarFile({ type: "text/plain", size: 100 }), "이미지 파일만 선택할 수 있습니다.");
assert.equal(validateProfileAvatarFile({ type: "image/jpeg", size: MAX_PROFILE_AVATAR_BYTES + 1 }), "프로필 이미지는 2MB 이하만 사용할 수 있습니다.");

const source = readFileSync(avatarPath, "utf8");
assert.match(source, /MAX_PROFILE_AVATAR_BYTES/);

console.log("profile avatar contract passed");
