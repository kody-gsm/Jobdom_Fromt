import assert from "node:assert/strict";
import { shouldCheckFsdSource, validateFsdImport } from "./fsd-boundary-check.ts";

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

assert.match(
  validateFsdImport("src/fsd/features/login/ui/LoginForm.tsx", "../../../pages/home")[0] ?? "",
  /higher layer/,
);

assert.match(
  validateFsdImport(
    "src/fsd/pages/home/ui/HomePage.tsx",
    "../../../features/login/ui/LoginForm",
  )[0] ?? "",
  /public API/,
);

assert.deepEqual(
  validateFsdImport("src/fsd/shared/api/client.ts", "./ApiError.ts"),
  [],
);

assert.deepEqual(
  validateFsdImport("src/fsd/app/auth-gate/ui/AuthGate.tsx", "../model/routePolicy.ts"),
  [],
);

assert.deepEqual(
  validateFsdImport(
    "src/fsd/features/cancel-consultation/model/createCancelProfileConsultation.ts",
    "../../../entities/consultation/index.ts",
  ),
  [],
);

assert.equal(shouldCheckFsdSource("src/fsd/pages/teacher/ui/TeacherPage.tsx"), false);
assert.equal(shouldCheckFsdSource("src/fsd/pages/teacher-forms/ui/TeacherFormsPage.tsx"), false);
assert.equal(
  shouldCheckFsdSource("src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx"),
  false,
);
assert.equal(shouldCheckFsdSource("src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx"), false);
assert.equal(shouldCheckFsdSource("src/fsd/features/manage-recruit/model/dashboard.ts"), false);
assert.equal(shouldCheckFsdSource("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx"), true);
assert.equal(
  shouldCheckFsdSource("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"),
  true,
);

assert.deepEqual(
  validateFsdImport("src/fsd/pages/teacher/ui/TeacherPage.tsx", "@fsd/pages/home"),
  [],
);
