"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthErrorMessage,
  getGsmEmailErrorMessage,
  getSignupError,
  normalizeVerificationCode,
} from "@fsd/entities/user";
import { useCountdown } from "@fsd/shared/lib";
import { sendSignupVerificationCode, signup } from "../api/signup.ts";
import { validateSignupForm } from "./validation.ts";
import type { SignupFormErrors, SignupFormValues } from "./validation.ts";

const INITIAL_VALUES: SignupFormValues = {
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
};

export const useSignupForm = () => {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const verificationCountdown = useCountdown();  const resendCountdown = useCountdown();

  const updateField = (field: keyof SignupFormValues, value: string) => {
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
      await sendSignupVerificationCode(form.email.trim());
      setIsCodeSent(true);
      verificationCountdown.start(180);
      resendCountdown.start(2);
      setErrors((current) => ({ ...current, email: undefined, verificationCode: undefined }));
    } catch (caught) {
      setIsCodeSent(false);
      verificationCountdown.reset();
      resendCountdown.reset();      setErrors((current) => ({
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
    const nextErrors = validateSignupForm(form);
    if (isCodeSent && verificationCountdown.isExpired) {
      nextErrors.verificationCode = "인증코드가 만료되었습니다. 재발송해주세요.";
    }
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await signup({
        email: form.email.trim(),
        password: form.password,
        verificationCode: form.verificationCode,
      });
      router.push("/login");
    } catch (caught) {
      const result = getSignupError(caught);      if (result.field === "form") setSubmitError(result.message);
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
    canSendCode: !isSendingCode && resendCountdown.isExpired,
    canSubmit,
    verificationSecondsLeft: verificationCountdown.secondsLeft,
    updateField,
    sendCode,
    submit,
  };
};