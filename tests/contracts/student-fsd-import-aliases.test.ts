import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const studentScopeFiles = [
  "src/fsd/app/auth-gate/ui/AuthGate.tsx",
  "src/fsd/app/auth-gate/model/routePolicy.ts",
  "src/fsd/entities/user/api/sessionRequest.ts",
  "src/fsd/entities/consultation/model/refreshCoordinator.ts",
  "src/fsd/features/cancel-consultation/model/createCancelProfileConsultation.ts",
  "src/fsd/features/notifications/api/notificationStream.ts",
  "src/fsd/features/notifications/api/notifications.ts",
  "src/fsd/features/submit-consultation/model/teacherOption.ts",
  "src/fsd/widgets/home-services/model/overview.ts",
  "src/fsd/pages/profile/model/buildUserProfileData.ts",
];

for (const path of studentScopeFiles) {
  assert.doesNotMatch(
    read(path),
    /from ["'](?:\.\.\/){3}(?:entities|shared)\//,
    `${path} must use @fsd aliases for cross-layer imports`,
  );
}

console.log("student FSD import alias contract passed");
