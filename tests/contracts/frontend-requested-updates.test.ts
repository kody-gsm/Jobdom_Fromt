import { readFileSync } from "node:fs";

const schedule = readFileSync("src/fsd/entities/consultation/model/schedule.ts", "utf8");
const rules = readFileSync("src/fsd/entities/consultation/model/rules.ts", "utf8");
const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const home = readFileSync("src/fsd/widgets/home-services/ui/HomeServices.tsx", "utf8");
const recruit = readFileSync("src/fsd/entities/recruit/model/types.ts", "utf8");

if (/period:\s*"4교시"/.test(schedule)) throw new Error("4교시 must not be selectable");
if (!rules.includes("BLOCKED_GENERAL_PERIODS") || !rules.includes(".filter")) throw new Error("general consultation periods must filter blocked periods");
if (!form.includes("취업 진로 상담")) throw new Error("career consultation label is missing");
if (!form.includes("상담")) throw new Error("consultation label is missing");
if (!home.includes("배너")) throw new Error("home banner slot is missing");
if (!recruit.includes('"기업" | "공공기관"')) throw new Error("recruit category type is missing");

console.log("frontend requested updates contract passed");
