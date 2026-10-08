import assert from "node:assert/strict";
import { mock } from "node:test";
import { readFileSync } from "node:fs";

await import("./api-contract.test.ts");
const bell = await import("node:fs").then(({ readFileSync }) => readFileSync("src/fsd/features/notifications/ui/NotificationBell.tsx", "utf8"));
assert.match(bell, /hover:text-brand/);
assert.match(bell, /open \? "text-brand"/);
const api = await import("../../src/fsd/features/notifications/api/notifications.ts");
const { clearSession } = await import("../../src/fsd/entities/user/index.ts");
const { subscribeNotifications } = await import("../../src/fsd/features/notifications/api/notificationStream.ts");
const { getSafeInternalPath, getSafeLinkUrl } = await import("../../src/fsd/shared/lib/safeUrl.ts");
const homeServices = readFileSync("src/fsd/widgets/home-services/ui/HomeServices.tsx", "utf8");
clearSession();
assert.equal(getSafeInternalPath("/recruit/7"), "/recruit/7");
assert.equal(getSafeInternalPath("https://example.com"), null);
assert.equal(getSafeInternalPath("//example.com"), null);
assert.equal(getSafeLinkUrl("https://example.com/path"), "https://example.com/path");
assert.equal(getSafeLinkUrl("javascript:alert(1)"), null);
assert.equal(api.getNotificationTargetUrl("/teacher/course/7"), "/teacher");
assert.equal(api.getNotificationTargetUrl("/student/common/7"), "/");
assert.equal(api.getNotificationTargetUrl("/form/7"), "/forms/7");
assert.equal(api.getNotificationTargetUrl("/recruit/7"), "/recruit/7");
assert.equal(api.getNotificationTargetUrl("https://example.com"), null);
assert.equal(api.getNotificationTargetUrl("javascript:alert(1)"), null);
assert.equal(api.getNotificationTargetUrl(null), null);
// isNotificationNavigable 계약 검사
const makeItem = (overrides: Partial<import("../../src/fsd/features/notifications/api/notifications.ts").NotificationItem>) =>
  ({ id: 1, type: "RECRUIT_PUBLISHED", title: "", content: "", targetId: null, targetUrl: null, isRead: false, targetStatus: null, expired: false, createdAt: "", expiresAt: null, ...overrides } as import("../../src/fsd/features/notifications/api/notifications.ts").NotificationItem);
assert.equal(api.isNotificationNavigable(makeItem({})), true, "상태 없으면 이동 가능");
assert.equal(api.isNotificationNavigable(makeItem({ expired: true })), false, "expired=true이면 이동 불가");
assert.equal(api.isNotificationNavigable(makeItem({ targetStatus: "CANCELED" })), false, "CANCELED이면 이동 불가");
assert.equal(api.isNotificationNavigable(makeItem({ targetStatus: "WAITING" })), true, "WAITING이면 이동 가능");
assert.equal(api.isNotificationNavigable(makeItem({ targetStatus: "RESERVED" })), true, "RESERVED이면 이동 가능");
assert.match(homeServices, /getSafeLinkUrl/);
const calls: { url: string; method: string; authorization: string | null }[] = [];
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url: String(url), method: init?.method || "GET", authorization: new Headers(init?.headers).get("Authorization") });
  const body = String(url).includes("unread-count") ? JSON.stringify({ unreadCount: 3 }) : "{}";
  return new Response(body, { headers: { "Content-Type": "application/json" } });
}) as typeof fetch;
sessionStorage.setItem("jobdam_access_token", "notification-test-token");
await api.getNotifications();
assert.equal((await api.getUnreadCount()).unreadCount, 3);
await api.markNotificationRead(7);
await api.markAllNotificationsRead();
await api.issueNotificationSubscribeTicket();
assert.deepEqual(calls.map(({ url, method }) => [url, method]), [
  ["/backend/api/notifications?page=0&size=20", "GET"],
  ["/backend/api/notifications/unread-count", "GET"],
  ["/backend/api/notifications/7/read", "PATCH"],
  ["/backend/api/notifications/read-all", "PATCH"],
  ["/backend/api/notifications/subscribe-ticket", "POST"],
]);
assert.ok(calls.every(({ authorization }) => authorization === "Bearer notification-test-token"));
clearSession();
let tickets = 0;
globalThis.fetch = (async () => new Response(JSON.stringify({ ticket: `ticket-${++tickets}` }), {
  headers: { "Content-Type": "application/json" },
})) as typeof fetch;
class FakeStream extends EventTarget {
  static instances: FakeStream[] = [];
  closed = false;
  url: string;
  constructor(url: string) { super(); this.url = url; FakeStream.instances.push(this); }
  close() { this.closed = true; }
}
Object.defineProperty(globalThis, "EventSource", { value: FakeStream });
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
mock.timers.enable({ apis: ["setTimeout"] });
try {
  const ctrl = new AbortController();
  const received: number[] = [];
  let connected = 0;
  const reservationEvents: unknown[] = [];
  subscribeNotifications(
    (item) => received.push(item.id),
    () => connected++,
    ctrl.signal,
    (event) => reservationEvents.push(event),
  );
  await flush();
  const first = FakeStream.instances[0];
  first.dispatchEvent(new Event("connect"));
  first.dispatchEvent(new MessageEvent("notification", { data: '{"id":7}' }));
  first.dispatchEvent(new MessageEvent("notification", { data: 'invalid' }));
  first.dispatchEvent(new MessageEvent("reservation", {
    data: JSON.stringify({
      counselingType: "COMMON",
      action: "EXPIRED",
      reservationId: 9,
      date: "2026-09-22",
      period: "1교시",
      status: "CANCELED",
      teacherId: 3,
      studentId: 7,
    }),
  }));
  first.dispatchEvent(new MessageEvent("reservation", { data: "invalid" }));
  assert.deepEqual(received, [7]);
  assert.equal(reservationEvents.length, 1);
  assert.equal((reservationEvents[0] as { action: string }).action, "EXPIRED");
  assert.equal(connected, 1);
  first.dispatchEvent(new Event("error"));
  first.dispatchEvent(new Event("error"));
  assert.equal(first.closed, true);
  mock.timers.tick(3000);
  await flush();
  assert.equal(tickets, 2);
  assert.match(FakeStream.instances[1].url, /ticket=ticket-2$/);
  FakeStream.instances[1].dispatchEvent(new Event("connect"));
  assert.equal(connected, 2);
  FakeStream.instances[1].dispatchEvent(new Event("error"));
  ctrl.abort();
  mock.timers.tick(3000);
  await flush();
  assert.equal(tickets, 2);
  console.log("알림 수신·재연결·티켓 재발급·로그아웃 정리 검사 통과");
} finally {
  mock.timers.reset();
}
