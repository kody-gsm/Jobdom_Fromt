// Legacy compatibility facade. Auth error policy lives in the FSD user entity.
export type { AuthErrorField, AuthFieldError } from "../../src/fsd/entities/user/index.ts";
export {
  getAuthErrorMessage,
  getPasswordResetError,
  getSignupError,
} from "../../src/fsd/entities/user/index.ts";
