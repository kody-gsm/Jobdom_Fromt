// Legacy compatibility facade. Session ownership lives in the FSD user entity.
export type { AuthSession } from "../../src/fsd/entities/user/index.ts";
export {
  backfillRememberLoginEmail,
  clearRememberedSession,
  clearRememberLoginPreference,
  clearStoredSession,
  isRememberedSession,
  persistSession,
  readAccessToken,
  readRememberedSession,
  readRememberLoginPreference,
  readSession,
} from "../../src/fsd/entities/user/index.ts";
