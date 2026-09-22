import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequestVersionGuard } from "../../src/fsd/shared/lib/requestVersion.ts";
import {
  getConsultationCancelError,
} from "../../src/fsd/entities/consultation/model/timePolicy.ts";
import {
  replaceHomeConsultations,
  type HomeOverview,
} from "../../src/fsd/widgets/home-services/model/overview.ts";

const read = (path: string) => readFileSync(path, "utf8");

const requests = createRequestVersionGuard();
const firstRequest = requests.next();
const latestRequest = requests.next();
assert.equal(requests.isLatest(firstRequest), false);
assert.equal(requests.isLatest(latestRequest), true);

assert.equal(
  getConsultationCancelError(
    "2026-09-07",
    "2교시",
    new Date("2026-09-07T08:40:00+09:00"),
  ),
  "상담 시작 1시간 전부터는 취소할 수 없습니다.",
);

const existing: HomeOverview = {
  upcomingConsultations: [],
  recentRecruits: [{
    id: 7,
    companyName: "기존 공고",
    interviewDate: null,
    deadline: null,
    summary: null,
    status: "PUBLISHED",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-01",
  }],
};
const refreshed = replaceHomeConsultations(existing, [], []);
assert.deepEqual(refreshed.recentRecruits, existing.recentRecruits);

const homeHook = read("src/fsd/widgets/home-services/model/useHomeOverview.ts");
const profileHook = read("src/fsd/pages/profile/model/useProfilePage.ts");
const profilePage = read("src/fsd/pages/profile/ui/ProfilePage.tsx");
const dialog = read("src/fsd/entities/consultation/ui/ConsultationCancelDialog.tsx");
const notificationContext = read("src/fsd/features/notifications/model/NotificationContext.tsx");

assert.match(homeHook, /refreshConsultations/);
assert.match(homeHook, /refreshRecruits/);
assert.match(homeHook, /createRequestVersionGuard/);
assert.match(profileHook, /createRequestVersionGuard/);
assert.match(profileHook, /loadProfile\(false\)/);
assert.match(profilePage, /loading && !profile/);
assert.match(dialog, /confirmDisabled/);
assert.match(homeHook, /replaceHomeConsultations/);
assert.match(notificationContext, /reservationRefresh/);

console.log("student consultation refresh contract passed");
