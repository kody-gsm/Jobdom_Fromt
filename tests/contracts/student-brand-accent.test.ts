import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const home = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
const profile = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const consultations = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.match(home, /bg-\[#02C551\]/);
assert.match(home, /hover:bg-\[#00B94C\]/);
assert.doesNotMatch(home, /#10243E|#1B3555|#315B83/);
assert.match(profile, /text-\[#02A94A\]/);
assert.doesNotMatch(profile, /bg-\[#02C551\]/);
assert.doesNotMatch(profile, /#10243E|#1B3555|#315B83/);
assert.match(consultations, /bg-\[#02C551\]/);
assert.doesNotMatch(consultations, /#10243E|#1B3555|#315B83/);

console.log("student brand accent contract passed");
