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
  reissueSession,
  clearSession,
  restoreRememberedSession,
  readRememberLoginPreference,
} from "@fsd/entities/user";
import { ApiError } from "@fsd/shared/api";
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
    let hasRedirected = false;
    const isCurrent = () => {
      const latest = getSession();
      return requestVersion === restoreRequestVersion.current
        && sessionVersion === getSessionVersion()
        && latest?.userId === initialSession?.userId;
    };
    const finishRestore = () => {
      if (!isCurrent()) return false;
      if (hasRedirected) return true;
      const current = getSession();
      if (!current || isAccessTokenExpired(current.accessToken)) return false;
      hasRedirected = true;
      router.replace(getRoleHomePath(current.role));
      return true;
    };
    const invalidateRestore = () => { restoreRequestVersion.current += 1; };
    const onSessionChanged = () => { finishRestore(); };
    window.addEventListener("jobdam-session", onSessionChanged);
    window.addEventListener("storage", onSessionChanged);
    const restore = async () => {
      await restoreRememberedSession();
      if (!isCurrent() || finishRestore()) return;
      const current = getSession();
      if (!current) return;
      try {
        await reissueSession(current.refreshToken, isCurrent);
        finishRestore();
      } catch (error) {
        if (finishRestore()) return;
        const latest = getSession();
        if (
          isCurrent()
          && latest?.accessToken === current.accessToken
          && latest?.refreshToken === current.refreshToken
          && error instanceof ApiError
          && (error.status === 401 || error.status === 403)
        ) {
          clearSession();
        }
      }
    };
    void restore();
    return () => {
      invalidateRestore();
      window.removeEventListener("jobdam-session", onSessionChanged);
      window.removeEventListener("storage", onSessionChanged);
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
