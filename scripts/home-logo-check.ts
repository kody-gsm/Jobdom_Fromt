import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const logoSource = read("app/components/atoms/HomeLogoButton.tsx");

assert.match(logoSource, /router\.push\(["']\/["']\)/);
assert.match(logoSource, /w-14 sm:w-16/);

for (const path of [
  "app/components/organisms/Header.tsx",
  "app/components/organisms/HeaderTwo.tsx",
  "app/teacher/page.tsx",
]) {
  assert.match(read(path), /HomeLogoButton/);
}

const counsel = read("app/counsel/page.tsx");
assert.match(counsel, /useRouter/);
assert.match(counsel, /router\.push\(["']\/["']\)/);
assert.match(counsel, /width="64"/);
assert.match(counsel, /height="33"/);
assert.match(counsel, /height: "100px"/);
assert.match(counsel, /padding: "0 40px"/);

console.log("home logo contract passed");
