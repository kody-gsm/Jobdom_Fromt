import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const cardPath = "src/fsd/shared/ui/ConsultationReservationCard.tsx";
assert.ok(existsSync(cardPath), "shared consultation reservation card must exist");

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

assert.match(card, /예약 취소/);
assert.match(card, /date\.replaceAll\("-", "\."\)/);
assert.match(card, /\{displayDate\} \/ \{period\}/);
assert.match(sharedUi, /ConsultationReservationCard/);
assert.match(profile, /ConsultationReservationCard/);
assert.match(home, /ConsultationReservationCard/);
assert.doesNotMatch(home, /const ConsultationRow/);

console.log("student consultation reservation card contract passed");
