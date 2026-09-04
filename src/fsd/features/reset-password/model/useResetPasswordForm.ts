"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthErrorMessage,
  getGsmEmailErrorMessage,
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
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});  const [submitError, setSubmitError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const verificationCountdown = useCountdown();

  const updateField = (field: keyof ResetPasswordFields, value: string) => {
    const normalized =
      field === "verificationCode" ? normalizeVerificationCode(value) : value;
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

    try {
      setIsSendingCode(true);
      setSubmitError("");
      await sendPasswordResetCode(form.email.trim());
      setIsCodeSent(true);
      verificationCountdown.start(180);
      setErrors((current) => ({ ...current, email: undefined, verificationCode: undefined }));
    } catch (caught) {
      setIsCodeSent(false);
      verificationCountdown.reset();
      setErrors((current) => ({
        ...current,
        email: getAuthErrorMessage(
          caught,
          "인증코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.",
        ),
      }));
    } finally {
      setIsSendingCode(false);
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