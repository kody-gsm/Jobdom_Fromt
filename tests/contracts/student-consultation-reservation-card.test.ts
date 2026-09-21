import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const cardPath = "src/fsd/shared/ui/SummaryActionCard.tsx";
assert.ok(existsSync(cardPath), "shared summary action card must exist");

const card = readFileSync(cardPath, "utf8");
const profile = readFileSync(
  "src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx",
  "utf8",
);
const home = readFileSync(
  "src/fsd/widgets/home-services/ui/HomeServices.tsx",
  "utf8",
);
const sharedUi = readFileSync("src/fsd/shared/ui/index.ts", "utf8");

assert.match(sharedUi, /SummaryActionCard/);
assert.match(profile, /SummaryActionCard/);
assert.match(home, /SummaryActionCard/);
assert.match(profile, /teacherName/);
assert.match(home, /teacherName/);
assert.match(profile, /actionLabel=\{presentation\.actionLabel\}/);
assert.match(home, /actionLabel=\{item\.actionLabel\}/);
assert.doesNotMatch(card, /Consultation|상담/);
assert.doesNotMatch(home, /const ConsultationRow/);

console.log("student consultation reservation card contract passed");
