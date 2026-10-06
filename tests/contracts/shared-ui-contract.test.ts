import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const button = read("src/fsd/shared/ui/Button.tsx");
const input = read("src/fsd/shared/ui/Input.tsx");
const summaryActionCard = read("src/fsd/shared/ui/SummaryActionCard.tsx");
const publicApi = read("src/fsd/shared/ui/index.ts");

assert.match(button, /export const Button/);
assert.match(input, /export const Input/);
assert.match(input, /showPasswordToggle/);
assert.match(input, /rightElement/);
assert.match(summaryActionCard, /className=.*group/);
assert.match(summaryActionCard, /hover:bg-brand-soft/);
assert.match(summaryActionCard, /absolute inset-0/);
assert.match(summaryActionCard, /pointer-events-auto/);
assert.match(summaryActionCard, /onClick=\{onSelect\}/);
assert.match(publicApi, /Button/);
assert.match(publicApi, /Input/);
assert.doesNotMatch(`${button}\n${input}`, /@\/app\//);
