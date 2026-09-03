import type { AuthSession } from "./types.ts";
import { decodeUserRole } from "./role.ts";
import {
  backfillRememberLoginEmail,
  clearStoredSession,
  persistSession,
  readRememberedSession,
  readSession,
} from "./session.ts";

const notifySessionChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jobdam-session"));
  }
};

export const saveSession = (
  response: Omit<AuthSession, "role">,
  rememberLogin = false,
) => {
  const session: AuthSession = {
    ...response,
    role: decodeUserRole(response.accessToken),
  };
  persistSession(session, rememberLogin);
  notifySessionChanged();
  return session;
};

export const getSession = (): AuthSession | null => readSession();

export const clearSession = () => {
  const session = getSession();
  if (session) backfillRememberLoginEmail(session.email);
  clearStoredSession();
  notifySessionChanged();
};

export const restoreRememberedSession = async () => {
  const remembered = readRememberedSession();
  if (!remembered?.refreshToken) return null;
  return remembered;
};
