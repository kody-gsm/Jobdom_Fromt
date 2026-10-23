import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

// 완료 저장이 끝나기 전에는 튜토리얼을 닫지 않고, 실패하면 다시 시도할 수 있다.
assert.match(tutorial, /await onComplete\(\)/);
assert.match(tutorial, /disabled=\{isCompleting\}/);
assert.match(tutorial, /role="alert"/);
assert.match(tutorial, /다시 시도/);
assert.doesNotMatch(tutorial, /건너뛰기|skip/i);

console.log("role tutorial contract passed");
