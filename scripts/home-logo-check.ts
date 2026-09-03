import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const legacyLogo = read("app/components/atoms/HomeLogoButton.tsx");
const legacyHeader = read("app/components/organisms/Header.tsx");
const siteHeader = read("src/fsd/widgets/site-header/ui/SiteHeader.tsx");

assert.match(legacyLogo, /router\.push\(["']\/["']\)/);
assert.match(legacyLogo, /w-14 sm:w-16/);
assert.match(legacyHeader, /SiteHeader as Header/);
assert.match(siteHeader, /router\.push\("\/"\)/);
assert.match(siteHeader, /JobdamIcon\.svg/);
assert.match(siteHeader, /w-14 sm:w-16/);

for (const path of [
  "app/components/organisms/HeaderTwo.tsx",
  "app/teacher/page.tsx",
]) {
  assert.match(read(path), /HomeLogoButton/);
}

const counsel = read("app/counsel/page.tsx");
assert.match(counsel, /router\.push\(["']\/["']\)/);
assert.match(counsel, /width="64"/);
assert.match(counsel, /height="33"/);

console.log("home logo contract passed");
