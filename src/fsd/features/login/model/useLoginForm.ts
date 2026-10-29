"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearRememberLoginPreference,
  getLoginErrorMessage as getAuthErrorMessage,
  getRoleHomePath,
  getSession,
  getSessionVersion,
  isAccessTokenExpired,
  saveSession,
  clearSession,
  restoreRememberedSession,
  readRememberLoginPreference,
} from "@fsd/entities/user";
import { ApiError, request } from "@fsd/shared/api";
import { login } from "../api/login.ts";
import { getFirstLoginErrorField, validateLoginForm } from "./validation.ts";
import type { LoginFormErrors, LoginFormValues } from "./validation.ts";

type LoginState = LoginFormValues & { rememberLogin: boolean };
type LoginCredentials = Pick<LoginFormValues, "email" | "password">;

export const useLoginForm = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginState>(() => {
    const preference = readRememberLoginPreference();
    return { email: preference.email, password: "", rememberLogin: preference.enabled };
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [errorField, setErrorField] = useState<keyof LoginFormValues | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const restoreRequestVersion = useRef(0);

  useEffect(() => {
    const requestVersion = ++restoreRequestVersion.current;
    const sessionVersion = getSessionVersion();
    const initialSession = getSession();
    const isCurrent = () => {
      const latest = getSession();
      return requestVersion === restoreRequestVersion.current
        && sessionVersion === getSessionVersion()
        && latest?.accessToken === initialSession?.accessToken
        && latest?.refreshToken === initialSession?.refreshToken
        && latest?.userId === initialSession?.userId;
    };
    const invalidateRestore = () => { restoreRequestVersion.current += 1; };
    window.addEventListener("jobdam-session", invalidateRestore);
    window.addEventListener("storage", invalidateRestore);
    const restore = async () => {
      const remembered = await restoreRememberedSession();
      if (!isCurrent()) return;
      if (remembered) {
        router.replace(getRoleHomePath(remembered.role));
        return;
      }
      const current = getSession();
      if (!current) return;
      if (!isAccessTokenExpired(current.accessToken)) {
        router.replace(getRoleHomePath(current.role));
        return;
      }
      try {
        const response = await request<Omit<typeof current, "role">>("/auth/reissue", {
          method: "POST",
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        if (!isCurrent()) return;
        const preference = readRememberLoginPreference();
        const session = saveSession(response, preference.enabled, { isRefresh: true });
        router.replace(getRoleHomePath(session.role));
      } catch (error) {
        if (isCurrent() && error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
        }
      }
    };
    void restore();
    return () => {
      invalidateRestore();
      window.removeEventListener("jobdam-session", invalidateRestore);
      window.removeEventListener("storage", invalidateRestore);
    };
  }, [router]);

  const setEmail = (email: string) => {
    setForm((current) => ({ ...current, email }));
    setErrors((current) => ({ ...current, email: undefined }));
    setErrorField(null);
    setSubmitError("");
  };

  const setPassword = (password: string) => {
    setForm((current) => ({ ...current, password }));
    setErrors((current) => ({ ...current, password: undefined }));
    setErrorField(null);
    setSubmitError("");
  };

  const setRememberLogin = (rememberLogin: boolean) => {
    setForm((current) => ({ ...current, rememberLogin }));
    if (!rememberLogin) clearRememberLoginPreference();
  };

  const submit = async (credentials?: LoginCredentials) => {
    const effectiveForm: LoginState = credentials ? { ...form, ...credentials } : form;
    if (credentials) {
      setForm((current) => ({ ...current, ...credentials }));
    }

    const nextErrors = validateLoginForm(effectiveForm);
    setErrors(nextErrors);
    setErrorField(getFirstLoginErrorField(nextErrors));
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    restoreRequestVersion.current += 1;
    try {
      setIsSubmitting(true);
      const session = await login(
        effectiveForm.email.trim(),
        effectiveForm.password,
        form.rememberLogin,
      );
      router.push(getRoleHomePath(session.role));
    } catch (caught) {
      setSubmitError(
        getAuthErrorMessage(caught, "이메일 또는 비밀번호가 올바르지 않습니다."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    errors,
    errorField,
    submitError,
    isSubmitting,
    setEmail,
    setPassword,
    setRememberLogin,
    submit,
  };
};
