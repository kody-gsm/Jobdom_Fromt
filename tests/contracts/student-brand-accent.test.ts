import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const mainBrand = /bg-brand(?:\s|\")/;

const home = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
const profile = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const consultations = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.match(home, mainBrand);
assert.match(home, /hover:bg-\[#00B94C\]/);
assert.doesNotMatch(home, /#10243E|#1B3555|#315B83/);
assert.match(profile, /text-brand-accent/);
assert.doesNotMatch(profile, mainBrand);
assert.doesNotMatch(profile, /#10243E|#1B3555|#315B83/);
assert.match(consultations, mainBrand);
assert.doesNotMatch(consultations, /#10243E|#1B3555|#315B83/);

console.log("student brand accent contract passed");