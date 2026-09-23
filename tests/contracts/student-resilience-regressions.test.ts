import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildHomeOverview } from "../../src/fsd/widgets/home-services/model/overview.ts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const overview = buildHomeOverview({
  course: [
    { id: 1, name: "five", teacherId: 1, teacherName: "A", date: "2026-09-23", period: "5교시", status: "RESERVED" },
    { id: 2, name: "lunch", teacherId: 2, teacherName: "B", date: "2026-09-23", period: "점심시간", status: "RESERVED" },
    { id: 3, name: "eighth", teacherId: 3, teacherName: "C", date: "2026-09-23", period: "8교시", status: "RESERVED" },
  ],
  common: [],
  recruits: [],
});
assert.deepEqual(
  overview.upcomingConsultations.map(({ period }) => period),
  ["점심시간", "5교시", "8교시"],
);

const consultationHook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
assert.match(consultationHook, /selectedDateRef/);
assert.match(consultationHook, /const koreaToday = getKoreaDate\(\)/);
assert.match(consultationHook, /useMemo\(\(\) => getNextWeekdays\(\), \[koreaToday\]\)/);
assert.match(consultationHook, /setSelectedTime\(null\)/);
assert.match(consultationHook, /setTeachers\(\[\]\)/);
assert.match(consultationHook, /setTeacherStatus\("loading"\)/);
assert.match(consultationHook, /items\.some/);

const rules = read("src/fsd/entities/consultation/model/rules.ts");
assert.match(rules, /KOREA_TIME_ZONE = "Asia\/Seoul"/);
assert.match(rules, /getNextWeekdays/);
assert.match(rules, /getNextAvailableDate/);
assert.match(rules, /setUTCDate|Date\.UTC/);

const homeHook = read("src/fsd/widgets/home-services/model/useHomeOverview.ts");
const homePage = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
assert.match(homeHook, /consultationLoading/);
assert.match(homeHook, /consultationHasLoaded/);
assert.match(homeHook, /if \(!consultationHasLoaded\.current\)/);
assert.match(homeHook, /recruitLoading/);
assert.match(homeHook, /retryConsultations/);
assert.match(homeHook, /retryRecruits/);
assert.match(homePage, /onRetry/);
assert.match(homePage, /consultationLoading && !hasConsultationData/);

const recruitDetailHook = read("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
assert.doesNotMatch(recruitDetailHook, /Promise\.all\(\[getRecruit/);
assert.match(recruitDetailHook, /formError/);

const profileApi = read("src/fsd/pages/profile/api/profile.ts");
const fetchUserProfileSource = profileApi.slice(
  profileApi.indexOf("export const fetchUserProfile"),
  profileApi.indexOf("export const fetchProfileReservations"),
);
assert.doesNotMatch(fetchUserProfileSource, /Promise\.all/);

const profileHook = read("src/fsd/pages/profile/model/useProfilePage.ts");
const profilePage = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const profileWidget = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");
assert.match(profileHook, /const \[reservations, setReservations\]/);
assert.match(profileHook, /profileWithReservations/);
assert.match(profileHook, /\.\.\.profile, reservations/);
assert.match(profileHook, /reservationError/);
assert.match(profileHook, /reservationHasLoaded/);
assert.match(profilePage, /reservationError/);
assert.match(profileWidget, /onRetry/);
assert.match(profileWidget, /loading && reservations\.length === 0/);

const formsHook = read("src/fsd/pages/forms/model/useFormsPage.ts");
const formsPage = read("src/fsd/pages/forms/ui/FormsPage.tsx");
assert.match(formsHook, /retry/);
assert.match(formsPage, /onRetry/);
assert.match(formsPage, /error \?/);

console.log("student resilience regressions contract passed");
