"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getGsmEmailErrorMessage,
  getPasswordResetCodeError,
  getPasswordResetError,
  normalizeVerificationCode,
} from "@fsd/entities/user";
import { useCountdown } from "@fsd/shared/lib";
import { resetPassword, sendPasswordResetCode } from "../api/resetPassword.ts";
import { validateResetPasswordForm } from "./validation.ts";
import type {
  ResetPasswordFormErrors,
  ResetPasswordFormValues,
} from "./validation.ts";

type ResetPasswordFields = Omit<ResetPasswordFormValues, "isCodeExpired">;

const INITIAL_VALUES: ResetPasswordFields = {
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
};

export const useResetPasswordForm = () => {
  const router = useRouter();
  const [form, setForm] = useState<ResetPasswordFields>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const verificationCountdown = useCountdown();
  const verificationRequestVersion = useRef(0);

  const updateField = (field: keyof ResetPasswordFields, value: string) => {
    const normalized =
      field === "verificationCode" ? normalizeVerificationCode(value) : value;
    if (field === "email" && form.email !== normalized) {
      verificationRequestVersion.current += 1;
      setIsCodeSent(false);
      verificationCountdown.reset();
      setErrors((current) => ({ ...current, verificationCode: undefined }));
    }
    setForm((current) => ({ ...current, [field]: normalized }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const sendCode = async () => {
    const emailError = getGsmEmailErrorMessage(form.email);
    if (emailError) {
      setErrors((current) => ({ ...current, email: emailError }));
      return;
    }

    const requestedEmail = form.email.trim();
    const requestVersion = ++verificationRequestVersion.current;
    try {
      setIsSendingCode(true);
      setSubmitError("");
      await sendPasswordResetCode(requestedEmail);
      if (requestVersion !== verificationRequestVersion.current || form.email.trim() !== requestedEmail) return;
      setIsCodeSent(true);
      verificationCountdown.start(180);
      setErrors((current) => ({ ...current, email: undefined, verificationCode: undefined }));
    } catch (caught) {
      if (requestVersion !== verificationRequestVersion.current) return;
      setIsCodeSent(false);
      verificationCountdown.reset();
      setErrors((current) => ({
        ...current,
        email: getPasswordResetCodeError(caught),
      }));
    } finally {
      if (requestVersion === verificationRequestVersion.current) setIsSendingCode(false);
    }
  };

  const submit = async () => {
    const codeExpired = isCodeSent && verificationCountdown.isExpired;
    const nextErrors = validateResetPasswordForm({ ...form, isCodeExpired: codeExpired });
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await resetPassword(
        form.email.trim(),
        form.verificationCode,
        form.password,
      );
      router.push("/login");
    } catch (caught) {
      const result = getPasswordResetError(caught);
      if (result.field === "form") setSubmitError(result.message);
      else setErrors((current) => ({ ...current, [result.field]: result.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const codeExpired = isCodeSent && verificationCountdown.isExpired;
  const canSubmit =
    Object.values(form).every((value) => value.trim() !== "") &&
    !isSubmitting &&
    !codeExpired;

  return {
    form,
    errors,
    submitError,
    isSendingCode,
    isSubmitting,
    isCodeSent,
    codeExpired,
    canSubmit,
    verificationSecondsLeft: verificationCountdown.secondsLeft,
    updateField,
    sendCode,
    submit,
  };
};
