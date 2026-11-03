import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { getTutorialSteps } from "../../src/fsd/features/role-tutorial/model/steps.ts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const gate = read("src/fsd/features/role-tutorial/ui/RoleTutorialGate.tsx");
const tutorial = read("src/fsd/features/role-tutorial/ui/Tutorial.tsx");

assert.match(read("src/fsd/app/auth-gate/ui/AuthGate.tsx"), /<RoleTutorialGate>\{children\}<\/RoleTutorialGate>/);
assert.match(read("src/fsd/features/role-tutorial/api/tutorialApi.ts"), /createTutorialApi\(requestWithSession\)/);

// 완료 여부는 계정 단위 서버 상태만 사용한다.
assert.match(gate, /tutorialApi\.isCompleted\(controller\.signal\)/);
assert.match(gate, /await tutorialApi\.complete\(\)/);
assert.match(gate, /AbortController/);
assert.doesNotMatch(gate, /localStorage|sessionStorage/);

// 안내는 실제 화면 위에서 진행한다. 실제 화면은 언마운트하지 않고 잠그기만 하며, 가짜 예시 화면을 두지 않는다.
assert.match(gate, /inert=\{mode !== null\}>\{children\}<\/div>/);
assert.equal(existsSync("src/fsd/features/role-tutorial/ui/TutorialPreview.tsx"), false);
assert.match(tutorial, /router\.push\(step\.route\)/);
assert.match(tutorial, /useSpotlight\(step\.target/);

// 스크롤할 때마다 React 상태로 다시 렌더링하거나 화면 전체 그림자를 다시 그리지 않는다.
const spotlightHook = read("src/fsd/features/role-tutorial/model/useSpotlight.ts");
assert.match(spotlightHook, /requestAnimationFrame/);
assert.match(spotlightHook, /setAttribute\("d"/);
assert.match(spotlightHook, /style\.transform/);
assert.doesNotMatch(tutorial, /9999px|boxShadow/);

// 완료 저장이 끝나기 전에는 튜토리얼을 닫지 않고, 실패하면 다시 시도할 수 있다.
assert.match(tutorial, /await onComplete\(\)/);
assert.match(tutorial, /disabled=\{isCompleting\}/);
assert.match(tutorial, /role="alert"/);
assert.match(tutorial, /다시 시도/);
assert.doesNotMatch(tutorial, /건너뛰기|skip/i);

// 프로필에서 언제든 다시 볼 수 있다.
assert.match(read("src/fsd/pages/profile/ui/ProfilePage.tsx"), /<TutorialReplayButton \/>/);

// 모든 단계가 가리키는 요소가 실제 화면 코드에 존재해야 안내와 화면이 어긋나지 않는다.
const sourceFiles = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".tsx") ? [path] : [];
});
const screenSource = sourceFiles("src/fsd").map((path) => readFileSync(path, "utf8")).join("\n");
for (const role of ["STUDENT", "TEACHER", "WEE_TEACHER"] as const) {
  for (const step of getTutorialSteps(role)) {
    assert.ok(screenSource.includes(`data-tutorial-target="${step.target}"`), `${role} ${step.id}: ${step.target} 요소가 실제 화면에 없습니다.`);
  }
}

console.log("role tutorial contract passed");
