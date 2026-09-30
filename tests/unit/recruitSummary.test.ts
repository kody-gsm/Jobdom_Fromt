import assert from "node:assert/strict";
import { indentSummaryList, parseSummaryMarkdown, splitSummaryEmphasis } from "../../src/fsd/shared/lib/summaryMarkdown.ts";

const blocks = parseSummaryMarkdown("**강조**\n- 부모\n  - 공백 하위\n\t- 탭 하위\n- 다음\n-붙은 글자\n<script>alert(1)</script>");
assert.deepEqual(blocks, [
  { type: "text", text: "**강조**" },
  { type: "list", items: [
    { text: "부모", children: [{ text: "공백 하위", children: [] }, { text: "탭 하위", children: [] }] },
    { text: "다음", children: [] },
  ] },
  { type: "text", text: "-붙은 글자" },
  { type: "text", text: "<script>alert(1)</script>" },
]);
assert.deepEqual(splitSummaryEmphasis("앞 **강조** 뒤 **둘**"), ["앞 ", "**강조**", " 뒤 ", "**둘**", ""]);
assert.deepEqual(splitSummaryEmphasis("**닫히지 않음"), ["**닫히지 않음"]);
assert.deepEqual(indentSummaryList("- 부모\n- 하위", 9, 9), { text: "- 부모\n  - 하위", start: 11, end: 11 });
assert.deepEqual(indentSummaryList("  - 하위", 6, 6, true), { text: "- 하위", start: 4, end: 4 });
assert.equal(indentSummaryList("일반 문장", 2, 2), null);
assert.equal(indentSummaryList("- 목록", 4, 4, true), null);
