import assert from "node:assert/strict";
import { validateFsdPath, validateFsdSource } from "./convention-check.ts";

assert.deepEqual(validateFsdPath("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"), []);

assert.match(
  validateFsdPath("src/fsd/features/SubmitConsultation/ui/ConsultationForm.tsx")[0] ?? "",
  /kebab-case/,
);

assert.match(
  validateFsdPath("src/fsd/features/login/hooks/useLogin.ts")[0] ?? "",
  /segment/,
);

assert.match(
  validateFsdPath("src/fsd/shared/lib/utils.ts")[0] ?? "",
  /generic dump file/,
);

assert.match(
  validateFsdSource("src/fsd/features/login/ui/LoginForm.tsx", "const x = fetch('/backend/login');")[0] ?? "",
  /fetch.*api segment/,
);

assert.match(
  validateFsdSource("src/fsd/features/login/ui/LoginForm.tsx", "console.log('debug');")[0] ?? "",
  /console\.log/,
);

assert.deepEqual(
  validateFsdSource("src/fsd/features/login/api/login.ts", "return fetch('/backend/login');"),
  [],
);
