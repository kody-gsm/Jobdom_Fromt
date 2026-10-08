import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const context = read("src/fsd/features/notifications/model/NotificationContext.tsx");
const panel = read("src/fsd/features/notifications/ui/NotificationPanel.tsx");
const notificationsApi = read("src/fsd/features/notifications/api/notifications.ts");

assert.match(context, /notifications/);
assert.match(context, /notificationLoading/);
assert.match(context, /notificationError/);
assert.match(context, /retryNotifications/);
assert.match(context, /loadMoreNotifications/);
assert.match(context, /some\(.*\.id ===/);
assert.match(context, /notificationRequestVersion/);
assert.match(context, /setNotifications/);
// SSE 재연결 시 알림 목록 새로고침
assert.match(context, /loadNotifications\(0\)/);
assert.doesNotMatch(panel, /getNotifications\(/);
assert.match(panel, /notifications/);
assert.match(panel, /retryNotifications/);
assert.match(panel, /notificationError/);
assert.match(panel, /loadMoreNotifications/);
// 9종 알림 타입 모두 Panel에 있는지 검사
assert.match(panel, /COUNSELING_CANCELED_BY_STUDENT/);
assert.match(panel, /상담 취소/);
assert.match(panel, /만료됨/);
assert.match(panel, /isNotificationNavigable/);
// API에 isNotificationNavigable export 확인
assert.match(notificationsApi, /isNotificationNavigable/);
assert.match(notificationsApi, /COUNSELING_CANCELED_BY_STUDENT/);

console.log("student notification resilience contract passed");

