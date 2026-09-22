import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCancelTargetInvalidationNotice } from "../../src/fsd/widgets/home-services/model/cancelTarget.ts";

const homeServices = readFileSync(
  "src/fsd/widgets/home-services/ui/HomeServices.tsx",
  "utf8",
);

assert.equal(
  getCancelTargetInvalidationNotice(4, []),
  "상담 상태가 변경되어 취소 창을 닫았습니다.",
);
assert.equal(getCancelTargetInvalidationNotice(null, []), "");
assert.match(homeServices, /getCancelTargetInvalidationNotice/);
assert.match(homeServices, /setCancelTarget\(null\)/);
assert.match(homeServices, /reservationChangeNotice/);

console.log("student consultation modal sync contract passed");
