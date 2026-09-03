import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const route = read("app/page.tsx");
const page = read("src/fsd/pages/home/ui/HomePage.tsx");
const model = read("src/fsd/pages/home/model/useHomeStage.ts");
const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.match(route, /@fsd\/pages\/home/);
assert.doesNotMatch(route, /useState|useEffect|setTimeout/);
assert.match(page, /SiteHeader/);
assert.match(page, /useHomeStage/);
assert.match(page, /HomeServices/);
assert.doesNotMatch(page, /@\/app\//);

assert.match(model, /HERO_ANIMATION_MS\s*=\s*1200/);
assert.match(model, /HERO_HOLD_MS\s*=\s*1000/);
assert.match(model, /HERO_EXIT_MS\s*=\s*600/);
assert.match(model, /setStage\("hero-exit"\)/);
assert.match(model, /setStage\("services"\)/);
assert.match(model, /clearTimeout/);

assert.match(services, /"\/counsel\?type=career"/);
assert.match(services, /"\/counsel\?type=general"/);
assert.match(services, /"\/recruit"/);
