import { request } from "@fsd/shared/api";
import { createResetPasswordActions } from "./createResetPasswordActions.ts";

const actions = createResetPasswordActions({ request });

export const sendPasswordResetCode = actions.sendVerificationCode;
export const resetPassword = actions.resetPassword;
