import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const stagePath = "src/fsd/pages/home/model/useHomeStage.ts";
const page = read("src/fsd/pages/home/ui/HomePage.tsx");
const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.equal(existsSync(stagePath), false, "staged home intro must be removed");
assert.doesNotMatch(page, /useHomeStage|JOBDAM STUDENT|상담과 취업 준비를 한눈에/);
assert.match(page, /<HomeServices\s*\/>/);
assert.doesNotMatch(services, /overflow-y-auto/);
assert.doesNotMatch(services, /aria-hidden=\{!visible\}/);

console.log("home single-scroll contract passed");
