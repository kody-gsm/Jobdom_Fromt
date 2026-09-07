import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const logo = readFileSync("public/JobdamIcon.svg", "utf8");
const refs = execFileSync("git", ["grep", "-n", "JobdamIcon\\.svg", "--", "src"], {
  encoding: "utf8",
});

assert.match(logo, /viewBox="0 0 256 128"/);
assert.match(logo, /href="data:image\/png;base64,/);
assert.doesNotMatch(logo, /<path\b|<rect\b|<circle\b/);
assert.notEqual(refs.trim(), "");

console.log("brand logo asset contract passed");
