import assert from "node:assert/strict";
import { mock } from "node:test";

await import("./api-contract.test.ts");
const bell = await import("node:fs").then(({ readFileSync }) => readFileSync("src/fsd/features/notifications/ui/NotificationBell.tsx", "utf8"));
assert.match(bell, /hover:text-brand/);
assert.match(bell, /open \? "text-brand"/);
const api = await import("../../src/fsd/features/notifications/api/notifications.ts");
const { clearSession } = await import("../../src/fsd/entities/user/index.ts");
const { subscribeNotifications } = await import("../../src/fsd/features/notifications/api/notificationStream.ts");
clearSession();
assert.equal(api.getNotificationTargetUrl("/teacher/course/7"), "/teacher");
assert.equal(api.getNotificationTargetUrl("/student/common/7"), "/");
assert.equal(api.getNotificationTargetUrl("/form/7"), "/forms/7");
assert.equal(api.getNotificationTargetUrl("/recruit/7"), "/recruit/7");
assert.equal(api.getNotificationTargetUrl(null), null);
const calls: { url: string; method: string; authorization: string | null }[] = [];
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url: String(url), method: init?.method || "GET", authorization: new Headers(init?.headers).get("Authorization") });
  return new Response("{}", { headers: { "Content-Type": "application/json" } });
}) as typeof fetch;
sessionStorage.setItem("jobdam_access_token", "notification-test-token");
await api.getNotifications();
await api.getUnreadCount();
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
  subscribeNotifications((item) => received.push(item.id), () => connected++, ctrl.signal);
  await flush();
  const first = FakeStream.instances[0];
  first.dispatchEvent(new Event("connect"));
  first.dispatchEvent(new MessageEvent("notification", { data: '{"id":7}' }));
  first.dispatchEvent(new MessageEvent("notification", { data: 'invalid' }));
  assert.deepEqual(received, [7]);
  assert.equal(connected, 1);
  first.dispatchEvent(new Event("error"));
  assert.equal(first.closed, true);
  mock.timers.tick(3000);
  await flush();
  assert.equal(tickets, 2);
  assert.match(FakeStream.instances[1].url, /ticket=ticket-2$/);
  FakeStream.instances[1].dispatchEvent(new Event("error"));
  ctrl.abort();
  mock.timers.tick(3000);
  await flush();
  assert.equal(tickets, 2);
  console.log("알림 수신·재연결·티켓 재발급·로그아웃 정리 검사 통과");
} finally {
  mock.timers.reset();
}
