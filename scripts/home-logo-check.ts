import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const legacyLogo = read("app/components/atoms/HomeLogoButton.tsx");
const navigateHome = read("src/fsd/features/navigate-home/ui/HomeLogoButton.tsx");
const legacyHeader = read("app/components/organisms/Header.tsx");
const siteHeader = read("src/fsd/widgets/site-header/ui/SiteHeader.tsx");

assert.match(legacyLogo, /@fsd\/features\/navigate-home/);
assert.match(navigateHome, /router\.push\(["']\/["']\)/);
assert.match(navigateHome, /w-14 sm:w-16/);
assert.match(legacyHeader, /SiteHeader as Header/);
assert.match(siteHeader, /router\.push\("\/"\)/);
assert.match(siteHeader, /JobdamIcon\.svg/);
assert.match(siteHeader, /w-14 sm:w-16/);

assert.match(read("app/components/organisms/HeaderTwo.tsx"), /HomeLogoButton/);
assert.match(read("src/fsd/pages/teacher/ui/TeacherPage.tsx"), /HomeLogoButton/);

const counselRoute = read("app/counsel/page.tsx");
const counselPage = read("src/fsd/pages/counsel/ui/CounselPage.tsx");
assert.match(counselRoute, /@fsd\/pages\/counsel/);
assert.match(counselPage, /@fsd\/widgets\/site-header/);

console.log("home logo contract passed");
