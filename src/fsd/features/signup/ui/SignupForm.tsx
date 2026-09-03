"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import {
  getAuthErrorMessage,
  getGsmEmailErrorMessage,
  getSignupError,
  isValidPassword,
} from "@fsd/entities/user";
import { Button, Input } from "@fsd/shared/ui";
import { sendSignupVerificationCode, signup } from "../api/signup.ts";

type FormState = {
  email: string;
  verificationCode: string;
  password: string;
  confirm: string;
};

type ErrorState = Record<keyof FormState, string>;
const EMPTY_ERRORS: ErrorState = {
  email: "",
  verificationCode: "",
  password: "",
  confirm: "",
};

export const SignupForm = () => {
  const [form, setForm] = useState<FormState>({
    email: "",
    verificationCode: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<ErrorState>(EMPTY_ERRORS);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  const updateField = (name: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(
      () => setResendCooldown((current) => current - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = async () => {
    const emailError = getGsmEmailErrorMessage(form.email);
    if (emailError) {
      setErrors((current) => ({ ...current, email: emailError }));
      return;
    }

    try {
      setSendingCode(true);
      setSubmitError("");
      await sendSignupVerificationCode(form.email.trim());
      setIsCodeSent(true);
      setTimeLeft(180);
      setResendCooldown(2);
      setErrors((current) => ({ ...current, email: "", verificationCode: "" }));
    } catch (caught) {
      setIsCodeSent(false);
      setTimeLeft(0);
      setResendCooldown(0);
      setErrors((current) => ({
        ...current,
        email: getAuthErrorMessage(
          caught,
          "인증코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.",
        ),
      }));
    } finally {
      setSendingCode(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(EMPTY_ERRORS);
    setSubmitError("");

    const emailError = getGsmEmailErrorMessage(form.email);
    if (emailError) {
      setErrors((current) => ({ ...current, email: emailError }));
      return;
    }
    if (form.verificationCode.length !== 6) {
      setErrors((current) => ({
        ...current,
        verificationCode: "인증코드 6자리를 입력해주세요.",
      }));
      return;
    }
    if (!isValidPassword(form.password)) {
      setErrors((current) => ({
        ...current,
        password: "영문, 숫자, 특수문자를 포함해 10자 이상 입력해주세요.",
      }));
      return;
    }
    if (form.password !== form.confirm) {
      setErrors((current) => ({ ...current, confirm: "비밀번호가 일치하지 않습니다." }));
      return;
    }

    try {
      setSubmitting(true);
      await signup({
        email: form.email.trim(),
        password: form.password,
        verificationCode: form.verificationCode,
      });
      router.push("/login");
    } catch (caught) {
      const result = getSignupError(caught);
      if (result.field === "form") setSubmitError(result.message);
      else setErrors((current) => ({ ...current, [result.field]: result.message }));
    } finally {
      setSubmitting(false);
    }
  };

  const codeExpired = isCodeSent && timeLeft <= 0;
  const verificationCodeError = codeExpired
    ? "인증코드가 만료되었습니다. 재발송해주세요."
    : errors.verificationCode;
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const valid = Object.values(form).every(Boolean) && !submitting && !codeExpired;

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <AuthField
        label="이메일"
        value={form.email}
        error={errors.email}
        onChange={(value) => updateField("email", value)}
        type="email"
        autoComplete="email"
        placeholder="s123@gsm.hs.kr"
      />
      <button
        type="button"
        disabled={sendingCode || resendCooldown > 0}
        onClick={sendCode}
        className="-mt-2 block w-full text-right text-sm font-semibold text-[#02a946] disabled:text-[#9aa19c]"
      >
        {sendingCode
          ? "발송 중…"
          : resendCooldown > 0
            ? "인증코드 발송 완료"
            : isCodeSent
              ? "인증코드 재발송"
              : "인증코드 발송"}
      </button>

      <AuthField
        label="인증코드"
        value={form.verificationCode}
        error={verificationCodeError}
        onChange={(value) => updateField("verificationCode", value.replace(/\D/g, ""))}
        inputMode="numeric"
        maxLength={6}
        disabled={codeExpired}
        placeholder="인증코드 6자리"
        rightElement={
          isCodeSent ? <span className="text-xs text-[#7d8580]">{minutes}:{seconds}</span> : undefined
        }
      />
      <AuthField
        label="비밀번호"
        value={form.password}
        error={errors.password}
        onChange={(value) => updateField("password", value)}
        type="password"
        autoComplete="new-password"
        placeholder="영문, 숫자, 특수문자 포함 10자 이상"
        password
      />
      <AuthField
        label="비밀번호 확인"
        value={form.confirm}
        error={errors.confirm}
        onChange={(value) => updateField("confirm", value)}
        type="password"
        autoComplete="new-password"
        placeholder="비밀번호 재입력"
        password
      />
      {submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}
      <Button
        content={submitting ? "가입 중…" : "회원가입"}
        type="submit"
        disabled={!valid}
        className={`mt-2 h-13 w-full font-bold ${
          valid ? "cursor-pointer bg-[#02C551]" : "cursor-not-allowed bg-[#CFD0D1]"
        }`}
      />
    </form>
  );
};

interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  password?: boolean;
  rightElement?: ReactNode;
}
const AuthField = ({
  label,
  value,
  error,
  onChange,
  password,
  rightElement,
  ...props
}: AuthFieldProps) => (
  <label className="block">
    <span className="text-sm font-semibold text-[#344039]">{label}</span>
    <Input
      {...props}
      value={value}
      error={Boolean(error)}
      onChange={(event) => onChange(event.target.value)}
      showPasswordToggle={password}
      rightElement={rightElement}
      className="mt-2 h-13 w-full"
    />
    <span className="mt-1 block min-h-5 text-xs text-[#D61E1E]">{error || ""}</span>
  </label>
);
