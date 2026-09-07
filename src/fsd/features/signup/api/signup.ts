import { request } from "@fsd/shared/api";
import { createSignupActions } from "./createSignupActions.ts";

const actions = createSignupActions({ request });

export const sendSignupVerificationCode = actions.sendVerificationCode;
export const signup = actions.signup;
