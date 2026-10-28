import assert from "node:assert/strict";
import { shouldLoadNotificationList } from "../../src/fsd/features/notifications/model/presentation.ts";

assert.equal(shouldLoadNotificationList({ notificationLoaded: false, notificationLoading: false, notificationError: null }), true);
assert.equal(shouldLoadNotificationList({ notificationLoaded: true, notificationLoading: false, notificationError: null }), false);
assert.equal(shouldLoadNotificationList({ notificationLoaded: false, notificationLoading: true, notificationError: null }), false);
assert.equal(shouldLoadNotificationList({ notificationLoaded: false, notificationLoading: false, notificationError: "failed" }), false);

console.log("notification presentation tests passed");
