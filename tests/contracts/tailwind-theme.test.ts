import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");

assert.match(css, /--color-brand:\s*#02C551/);
assert.match(css, /--color-brand-hover:\s*#02A946/);
assert.match(css, /--color-ink:\s*#13233A/);
assert.match(css, /--color-muted:\s*#8A95A3/);
assert.match(css, /--color-surface:\s*#F4F6F8/);
assert.match(css, /--color-border:\s*#DDE2E7/);
assert.match(css, /--font-sans:\s*"Pretendard Variable"/);
assert.doesNotMatch(css, /display:\s*block\s*!important/);

for (const path of [
  "src/fsd/pages/home/ui/HomePage.tsx",
  "src/fsd/pages/forms/ui/FormsPage.tsx",
  "src/fsd/pages/recruit/ui/RecruitPage.tsx",
  "src/fsd/pages/profile/ui/ProfilePage.tsx",
]) {
  assert.doesNotMatch(readFileSync(path, "utf8"), /style=\{\{\s*fontFamily:/);
}

console.log("tailwind semantic theme contract passed");