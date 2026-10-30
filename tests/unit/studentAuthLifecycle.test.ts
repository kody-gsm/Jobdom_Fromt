import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import * as React from "react";
import * as sessionStorageModel from "../../src/fsd/entities/user/model/session.ts";
import * as lifecycle from "../../src/fsd/entities/user/model/lifecycle.ts";
import * as role from "../../src/fsd/entities/user/model/role.ts";
import * as authErrors from "../../src/fsd/entities/user/model/auth-errors.ts";
import * as credentials from "../../src/fsd/entities/user/model/credentials.ts";
import * as avatar from "../../src/fsd/entities/user/model/profileAvatar.ts";
import * as loginValidation from "../../src/fsd/features/login/model/validation.ts";
import * as signupValidation from "../../src/fsd/features/signup/model/validation.ts";
import * as resetValidation from "../../src/fsd/features/reset-password/model/validation.ts";
import * as countdown from "../../src/fsd/shared/lib/countdown.ts";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";
import type { ApiRequestInit } from "../../src/fsd/shared/api/client.ts";
import { createActivityTrackingRequest } from "../../src/fsd/entities/user/api/createActivityTrackingRequest.ts";
import { createLoginAction } from "../../src/fsd/features/login/api/createLoginAction.ts";
import type { AuthSession } from "../../src/fsd/entities/user/model/types.ts";
import { createAuthHookRuntime, deferred, installAuthBrowser, loadAuthModule, settleAuthTasks } from "./studentAuthTestHarness.ts";

const user = { ...sessionStorageModel, ...lifecycle, ...role, ...authErrors, ...credentials, ...avatar };
const createSessionRequests = (request: Parameters<typeof createAuthenticatedRequest>[0]["request"]) =>
  loadAuthModule<typeof import("../../src/fsd/entities/user/api/sessionRequest.ts")>("src/fsd/entities/user/api/sessionRequest.ts", {
    "@fsd/shared/api": { ApiError, request, createAuthenticatedRequest },
    "../model/session.ts": sessionStorageModel,
    "../model/lifecycle.ts": lifecycle,
    "./createActivityTrackingRequest.ts": { createActivityTrackingRequest },
    "./recordActivity.ts": { ACTIVITY_API_ENABLED: false, recordActivity() {} },
  });
const auth = (userId = 1, expired = true): AuthSession => ({
  accessToken: `x.${btoa(JSON.stringify({ role: "STUDENT", exp: (Date.now() / 1000) + (expired ? -10 : 3600), userId }))}.x`,
  refreshToken: `refresh-${userId}`, tokenType: "Bearer", userId,
  email: `s${userId}@gsm.hs.kr`, name: `Student ${userId}`, role: "STUDENT",
});

const loadCountdown = (runtime: ReturnType<typeof createAuthHookRuntime>) =>
  loadAuthModule<typeof import("../../src/fsd/shared/lib/useCountdown.ts")>("src/fsd/shared/lib/useCountdown.ts", {
    react: runtime.react, "./countdown.ts": countdown,
  });

for (const resume of ["tick", "focus", "visibilitychange"] as const) {
  test(`countdown expires from elapsed wall time on ${resume}, even after suspended callbacks`, () => {
    const browser = installAuthBrowser();
    try {
      const runtime = createAuthHookRuntime();
      const { useCountdown } = loadCountdown(runtime);
      const view = runtime.mount(() => useCountdown());
      view.current.start(180);
      view.flush();
      browser.advance(181_000);
      if (resume === "tick") browser.tick();
      else if (resume === "focus") browser.window.dispatchEvent(new Event("focus"));
      else browser.document.dispatchEvent(new Event("visibilitychange"));
      view.flush();
      assert.equal(view.current.secondsLeft, 0);
      assert.equal(view.current.isExpired, true);
      view.unmount();
      assert.equal(browser.timers.size, 0);
    } finally { browser.restore(); }
  });
}

for (const kind of ["signup", "reset"] as const) {
  test(`${kind} rejects a code at its deadline before any delayed timer or resume callback`, async () => {
    const browser = installAuthBrowser();
    try {
      const runtime = createAuthHookRuntime();
      let submissions = 0;
      const submitRequest = async () => { submissions += 1; };
      const imports = {
        react: runtime.react,
        "next/navigation": { useRouter: () => ({ push() {} }) },
        "@fsd/entities/user": user,
        "@fsd/shared/lib": loadCountdown(runtime),
        "./validation.ts": kind === "signup" ? signupValidation : resetValidation,
        "../api/signup.ts": { sendSignupVerificationCode: async () => {}, signup: submitRequest },
        "../api/resetPassword.ts": { sendPasswordResetCode: async () => {}, resetPassword: submitRequest },
      };
      const signupModule = kind === "signup" ? loadAuthModule<typeof import("../../src/fsd/features/signup/model/useSignupForm.ts")>("src/fsd/features/signup/model/useSignupForm.ts", imports) : null;
      const resetModule = kind === "reset" ? loadAuthModule<typeof import("../../src/fsd/features/reset-password/model/useResetPasswordForm.ts")>("src/fsd/features/reset-password/model/useResetPasswordForm.ts", imports) : null;
      const view = runtime.mount(() => signupModule ? signupModule.useSignupForm() : resetModule!.useResetPasswordForm());
      for (const [field, value] of [["email", "s25001@gsm.hs.kr"], ["verificationCode", "123456"], ["password", "Aa12345678!"], ["confirmPassword", "Aa12345678!"]] as const) {
        view.current.updateField(field, value);
        view.flush();
      }
      if ("updateConsent" in view.current) {
        view.current.updateConsent("termsAccepted", true);
        view.current.updateConsent("privacyAccepted", true);
        view.flush();
      }
      await view.current.sendCode();
      view.flush();
      assert.equal(view.current.verificationSecondsLeft, 180);
      browser.advance(180_000);
      await view.current.submit();
      view.flush();
      assert.equal(submissions, 0, "expired verification must never reach the auth endpoint");
      assert.ok(view.current.errors.verificationCode);
      assert.equal(view.current.verificationSecondsLeft, 0);
      view.unmount();
    } finally { browser.restore(); }
  });
}

for (const outcome of ["success", "401", "403"] as const) {
  for (const supersede of ["manual login", "logout", "unmount", "same-token replacement", "silent same-token persistence"] as const) {
    test(`obsolete restore ${outcome} cannot mutate storage or navigate after ${supersede}`, async () => {
      const browser = installAuthBrowser();
      try {
        const old = auth();
        lifecycle.saveSession(old, true);
        const restore = deferred<AuthSession>();
        const manual = deferred<AuthSession>();
        const navigations: string[] = [];
        const router = { push(path: string) { navigations.push(path); }, replace(path: string) { navigations.push(path); } };
        const runtime = createAuthHookRuntime();
        const login = createLoginAction({ request: async <T>() => await manual.promise as T, saveSession: lifecycle.saveSession });
        const { useLoginForm } = loadAuthModule<typeof import("../../src/fsd/features/login/model/useLoginForm.ts")>("src/fsd/features/login/model/useLoginForm.ts", {
          react: runtime.react, "next/navigation": { useRouter: () => router },
          "@fsd/entities/user": { ...user, ...createSessionRequests(async <T>() => await restore.promise as T) },
          "@fsd/shared/api": { ApiError, request: async () => restore.promise },
          "../api/login.ts": { login }, "./validation.ts": loginValidation,
        });
        const view = runtime.mount(useLoginForm);
        await settleAuthTasks();
        let expected: AuthSession | null = old;
        if (supersede === "manual login") {
          const pending = view.current.submit({ email: "s2@gsm.hs.kr", password: "Password!1" });
          manual.resolve(auth(2, false));
          await pending;
          expected = lifecycle.getSession();
          navigations.length = 0;
        } else if (supersede === "logout") {
          lifecycle.clearSession();
          expected = null;
        } else if (supersede === "unmount") view.unmount();
        else if (supersede === "silent same-token persistence") sessionStorageModel.persistSession(old, true);
        else lifecycle.saveSession(old, true);
        if (outcome === "success") restore.resolve({ ...auth(1, false), refreshToken: "rotated-old-refresh" });
        else restore.reject(new ApiError("expired", Number(outcome)));
        await settleAuthTasks();
        assert.deepEqual(lifecycle.getSession(), expected);
        assert.deepEqual(navigations, []);
        if (supersede !== "unmount") view.unmount();
      } finally { browser.restore(); }
    });
  }
}

test("manual submit invalidates restore before the manual login response arrives", async () => {
  const browser = installAuthBrowser();
  try {
    const old = auth();
    lifecycle.saveSession(old, true);
    const restore = deferred<AuthSession>();
    const manual = deferred<AuthSession>();
    const runtime = createAuthHookRuntime();
    const router = { push() {}, replace() { assert.fail("restore must not navigate during manual login"); } };
    const { useLoginForm } = loadAuthModule<typeof import("../../src/fsd/features/login/model/useLoginForm.ts")>("src/fsd/features/login/model/useLoginForm.ts", {
      react: runtime.react, "next/navigation": { useRouter: () => router },
      "@fsd/entities/user": { ...user, ...createSessionRequests(async <T>() => await restore.promise as T) },
      "@fsd/shared/api": { ApiError, request: async () => restore.promise },
      "../api/login.ts": { login: createLoginAction({ request: async <T>() => await manual.promise as T, saveSession: lifecycle.saveSession }) },
      "./validation.ts": loginValidation,
    });
    const view = runtime.mount(useLoginForm);
    await settleAuthTasks();
    const pending = view.current.submit({ email: "s2@gsm.hs.kr", password: "Password!1" });
    restore.resolve(auth(1, false));
    await settleAuthTasks();
    assert.deepEqual(lifecycle.getSession(), old);
    manual.resolve(auth(2, false));
    await pending;
    assert.equal(lifecycle.getSession()?.userId, 2);
    view.unmount();
  } finally { browser.restore(); }
});

test("avatar selection synchronously locks writes until the first server save settles", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(1, false), true);
    const uploads: Array<{ file: File; result: ReturnType<typeof deferred<string>> }> = [];
    let serverImage = "before";
    let displayedImage = "before";
    const runtime = createAuthHookRuntime();
    const { useChangeProfileAvatar } = loadAuthModule<typeof import("../../src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts")>("src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts", {
      react: runtime.react, "@fsd/entities/user": user,
      "../api/uploadProfileAvatar.ts": { uploadProfileAvatar: (file: File) => {
        const result = deferred<string>();
        uploads.push({ file, result });
        return result.promise.then((url) => { serverImage = url; return url; });
      } },
    });
    const view = runtime.mount(() => useChangeProfileAvatar((url) => { displayedImage = url; }));
    const first = new File(["a"], "a.png", { type: "image/png" });
    const second = new File(["b"], "b.png", { type: "image/png" });
    view.current.handleAvatarChange(first);
    view.current.handleAvatarChange(second);
    view.flush();
    assert.equal(uploads.length, 1, "the server must never receive overlapping writes");
    assert.ok(view.current.avatarError, "a locked selection must explain why it was ignored");
    uploads[0].result.resolve("https://images.test/a.png");
    await settleAuthTasks();
    view.flush();
    assert.equal(displayedImage, serverImage);
    assert.equal(avatar.readProfileAvatar("1"), serverImage);
    assert.equal(view.current.avatarError, "");
    view.current.handleAvatarChange(second);
    assert.equal(uploads.length, 2, "selection unlocks after settlement");
    uploads[1].result.resolve("https://images.test/b.png");
    await settleAuthTasks();
    assert.equal(displayedImage, serverImage);
    view.unmount();
  } finally { browser.restore(); }
});

test("avatar completion after unmount does not update UI or persistent avatar", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(1, false), true);
    const upload = deferred<string>();
    const runtime = createAuthHookRuntime();
    let changes = 0;
    const { useChangeProfileAvatar } = loadAuthModule<typeof import("../../src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts")>("src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts", {
      react: runtime.react, "@fsd/entities/user": user,
      "../api/uploadProfileAvatar.ts": { uploadProfileAvatar: () => upload.promise },
    });
    const view = runtime.mount(() => useChangeProfileAvatar(() => { changes += 1; }));
    view.current.handleAvatarChange(new File(["a"], "a.png", { type: "image/png" }));
    view.unmount();
    upload.resolve("https://images.test/late.png");
    await settleAuthTasks();
    assert.equal(changes, 0);
    assert.equal(avatar.readProfileAvatar("1"), null);
  } finally { browser.restore(); }
});

test("ordinary token refresh during avatar upload retains the successful image", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(1, false), true);
    const upload = deferred<string>();
    const runtime = createAuthHookRuntime();
    let displayedImage = "before";
    const { useChangeProfileAvatar } = loadAuthModule<typeof import("../../src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts")>("src/fsd/features/change-profile-avatar/model/useChangeProfileAvatar.ts", {
      react: runtime.react, "@fsd/entities/user": user,
      "../api/uploadProfileAvatar.ts": { uploadProfileAvatar: () => upload.promise },
    });
    const view = runtime.mount(() => useChangeProfileAvatar((url) => { displayedImage = url; }));
    view.current.handleAvatarChange(new File(["a"], "a.png", { type: "image/png" }));
    lifecycle.saveSession({ ...auth(1, false), refreshToken: "rotated-refresh" }, true, { isRefresh: true });
    upload.resolve("https://images.test/after-refresh.png");
    await settleAuthTasks();
    assert.equal(displayedImage, "https://images.test/after-refresh.png");
    assert.equal(avatar.readProfileAvatar("1"), displayedImage);
    view.unmount();
  } finally { browser.restore(); }
});

const renderer = createRequire(import.meta.url)("react-test-renderer") as {
  create: (element: React.ReactElement) => { unmount: () => void };
};

for (const lateOutcome of ["success", "401", "503"] as const) {
  test(`renderer: background reissue redirects login once and ignores competing restore ${lateOutcome}`, async () => {
    const browser = installAuthBrowser();
    const previousActEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true });
    let root: ReturnType<typeof renderer.create> | undefined;
    try {
      const old = auth();
      lifecycle.saveSession(old, true);
      const version = sessionStorageModel.getSessionVersion();
      const backgroundResponse = deferred<AuthSession>();
      const competingRestore = deferred<AuthSession>();
      // With shared reissue there is no competing raw request to consume this fixture.
      void competingRestore.promise.catch(() => undefined);
      let reissues = 0;
      const rawRequest: Parameters<typeof createAuthenticatedRequest>[0]["request"] = async <T>(path: string, _init?: ApiRequestInit, options?: { accessToken?: string | null }): Promise<T> => {
        if (path === "/auth/reissue") {
          reissues += 1;
          return await (reissues === 1 ? backgroundResponse.promise : competingRestore.promise) as T;
        }
        assert.equal(path, "/notifications/unread-count");
        if (options?.accessToken === old.accessToken) throw new ApiError("expired", 401);
        return { count: 1 } as T;
      };
      const sessionRequests = createSessionRequests(rawRequest);
      const background = sessionRequests.requestWithSession("/notifications/unread-count", { cache: "no-store" });
      await settleAuthTasks();
      assert.equal(reissues, 1);
      const navigations: string[] = [];
      const router = { push(path: string) { navigations.push(path); }, replace(path: string) { navigations.push(path); } };
      const { useLoginForm } = loadAuthModule<typeof import("../../src/fsd/features/login/model/useLoginForm.ts")>("src/fsd/features/login/model/useLoginForm.ts", {
        react: React, "next/navigation": { useRouter: () => router },
        "@fsd/entities/user": { ...user, ...sessionRequests }, "@fsd/shared/api": { ApiError, request: rawRequest },
        "../api/login.ts": { login: async () => { assert.fail("automatic restoration must not submit credentials"); } },
        "./validation.ts": loginValidation,
      });
      function Host() { useLoginForm(); return null; }
      await React.act(async () => { root = renderer.create(React.createElement(Host)); });
      const fresh: AuthSession = {
        ...auth(1, false),
        accessToken: `x.${btoa(JSON.stringify({ role: "WEE_TEACHER", exp: Date.now() / 1000 + 3600 }))}.x`,
        refreshToken: "background-fresh-refresh", role: "WEE_TEACHER",
      };
      await React.act(async () => {
        backgroundResponse.resolve(fresh);
        await background;
        await settleAuthTasks();
      });
      await React.act(async () => {
        if (lateOutcome === "success") competingRestore.resolve({ ...auth(1, false), refreshToken: "obsolete-restore-refresh" });
        else competingRestore.reject(new ApiError("obsolete restore", Number(lateOutcome)));
        await settleAuthTasks();
      });
      assert.deepEqual(navigations, ["/teacher"]);
      assert.equal(lifecycle.getSession()?.accessToken, fresh.accessToken);
      assert.equal(lifecycle.getSession()?.refreshToken, fresh.refreshToken);
      assert.equal(sessionStorageModel.getSessionVersion(), version);
      assert.equal(reissues, 1, "login must join the background refresh rather than send a competing POST");
    } finally {
      if (root) await React.act(async () => { root?.unmount(); });
      if (previousActEnvironment) Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", previousActEnvironment);
      else Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
      browser.restore();
    }
  });
}
