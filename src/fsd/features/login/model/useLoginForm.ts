"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearRememberLoginPreference,
  getAuthErrorMessage,
  getRoleHomePath,
  readRememberLoginPreference,
  restoreRememberedSession,
} from "@fsd/entities/user";
import { login } from "../api/login.ts";
import { validateLoginForm } from "./validation.ts";
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
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    void restoreRememberedSession().then((session) => {
      if (isActive && session) router.replace(getRoleHomePath(session.role));
    });
    return () => {
      isActive = false;
    };
  }, [router]);

  const setEmail = (email: string) => {
    setForm((current) => ({ ...current, email }));
    setErrors((current) => ({ ...current, email: undefined }));
    setSubmitError("");
  };

  const setPassword = (password: string) => {
    setForm((current) => ({ ...current, password }));
    setErrors((current) => ({ ...current, password: undefined }));
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
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

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
    submitError,
    isSubmitting,
    setEmail,
    setPassword,
    setRememberLogin,
    submit,
  };
};
