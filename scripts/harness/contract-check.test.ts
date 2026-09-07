import assert from "node:assert/strict";
import { selectContractTestFiles } from "./contract-check.ts";

assert.deepEqual(
  selectContractTestFiles(["z.test.ts", "note.md", "a.test.ts", "helper.ts"]),
  ["a.test.ts", "z.test.ts"],
);
