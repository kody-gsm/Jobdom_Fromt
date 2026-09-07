import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const pages = [
  "src/fsd/pages/counsel/ui/CounselPage.tsx",
  "src/fsd/pages/recruit/ui/RecruitPage.tsx",
  "src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx",
  "src/fsd/pages/forms/ui/FormsPage.tsx",
  "src/fsd/pages/form-detail/ui/FormDetailPage.tsx",
];

for (const path of pages) {
  const source = read(path);
  assert.doesNotMatch(source, /rounded-\[28px\][^\n]*bg-\[#10243E\]/, `${path} must not have a hero panel`);
  assert.doesNotMatch(source, /CONSULTATION|APPLICATION FORMS|FORM RESPONSE|JOBDAM RECRUIT|>RECRUIT</, `${path} must not have decorative English labels`);
}

console.log("student page hero removal contract passed");
