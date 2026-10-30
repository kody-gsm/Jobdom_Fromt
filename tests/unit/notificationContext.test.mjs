import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";

const require = createRequire(import.meta.url);
const React = require("react");
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const slice = join(root, "src/fsd/features/notifications");

const { act, create } = require("react-test-renderer");
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const compile = (path, dependencies, cache = new Map()) => {
  if (cache.has(path)) return cache.get(path).exports;
  const compiledModule = { exports: {} };
  cache.set(path, compiledModule);
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: path,
  }).outputText;
  runInThisContext(`(function(require, module, exports) {${source}\n})`, { filename: path })(
    (specifier) => {
      if (specifier in dependencies) return dependencies[specifier];
      if (!specifier.startsWith(".")) return require(specifier);
      const target = resolve(dirname(path), specifier);
      const file = [target, `${target}.tsx`, `${target}.ts`].find(existsSync);
      assert.ok(file, `Cannot resolve ${specifier}`);
      return compile(file, dependencies, cache);
    }, compiledModule, compiledModule.exports,
  );
  return compiledModule.exports;
};

const deferred = () => {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
};

const item = (id, overrides = {}) => ({
  id, type: "FORM_PUBLISHED", title: `Notification ${id}`, content: "New form",
  targetId: id, targetUrl: `/forms/${id}`, isRead: false, targetStatus: null,
  expired: false, createdAt: `2026-10-30T09:00:${String(id).padStart(2, "0")}`,
  expiresAt: null, ...overrides,
});
const page = (content, last = true) => ({
  content, totalElements: content.length, totalPages: last ? 1 : 2,
  number: 0, size: 20, last,
});

const setup = async (t, { authenticated = true, strict = false } = {}) => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousError = console.error;
  console.error = (...args) => {
    if (!String(args[0]).startsWith("react-test-renderer is deprecated")) previousError(...args);
  };
  const intervals = new Map();
  let nextInterval = 0;
  const window = Object.assign(new EventTarget(), {
    setInterval: (callback) => { intervals.set(++nextInterval, callback); return nextInterval; },
    clearInterval: (id) => intervals.delete(id),
  });
  globalThis.window = window;
  globalThis.document = new EventTarget();
  let session = authenticated ? { userId: 1, accessToken: "initial-token" } : null;
  let sessionVersion = 0;
  const counts = [];
  const lists = [];
  const streams = [];
  const writes = [];
  const api = {
    getNotificationTargetUrl: (url) => url,
    isNotificationNavigable: () => true,
    getUnreadCount: (init) => {
      assert.equal(init.cache, "no-store");
      const request = deferred(); counts.push(request); return request.promise;
    },
    getNotifications: (requestedPage, size, init) => {
      const request = { ...deferred(), page: requestedPage, size, init };
      lists.push(request); return request.promise;
    },
    markNotificationRead: (id) => {
      const request = { ...deferred(), id }; writes.push(request); return request.promise;
    },
    markAllNotificationsRead: () => {
      const request = deferred(); writes.push(request); return request.promise;
    },
  };
  const dependencies = {
    "../api/notifications.ts": api,
    "@fsd/entities/user": {
      getSession: () => session,
      getSessionVersion: () => sessionVersion,
    },
    "@fsd/entities/consultation": { RESERVATION_CHANGED_EVENT: "reservation-changed" },
    "../api/notificationStream.ts": {
      subscribeNotifications: (receive, connect, signal, reservation) => {
        streams.push({ receive, connect, signal, reservation });
      },
    },
    "next/navigation": { useRouter: () => ({ push: () => {} }) },
  };
  const cache = new Map();
  const context = compile(join(slice, "model/NotificationContext.tsx"), dependencies, cache);
  const renders = { unread: 0, list: 0, toast: 0, actions: 0 };
  const values = {};
  const hooks = {
    unread: context.useNotificationUnreadCount ?? (() => context.useNotification().unreadCount),
    list: context.useNotificationList ?? (() => context.useNotification()),
    toast: context.useNotificationToasts ?? (() => context.useNotification().toasts),
    actions: context.useNotificationActions ?? (() => context.useNotification()),
  };
  const Probe = ({ kind }) => { renders[kind]++; values[kind] = hooks[kind](); return null; };
  let renderer;
  let unmounted = false;
  const children = Object.keys(hooks).map((kind) => React.createElement(Probe, { kind, key: kind }));
  const tree = (extra = null) => {
    const provider = React.createElement(context.NotificationProvider, null, ...children, extra);
    return strict ? React.createElement(React.StrictMode, null, provider) : provider;
  };
  await act(async () => { renderer = create(tree()); });
  const unmount = async () => {
    if (!unmounted) { await act(async () => renderer.unmount()); unmounted = true; }
  };
  t.after(async () => {
    await unmount();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    console.error = previousError;
  });
  return {
    counts, lists, streams, writes, intervals, values, renders, window,
    changeSession: async (next, { isRefresh = false, emit = true } = {}) => {
      await act(async () => {
        session = next;
        if (!isRefresh) sessionVersion++;
        if (emit) window.dispatchEvent(new Event("jobdam-session"));
      });
    },
    receive: async (...items) => {
      await act(async () => { for (const notification of items) streams.at(-1).receive(notification); });
    },
    settle: async (request, value) => { await act(async () => request.resolve(value)); },
    reject: async (request) => { await act(async () => request.reject(new Error("offline"))); },
    renderUi: async (name) => {
      const component = compile(join(slice, `ui/${name}.tsx`), dependencies, cache)[name];
      await act(async () => renderer.update(tree(React.createElement(component))));
      return renderer;
    },
    unmount,
  };
};

test("notification bursts share one count request and finish with an authoritative trailing refresh", async (t) => {
  const h = await setup(t);
  assert.equal(h.counts.length, 1);
  await h.receive(item(1), item(2), item(3));
  assert.equal(h.values.unread, 3);
  assert.equal(h.counts.length, 1, "SSE bursts must not overlap count GETs");
  await h.settle(h.counts[0], { unreadCount: 0 });
  assert.equal(h.values.unread, 3, "a queued refresh must not flash an obsolete count");
  assert.equal(h.counts.length, 2);
  await h.settle(h.counts[1], { unreadCount: 7 });
  assert.equal(h.values.unread, 7);
  assert.equal(h.lists.length, 0, "SSE must not eagerly load the list");
});

test("failed count requests still drain queued reconnect/poll refreshes", async (t) => {
  const h = await setup(t);
  await act(async () => {
    h.streams[0].connect(true);
    for (const poll of h.intervals.values()) poll();
  });
  assert.equal(h.counts.length, 1);
  await h.reject(h.counts[0]);
  assert.equal(h.counts.length, 2);
  await h.settle(h.counts[1], { unreadCount: 4 });
  assert.equal(h.values.unread, 4);
});

test("events during the trailing request schedule another serialized refresh", async (t) => {
  const h = await setup(t);
  await h.receive(item(1));
  await h.settle(h.counts[0], { unreadCount: 0 });
  assert.equal(h.counts.length, 2);
  await h.receive(item(2), item(3));
  assert.equal(h.counts.length, 2);
  await h.settle(h.counts[1], { unreadCount: 1 });
  assert.equal(h.counts.length, 3);
  await h.settle(h.counts[2], { unreadCount: 9 });
  assert.equal(h.values.unread, 9);
});

test("toast/list/count updates leave unrelated subscriptions and action references stable", async (t) => {
  const h = await setup(t);
  await h.settle(h.counts[0], { unreadCount: 5 });
  await h.receive(item(1, { isRead: true }));
  const before = { ...h.renders };
  const actions = h.values.actions;
  await act(async () => actions.dismissToast(1));
  assert.equal(h.renders.unread, before.unread, "toast dismissal must not rerender the bell subscription");
  assert.equal(h.renders.list, before.list);
  assert.equal(h.renders.actions, before.actions);
  assert.equal(h.values.actions, actions);
  const afterToast = { ...h.renders };
  await h.settle(h.counts[1], { unreadCount: 8 });
  assert.equal(h.renders.list, afterToast.list);
  assert.equal(h.renders.toast, afterToast.toast);
  assert.equal(h.values.actions, actions);
  await act(async () => actions.markAllNotificationsReadLocally());
  assert.equal(h.renders.unread, afterToast.unread + 1);
  assert.equal(h.renders.toast, afterToast.toast);
  assert.equal(h.values.list.notifications[0].isRead, true);
});

test("list pagination actions keep their identity and guard same-turn double clicks", async (t) => {
  const h = await setup(t);
  const actions = h.values.actions;
  await act(async () => { void actions.loadNotifications(0); });
  await h.settle(h.lists[0], page([item(1)], false));
  assert.equal(h.values.actions.loadMoreNotifications, actions.loadMoreNotifications);
  await act(async () => {
    actions.loadMoreNotifications(); actions.loadMoreNotifications();
  });
  assert.equal(h.lists.length, 2);
  assert.equal(h.lists[1].page, 1);
  await h.settle(h.lists[1], page([item(2)]));
  assert.deepEqual(h.values.list.notifications.map(({ id }) => id), [2, 1]);
});

test("session replacement invalidates pending list/count work and old SSE callbacks", async (t) => {
  const h = await setup(t);
  await act(async () => { void h.values.actions.loadNotifications(0); });
  const old = h.streams[0];
  let reservations = 0;
  h.window.addEventListener("reservation-changed", () => reservations++);
  await h.changeSession({ userId: 2 });
  assert.equal(old.signal.aborted, true);
  assert.equal(h.intervals.size, 1);
  await act(async () => {
    old.receive(item(40)); old.connect(true); old.reservation();
  });
  assert.equal(reservations, 0);
  assert.equal(h.lists.length, 1);
  await h.settle(h.lists[0], page([item(41)]));
  await h.settle(h.counts[0], { unreadCount: 99 });
  assert.deepEqual(h.values.list.notifications, []);
  assert.equal(h.values.list.notificationLoaded, false);
  await h.settle(h.counts[1], { unreadCount: 2 });
  assert.equal(h.values.unread, 2);
});

test("logout clears state and discards a queued refresh; unmount removes polls and events", async (t) => {
  const h = await setup(t);
  await h.receive(item(1));
  await h.changeSession(null);
  const requestsAtLogout = h.counts.length;
  assert.equal(h.intervals.size, 0);
  assert.equal(h.values.unread, 0);
  assert.deepEqual(h.values.toast, []);
  assert.deepEqual(h.values.list.notifications, []);
  await h.settle(h.counts[0], { unreadCount: 77 });
  assert.equal(h.counts.length, requestsAtLogout);
  await h.unmount();
  await h.changeSession({ userId: 3 });
  assert.equal(h.streams.length, 1);
});

test("StrictMode cleanup prevents obsolete count responses from leaking into the active generation", async (t) => {
  const h = await setup(t, { strict: true });
  assert.equal(h.streams.length, 2);
  assert.equal(h.streams[0].signal.aborted, true);
  assert.equal(h.intervals.size, 1);
  await h.settle(h.counts[0], { unreadCount: 99 });
  await h.settle(h.counts[1], { unreadCount: 2 });
  assert.equal(h.values.unread, 2);
});

test("the bell opens the list lazily, retries errors, and refreshes it only after a reconnect", async (t) => {
  const h = await setup(t);
  const renderer = await h.renderUi("NotificationBell");
  assert.equal(h.lists.length, 0);
  await act(async () => renderer.root.findByProps({ "aria-expanded": false }).props.onClick());
  assert.equal(h.lists.length, 1);
  await h.reject(h.lists[0]);
  assert.equal(h.lists.length, 1, "an error must wait for an explicit retry");
  await act(async () => renderer.root.findByProps({ role: "alert" }).findByType("button").props.onClick());
  await h.settle(h.lists[1], page([item(1)]));
  await act(async () => h.streams[0].connect(false));
  assert.equal(h.lists.length, 2);
  await act(async () => h.streams[0].connect(true));
  assert.equal(h.lists.length, 3);
  await h.settle(h.lists[2], page([item(2)]));
  assert.deepEqual(h.values.list.notifications.map(({ id }) => id), [2]);
});

test("a reconnect bypasses the cached list even though issuing a ticket no longer clears it", async (t) => {
  const h = await setup(t);
  await act(async () => { void h.values.actions.loadNotifications(0); });
  await h.settle(h.lists[0], page([item(1)]));
  await act(async () => h.streams[0].connect(true));
  assert.equal(h.lists[1].init?.cache, "no-store");
  assert.equal(h.lists[1].init?.signal, h.streams[0].signal);
});

test("initial list hydration retains SSE items that arrived while the request was pending in StrictMode", async (t) => {
  const h = await setup(t, { strict: true });
  await act(async () => { void h.values.actions.loadNotifications(0); });
  await h.receive(item(2));
  await h.settle(h.lists[0], page([item(1)]));
  assert.deepEqual(h.values.list.notifications.map(({ id }) => id), [2, 1]);
});

test("read-all updates the list/count, deduplicates double clicks, and queues a fresh authoritative count", async (t) => {
  const h = await setup(t);
  const renderer = await h.renderUi("NotificationBell");
  await act(async () => renderer.root.findByProps({ "aria-expanded": false }).props.onClick());
  await h.settle(h.lists[0], page([item(1), item(2)]));
  const readAll = renderer.root.findAllByType("button").find((button) => button.children.includes("모두 읽음"));
  await act(async () => { void readAll.props.onClick(); void readAll.props.onClick(); });
  assert.equal(h.writes.length, 1);
  await h.settle(h.writes[0]);
  assert.equal(h.values.unread, 0);
  assert.ok(h.values.list.notifications.every((entry) => entry.isRead));
  await h.settle(h.counts[0], { unreadCount: 20 });
  assert.equal(h.values.unread, 0, "an older count must not undo read-all");
  assert.equal(h.counts.length, 2);
  await h.settle(h.counts[1], { unreadCount: 0 });
});

test("a failed read keeps the notification unread and requests an explicit list refresh", async (t) => {
  const h = await setup(t);
  const renderer = await h.renderUi("NotificationBell");
  await act(async () => renderer.root.findByProps({ "aria-expanded": false }).props.onClick());
  await h.settle(h.lists[0], page([item(1)]));
  await act(async () => { void renderer.root.findAllByType("li")[0].findByType("button").props.onClick(); });
  await h.reject(h.writes[0]);
  assert.equal(h.values.list.notifications[0].isRead, false);
  assert.equal(h.lists.length, 2);
  assert.equal(h.lists[1].page, 0);
});

test("anonymous mounts do not subscribe or fetch and unmount ignores every old callback", async (t) => {
  const h = await setup(t, { authenticated: false });
  assert.equal(h.counts.length, 0);
  assert.equal(h.lists.length, 0);
  assert.equal(h.streams.length, 0);
  await h.changeSession({ userId: 1 });
  await act(async () => { void h.values.actions.loadNotifications(0); });
  const old = h.streams[0];
  await h.receive(item(1));
  await h.unmount();
  assert.equal(old.signal.aborted, true);
  assert.equal(h.intervals.size, 0);
  await act(async () => { old.receive(item(2)); old.connect(true); old.reservation(); });
  await h.settle(h.counts[0], { unreadCount: 99 });
  await h.settle(h.lists[0], page([item(3)]));
  assert.equal(h.counts.length, 1);
  assert.equal(h.lists.length, 1);
});

test("a read response from the previous account cannot change the next account's list/count", async (t) => {
  const h = await setup(t);
  const renderer = await h.renderUi("NotificationBell");
  await act(async () => renderer.root.findByProps({ "aria-expanded": false }).props.onClick());
  await h.settle(h.lists[0], page([item(1)]));
  await act(async () => {
    void renderer.root.findAllByType("li")[0].findByType("button").props.onClick();
  });
  assert.equal(h.writes.length, 1);
  await h.changeSession({ userId: 2 });
  await h.settle(h.counts[1], { unreadCount: 5 });
  await h.settle(h.lists.at(-1), page([item(1)]));
  await h.settle(h.writes[0], item(1, { isRead: true }));
  assert.equal(h.values.unread, 5);
  assert.equal(h.values.list.notifications[0].isRead, false);
});

test("subscribe tickets preserve cached reads and notification writes invalidate only notification URLs", async () => {
  const requests = [];
  const api = compile(join(slice, "api/notifications.ts"), {
    "@fsd/entities/user": {
      requestWithSession: async (path, init) => { requests.push({ path, init }); return {}; },
    },
    "@fsd/shared/lib": { getSafeInternalPath: (path) => path },
  });
  await api.issueNotificationSubscribeTicket();
  await api.markNotificationRead(7);
  await api.markAllNotificationsRead();
  assert.deepEqual(requests, [
    { path: "/api/notifications/subscribe-ticket", init: { method: "POST", invalidateCache: [] } },
    { path: "/api/notifications/7/read", init: { method: "PATCH", invalidateCache: ["/api/notifications"] } },
    { path: "/api/notifications/read-all", init: { method: "PATCH", invalidateCache: ["/api/notifications"] } },
  ]);
});

test("list API forwards freshness and cancellation options to transport", async () => {
  let request;
  const api = compile(join(slice, "api/notifications.ts"), {
    "@fsd/entities/user": { requestWithSession: async (path, init) => { request = { path, init }; return {}; } },
    "@fsd/shared/lib": { getSafeInternalPath: (path) => path },
  });
  const signal = new AbortController().signal;
  await api.getNotifications(1, 20, { cache: "no-store", signal });
  assert.deepEqual(request, {
    path: "/api/notifications?page=1&size=20", init: { cache: "no-store", signal },
  });
});

// The write promise represents the API boundary, including its 401/reissue/retry.
// The provider must retain write ownership while that boundary rotates tokens.
for (const kind of ["single", "all"]) {
  const beginRead = (renderer) => {
    if (kind === "single") {
      renderer.root.findAllByType("li")[0].findByType("button").props.onClick();
    } else {
      renderer.root.findAllByType("button")
        .find((button) => button.children.includes("모두 읽음")).props.onClick();
    }
  };

  const pendingRead = async (t) => {
    const h = await setup(t);
    const renderer = await h.renderUi("NotificationBell");
    await act(async () => renderer.root.findByProps({ "aria-expanded": false }).props.onClick());
    await h.settle(h.counts[0], { unreadCount: 1 });
    await h.settle(h.lists[0], page([item(1)]));
    await act(async () => beginRead(renderer));
    assert.equal(h.writes.length, 1);
    return h;
  };

  test(`${kind} read survives same-owner refresh when reconnect reads finish before the retried write`, async (t) => {
    const h = await pendingRead(t);
    await h.changeSession({ userId: 1, accessToken: "rotated-token" }, { isRefresh: true });
    assert.equal(h.streams[0].signal.aborted, true, "SSE still reconnects with new credentials");
    assert.equal(h.streams.length, 2);
    await h.settle(h.counts[1], { unreadCount: 1 });
    await h.settle(h.lists[1], page([item(1)]));
    await h.settle(h.writes[0], kind === "single" ? item(1, { isRead: true }) : undefined);
    assert.equal(h.values.list.notifications[0].isRead, true, "successful retry reconciles the active row");
    assert.equal(h.values.unread, 0);
    assert.equal(h.counts.length, 3, "completion refreshes the active connection's count");
    await h.settle(h.counts[2], { unreadCount: 0 });
    assert.equal(h.values.unread, 0);
  });

  test(`${kind} read queues a trailing refresh on the new connection while its count is pending`, async (t) => {
    const h = await pendingRead(t);
    await h.changeSession({ userId: 1, accessToken: "rotated-token" }, { isRefresh: true });
    await h.settle(h.lists[1], page([item(1)]));
    await h.settle(h.writes[0], kind === "single" ? item(1, { isRead: true }) : undefined);
    assert.equal(h.values.list.notifications[0].isRead, true);
    assert.equal(h.counts.length, 2, "must coalesce with the new connection's pending count");
    await h.settle(h.counts[1], { unreadCount: 1 });
    assert.equal(h.values.unread, 0, "the pre-write count cannot undo the completion");
    assert.equal(h.counts.length, 3, "a fresh trailing GET follows the obsolete count");
    await h.settle(h.counts[2], { unreadCount: 0 });
  });

  test(`${kind} read stays read when the reconnect list resolves its pre-write unread snapshot afterward`, async (t) => {
    const h = await pendingRead(t);
    await h.changeSession({ userId: 1, accessToken: "rotated-token" }, { isRefresh: true });
    const reconnectSnapshot = page([item(1), item(2)]);
    assert.equal(h.lists.length, 2, "the reconnect list is pending before the PATCH completes");
    await h.settle(h.writes[0], kind === "single" ? item(1, { isRead: true }) : undefined);
    await h.receive(item(3));
    await h.settle(h.lists[1], reconnectSnapshot);
    assert.deepEqual(h.values.list.notifications.map(({ id, isRead }) => ({ id, isRead })), [
      { id: 3, isRead: false },
      { id: 2, isRead: kind === "all" },
      { id: 1, isRead: true },
    ], "the late snapshot must retain successful reads and preserve new unread arrivals");
    assert.equal(h.values.list.notificationLoaded, true);
    assert.equal(h.values.list.notificationLoading, false);
    await h.settle(h.counts[1], { unreadCount: 2 });
    assert.equal(h.counts.length, 3, "the active count still drains its trailing refresh");
    const unreadCount = kind === "all" ? 1 : 2;
    await h.settle(h.counts[2], { unreadCount });
    assert.equal(h.values.unread, unreadCount);

    await h.changeSession({ userId: 2 });
    await h.settle(h.lists.at(-1), page([item(1), item(2)]));
    assert.ok(h.values.list.notifications.every((entry) => !entry.isRead), "read reconciliation cannot leak into another owner");
  });

  for (const cleanup of ["replace", "logout-login-same-user", "silent-replace", "unmount"]) {
    test(`${kind} read completion after same-owner refresh is suppressed by ${cleanup}`, async (t) => {
      const h = await pendingRead(t);
      await h.changeSession({ userId: 1, accessToken: "rotated-token" }, { isRefresh: true });
      await h.settle(h.counts[1], { unreadCount: 1 });
      await h.settle(h.lists[1], page([item(1)]));
      if (cleanup === "replace") {
        await h.changeSession({ userId: 2 });
      } else if (cleanup === "logout-login-same-user") {
        await h.changeSession(null);
        await h.changeSession({ userId: 1, accessToken: "new-login-token" });
      } else if (cleanup === "silent-replace") {
        await h.changeSession({ userId: 2 }, { emit: false });
      } else {
        await h.unmount();
      }
      if (cleanup === "replace" || cleanup === "logout-login-same-user") {
        await h.settle(h.counts.at(-1), { unreadCount: 5 });
        await h.settle(h.lists.at(-1), page([item(1)]));
      }
      const before = {
        unread: h.values.unread,
        notifications: h.values.list.notifications,
        renders: { ...h.renders },
        counts: h.counts.length,
        lists: h.lists.length,
      };
      await h.settle(h.writes[0], kind === "single" ? item(1, { isRead: true }) : undefined);
      assert.equal(h.values.unread, before.unread);
      assert.equal(h.values.list.notifications, before.notifications);
      assert.deepEqual(h.renders, before.renders);
      assert.equal(h.counts.length, before.counts);
      assert.equal(h.lists.length, before.lists);
    });
  }

  test(`${kind} read failure after same-owner refresh retries the active list`, async (t) => {
    const h = await pendingRead(t);
    await h.changeSession({ userId: 1, accessToken: "rotated-token" }, { isRefresh: true });
    await h.settle(h.counts[1], { unreadCount: 1 });
    await h.settle(h.lists[1], page([item(1)]));
    await h.reject(h.writes[0]);
    assert.equal(h.values.list.notifications[0].isRead, false);
    assert.equal(h.lists.length, 3, "failure retries using active connection ownership");
    assert.equal(h.lists[2].init.signal, h.streams[1].signal);
  });
}
