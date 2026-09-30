import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const availability = read("src/fsd/features/submit-consultation/model/useConsultationAvailability.ts");
const form = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
const ui = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");

assert.match(availability, /availabilityStatus/);
assert.match(availability, /retryAvailability/);
assert.match(availability, /availabilityStatus !== "success"/);
assert.match(availability, /setAvailabilityStatus\("error"\)/);
assert.match(availability, /setAvailabilityStatus\("error"\)/);
assert.match(form, /availabilityStatus/);
assert.match(form, /retryAvailability/);
assert.match(ui, /setCalendarDate/);
assert.match(ui, /\[selectedDate\]/);

console.log("student consultation availability resilience contract passed");
