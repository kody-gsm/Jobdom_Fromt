import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isConsultationCancelable,
  isConsultationUpcoming,
} from "../../src/fsd/entities/consultation/model/timePolicy.ts";

const beforeCutoff = new Date("2026-09-07T08:39:59+09:00");
const atCutoff = new Date("2026-09-07T08:40:00+09:00");
const beforeStart = new Date("2026-09-07T09:39:59+09:00");
const atStart = new Date("2026-09-07T09:40:00+09:00");

assert.equal(isConsultationCancelable("2026-09-07", "2교시", beforeCutoff), true);
assert.equal(isConsultationCancelable("2026-09-07", "2교시", atCutoff), false);
assert.equal(isConsultationUpcoming("2026-09-07", "2교시", beforeStart), true);
assert.equal(isConsultationUpcoming("2026-09-07", "2교시", atStart), false);
assert.equal(isConsultationUpcoming("2026-09-06", "점심시간", beforeCutoff), false);

const home = readFileSync("src/fsd/widgets/home-services/ui/HomeServices.tsx", "utf8");
const profile = readFileSync("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx", "utf8");
const card = readFileSync("src/fsd/shared/ui/SummaryActionCard.tsx", "utf8");
assert.match(home, /cancelProfileConsultation|handleCancel/);
assert.match(home, /isConsultationCancelable\(item\.date, item\.period, new Date\(\)\)/);
assert.match(profile, /isConsultationCancelable\(target\.date, target\.slot, new Date\(\)\)/);
assert.match(home, /actionDisabled=\{!isConsultationCancelable\(item\.date, item\.period, now\)\}/);
assert.match(profile, /actionDisabled=\{!isConsultationCancelable\(item\.date, item\.slot, now\)\}/);
assert.match(card, /disabled=\{actionDisabled \|\| actionPending\}/);
console.log("student consultation time policy contract passed");
