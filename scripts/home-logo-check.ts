import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const logoComponent = "app/components/atoms/HomeLogoButton.tsx";

assert.equal(existsSync(resolve(root, logoComponent)), true, "공통 홈 로고 컴포넌트가 필요합니다.");
const logoSource = read(logoComponent);
assert.match(logoSource, /router\.push\(["']\/["']\)/, "로고 클릭은 앱 라우터로 메인 페이지로 이동해야 합니다.");
assert.match(logoSource, /w-14 sm:w-16/, "메인 Header와 같은 로고 크기를 사용해야 합니다.");

for (const path of [
  "app/components/organisms/Header.tsx",
  "app/components/organisms/HeaderTwo.tsx",
  "app/teacher/page.tsx",
  "app/counsel/page.tsx",
]) {
  const source = read(path);
  assert.match(source, /HomeLogoButton/, `${path}는 공통 홈 로고를 사용해야 합니다.`);
}

for (const path of [
  "app/(auth)/login/page.tsx",
  "app/(auth)/signup/page.tsx",
  "app/(auth)/forgot-password/page.tsx",
]) {
  assert.match(read(path), /JobdamIcon\.svg/, `${path}의 인증 화면 로고는 유지해야 합니다.`);
}

console.log("home logo contract passed");
