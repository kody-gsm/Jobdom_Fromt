import assert from "node:assert/strict";
import { findRecruitForm } from "../../src/fsd/pages/recruit-detail/model/formMatching.ts";

const forms = [
  { id: 7, title: "Acme 지원서" },
  { id: 8, title: "Other company 지원서" },
];

assert.equal(findRecruitForm(7, forms)?.id, 7);
assert.equal(findRecruitForm(null, forms), null);
assert.equal(findRecruitForm(999, forms), null);

console.log("recruit form link contract passed");
