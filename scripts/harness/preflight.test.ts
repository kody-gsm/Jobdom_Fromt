import assert from "node:assert/strict";
import { evaluatePreflight } from "./preflight.ts";

assert.deepEqual(
  evaluatePreflight({ branch: "refactor/consultation", conflicts: [], changedFiles: [] }),
  { errors: [], warnings: [] },
);

assert.deepEqual(
  evaluatePreflight({ branch: "develop", conflicts: [], changedFiles: [] }).errors,
  ["protected branch 'develop'에서 직접 구현하지 않는다"],
);

assert.deepEqual(
  evaluatePreflight({ branch: "fix/test", conflicts: ["app/page.tsx"], changedFiles: ["x.ts"] }),
  {
    errors: ["merge conflict 존재: app/page.tsx"],
    warnings: ["기존 working-tree 변경 1개 존재"],
  },
);