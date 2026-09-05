import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hookPath = "src/fsd/pages/profile/model/useProfilePage.ts";

assert.ok(existsSync(hookPath), "profile page hook is required");

const page = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const hook = read(hookPath);
const consultations = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");

assert.match(page, /StudentHeader/);
assert.match(page, /ContentCard/);
assert.match(page, /useProfilePage/);
assert.doesNotMatch(page, /useState|useEffect|fetchUserProfile|cancelProfileConsultation/);

assert.match(hook, /fetchUserProfile/);
assert.match(hook, /cancelProfileConsultation/);
assert.match(hook, /handleSaveMemo/);

assert.match(page, /나의 상담 현황/);
assert.match(consultations, /ContentCard/);
assert.match(consultations, /TextAreaField/);
assert.match(consultations, /ActionButton/);

assert.match(consultations, /onClick=\{onOpen\} className="[^"]*min-h-11/);
assert.match(consultations, /setCancelTarget\(item\.id\)\}[\s\S]{0,120}className="[^"]*min-h-11/);
assert.match(consultations, /onClick=\{onClose\} className="[^"]*min-h-11/);
assert.match(consultations, /openHistoryDetail\(item\)\}[\s\S]{0,140}className="[^"]*min-h-11/);
assert.match(consultations, /setIsEditingMemo\(true\)\}[\s\S]{0,140}className="[^"]*min-h-11/);
