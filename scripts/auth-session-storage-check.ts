import assert from "node:assert/strict";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
Object.defineProperty(globalThis, "window", { value: globalThis });
Object.defineProperty(globalThis, "localStorage", { value: local });
Object.defineProperty(globalThis, "sessionStorage", { value: session });

const authSession = await import("../app/utils/authSession.ts");
const auth = {
  accessToken: "access",
  refreshToken: "refresh",
  tokenType: "Bearer",
  userId: 1,
  email: "s1@gsm.hs.kr",
  name: "학생",
  role: "STUDENT" as const,
};

authSession.persistSession(auth, false);
assert.equal(authSession.readSession()?.accessToken, "access");
assert.equal(authSession.readRememberedSession(), null);
assert.equal(session.getItem("jobdam_access_token"), "access");
assert.equal(local.getItem("jobdam_access_token"), null);

authSession.persistSession(auth, true);
assert.equal(authSession.readRememberedSession()?.refreshToken, "refresh");
assert.equal(authSession.isRememberedSession(), true);
assert.equal(local.getItem("jobdam_remember_login"), "true");
assert.equal(session.getItem("jobdam_access_token"), null);
assert.deepEqual(authSession.readRememberLoginPreference(), {
  enabled: true,
  email: "s1@gsm.hs.kr",
});

authSession.clearStoredSession();
assert.equal(authSession.readSession(), null);
assert.equal(local.getItem("jobdam_remember_login"), "true");
assert.equal(local.getItem("jobdam_remembered_email"), "s1@gsm.hs.kr");
assert.deepEqual(authSession.readRememberLoginPreference(), {
  enabled: true,
  email: "s1@gsm.hs.kr",
});

authSession.clearRememberLoginPreference();
assert.deepEqual(authSession.readRememberLoginPreference(), {
  enabled: false,
  email: "",
});

console.log("auth session storage behavior passed");
