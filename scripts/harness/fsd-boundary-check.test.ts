import assert from "node:assert/strict";
import { validateFsdImport } from "./fsd-boundary-check.ts";

assert.deepEqual(
  validateFsdImport("src/fsd/pages/home/ui/HomePage.tsx", "@fsd/widgets/header"),
  [],
);

assert.match(
  validateFsdImport("src/fsd/features/login/ui/LoginForm.tsx", "@fsd/widgets/header")[0] ?? "",
  /higher layer/,
);

assert.match(
  validateFsdImport("src/fsd/features/login/model/login.ts", "@fsd/features/logout")[0] ?? "",
  /same-layer cross-slice/,
);

assert.match(
  validateFsdImport("src/fsd/pages/home/ui/HomePage.tsx", "@fsd/features/login/ui/LoginForm")[0] ?? "",
  /public API/,
);

assert.deepEqual(
  validateFsdImport("src/fsd/features/login/ui/LoginForm.tsx", "./LoginButton"),
  [],
);

assert.deepEqual(
  validateFsdImport("src/fsd/features/login/ui/LoginForm.tsx", "@fsd/entities/user"),
  [],
);
