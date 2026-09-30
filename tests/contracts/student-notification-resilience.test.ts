import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const context = read("src/fsd/features/notifications/model/NotificationContext.tsx");
const panel = read("src/fsd/features/notifications/ui/NotificationPanel.tsx");

assert.match(context, /notifications/);
assert.match(context, /notificationLoading/);
assert.match(context, /notificationError/);
assert.match(context, /retryNotifications/);
assert.match(context, /loadMoreNotifications/);
assert.match(context, /some\(.*\.id ===/);
assert.match(context, /notificationRequestVersion/);
assert.match(context, /setNotifications/);
assert.doesNotMatch(panel, /getNotifications\(/);
assert.match(panel, /notifications/);
assert.match(panel, /retryNotifications/);
assert.match(panel, /notificationError/);
assert.match(panel, /loadMoreNotifications/);

console.log("student notification resilience contract passed");
