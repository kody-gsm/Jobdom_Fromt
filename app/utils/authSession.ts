import type { AuthSession } from "./api";

const TOKEN_KEY = "jobdam_access_token";
const SESSION_KEY = "jobdam_session";
const REMEMBER_KEY = "jobdam_remember_login";
const REMEMBER_EMAIL_KEY = "jobdam_remembered_email";

const readJson = (storage: Storage): AuthSession | null => {
  try {
    return JSON.parse(storage.getItem(SESSION_KEY) || "null") as AuthSession | null;
  } catch {
    return null;
  }
};

const clearStorage = (storage: Storage) => {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(SESSION_KEY);
};

const hasRememberFlag = () => localStorage.getItem(REMEMBER_KEY) === "true";

export const clearRememberLoginPreference = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(REMEMBER_EMAIL_KEY);
};

export const readRememberLoginPreference = () => {
  if (typeof window === "undefined" || !hasRememberFlag()) {
    return { enabled: false, email: "" };
  }
  return {
    enabled: true,
    email: localStorage.getItem(REMEMBER_EMAIL_KEY) || "",
  };
};

export const persistSession = (session: AuthSession, rememberLogin: boolean) => {
  const target = rememberLogin ? localStorage : sessionStorage;
  const other = rememberLogin ? sessionStorage : localStorage;
  clearStorage(other);
  target.setItem(TOKEN_KEY, session.accessToken);
  target.setItem(SESSION_KEY, JSON.stringify(session));
  if (rememberLogin) {
    localStorage.setItem(REMEMBER_KEY, "true");
    localStorage.setItem(REMEMBER_EMAIL_KEY, session.email);
  } else {
    clearRememberLoginPreference();
  }
};

export const readSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  const sessionOnly = readJson(sessionStorage);
  if (sessionOnly) return sessionOnly;
  return hasRememberFlag() ? readJson(localStorage) : null;
};

export const readRememberedSession = (): AuthSession | null => {
  if (typeof window === "undefined" || !hasRememberFlag()) return null;
  return readJson(localStorage);
};

export const readAccessToken = () => {
  if (typeof window === "undefined") return null;
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;
  return hasRememberFlag() ? localStorage.getItem(TOKEN_KEY) : null;
};

export const isRememberedSession = () => {
  if (typeof window === "undefined") return false;
  return readJson(sessionStorage) === null && hasRememberFlag() && readJson(localStorage) !== null;
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") return;
  clearStorage(sessionStorage);
  clearStorage(localStorage);
};

export const clearRememberedSession = () => {
  if (typeof window === "undefined") return;
  clearStorage(localStorage);
};
