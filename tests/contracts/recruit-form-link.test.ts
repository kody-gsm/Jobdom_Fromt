import assert from "node:assert/strict";
import { findRecruitForm } from "../../src/fsd/pages/recruit-detail/model/formMatching.ts";

const forms = [
  { id: 7, title: "(주) 잡담 채용 지원서" },
  { id: 8, title: "다른 회사 지원서" },
];

assert.equal(findRecruitForm("잡담", forms)?.id, 7);
assert.equal(findRecruitForm("없는 회사", forms), null);

console.log("recruit form link contract passed");
