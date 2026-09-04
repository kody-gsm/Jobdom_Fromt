import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const model = read("src/fsd/pages/home/model/useHomeStage.ts");
const page = read("src/fsd/pages/home/ui/HomePage.tsx");
const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.match(model, /type HomeStage = "hero" \| "hero-exit" \| "services"/);
assert.match(model, /HERO_ANIMATION_MS\s*=\s*1200/);
assert.match(model, /HERO_HOLD_MS\s*=\s*1000/);
assert.match(model, /HERO_EXIT_MS\s*=\s*600/);
assert.match(model, /setStage\("hero-exit"\)/);
assert.match(model, /setStage\("services"\)/);
assert.match(model, /cancelAnimationFrame/);
assert.match(model, /clearTimeout/);
assert.match(page, /isServicesStage/);
assert.match(services, /aria-hidden=\{!visible\}/);

console.log("home stage transition contract passed");
