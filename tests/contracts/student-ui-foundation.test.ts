import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const files = [
  "ActionButton.tsx",
  "TextField.tsx",
  "TextAreaField.tsx",
  "SegmentedTabs.tsx",
  "ContentCard.tsx",
];

for (const file of files) {
  const path = `src/fsd/shared/ui/${file}`;
  assert.ok(existsSync(path), `${path} must exist`);
}

const read = (file: string) => readFileSync(`src/fsd/shared/ui/${file}`, "utf8");
const index = read("index.ts");
for (const file of files) {
  assert.match(index, new RegExp(file.replace(".tsx", "")));
}

assert.match(read("ActionButton.tsx"), /primary[\s\S]*secondary[\s\S]*ghost/);
assert.match(read("TextField.tsx"), /aria-invalid/);
assert.match(read("TextAreaField.tsx"), /aria-invalid/);
assert.match(read("SegmentedTabs.tsx"), /role="tablist"/);
assert.match(read("SegmentedTabs.tsx"), /aria-selected/);
assert.doesNotMatch(read("SegmentedTabs.tsx"), /useState/);
assert.match(read("SegmentedTabs.tsx"), /min-h-11/);
assert.doesNotMatch(read("SegmentedTabs.tsx"), /#02C551/);
assert.match(read("SegmentedTabs.tsx"), /#10243E/);
