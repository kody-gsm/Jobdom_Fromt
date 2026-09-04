import assert from "node:assert/strict";

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
Object.defineProperty(globalThis, "window", { value: globalThis });
Object.defineProperty(globalThis, "localStorage", { value: local });
Object.defineProperty(globalThis, "sessionStorage", { value: session });
Object.defineProperty(globalThis, "dispatchEvent", { value: () => true });

const user = await import("../../src/fsd/entities/user/index.ts");
const auth: user.AuthSession = {
  accessToken: "access",
  refreshToken: "refresh",
  tokenType: "Bearer",
  userId: 1,
  email: "s1@gsm.hs.kr",
  name: "학생",
  role: "STUDENT",
};

user.persistSession(auth, false);
assert.equal(user.readSession()?.accessToken, "access");
assert.equal(session.getItem("jobdam_access_token"), "access");

user.persistSession(auth, true);
assert.equal(user.readRememberedSession()?.refreshToken, "refresh");
assert.equal(user.isRememberedSession(), true);
assert.deepEqual(user.readRememberLoginPreference(), {
  enabled: true,
  email: "s1@gsm.hs.kr",
});

user.clearStoredSession();
assert.equal(user.readSession(), null);
assert.deepEqual(user.readRememberLoginPreference(), {
  enabled: true,
  email: "s1@gsm.hs.kr",
});

user.clearRememberLoginPreference();
assert.deepEqual(user.readRememberLoginPreference(), {
  enabled: false,
  email: "",
});

const adminToken = `x.${btoa(JSON.stringify({ role: "ADMIN" }))}.x`;
const saved = user.saveSession({
  accessToken: adminToken,
  refreshToken: "refresh-admin",
  tokenType: "Bearer",
  userId: 2,
  email: "admin@gsm.hs.kr",
  name: "관리자",
}, false);
assert.equal(saved.role, "ADMIN");
assert.equal(user.getRoleHomePath(saved.role), "/admin");
assert.equal(user.getRoleHomePath("TEACHER"), "/teacher");
assert.equal(user.getRoleHomePath("STUDENT"), "/");
user.clearSession();
assert.equal(user.getSession(), null);
