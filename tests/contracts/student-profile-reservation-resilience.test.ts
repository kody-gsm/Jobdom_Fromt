import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const api = read("src/fsd/pages/profile/api/profile.ts");
const hook = read("src/fsd/pages/profile/model/useProfilePage.ts");
const widget = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.doesNotMatch(api, /Promise\.all\(/);
assert.match(api, /course/);
assert.match(api, /common/);
assert.match(api, /errors/);
assert.match(hook, /reservationError/);
assert.match(hook, /result\.reservations/);
assert.match(widget, /reservationChangedMessage/);
assert.match(widget, /cancelTargetItem/);
assert.match(widget, /role="status"/);

console.log("student profile reservation resilience contract passed");
