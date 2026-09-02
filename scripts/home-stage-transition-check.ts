import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");

assert.match(source, /type HomeStage = "hero" \| "hero-exit" \| "services"/);
assert.match(source, /HERO_ANIMATION_MS\s*=\s*1200/);
assert.match(source, /HERO_HOLD_MS\s*=\s*2000/);
assert.match(source, /HERO_EXIT_MS\s*=\s*600/);
assert.match(source, /setStage\("hero-exit"\)/);
assert.match(source, /setStage\("services"\)/);
assert.match(source, /overflow-hidden/);
assert.doesNotMatch(source, /border-b border-zinc-300/);
assert.match(source, /delay-\[150ms\]/);
assert.match(source, /delay-\[300ms\]/);
assert.match(source, /delay-\[450ms\]/);

console.log("home stage transition contract passed");
