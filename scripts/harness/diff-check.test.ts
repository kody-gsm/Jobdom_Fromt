import assert from "node:assert/strict";
import { getDiffCheckArgs } from "./diff-check.ts";

assert.deepEqual(getDiffCheckArgs("origin/develop"), [
  ["diff", "--check", "origin/develop...HEAD"],
  ["diff", "--check"],
  ["diff", "--cached", "--check"],
]);
