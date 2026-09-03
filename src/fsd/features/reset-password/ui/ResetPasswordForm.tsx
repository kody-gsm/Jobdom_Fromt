"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getAuthErrorMessage,
  getGsmEmailErrorMessage,
  getPasswordResetError,
  isValidPassword,
} from "@fsd/entities/user";
import { Button, Input } from "@fsd/shared/ui";
import { resetPassword, sendPasswordResetCode } from "../api/resetPassword.ts";

export const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const codeExpired = isCodeSent && timeLeft <= 0;
  const displayedCodeError = codeExpired
    ? "인증코드가 만료되었습니다. 재발송해주세요."
    : codeError;
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const valid = Boolean(
    email.trim() &&
      verificationCode.trim() &&
      password.trim() &&
      confirmPassword.trim() &&
      !isSubmitting &&
      !codeExpired,
  );

  const sendCode = async () => {
    if (isSendingCode) return;
    const emailMessage = getGsmEmailErrorMessage(email);
    if (emailMessage) {
      setEmailError(emailMessage);
      return;
    }

    try {
      setIsSendingCode(true);
      setSubmitError("");
      await sendPasswordResetCode(email.trim());
      setEmailError("");
      setCodeError("");
      setIsCodeSent(true);
      setTimeLeft(180);
    } catch (caught) {
      setEmailError(
        getAuthErrorMessage(
          caught,
          "인증코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.",
        ),
      );
      setIsCodeSent(false);
      setTimeLeft(0);
    } finally {
      setIsSendingCode(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const emailMessage = getGsmEmailErrorMessage(email);
    if (emailMessage) {
      setEmailError(emailMessage);
      return;
    }
    setEmailError("");
    if (verificationCode.trim() === "") {
      setCodeError("인증코드를 입력해주세요.");
      return;
    }
    if (verificationCode.length !== 6) {
      setCodeError("인증코드 6자리를 입력해주세요.");
      return;
    }
    if (codeExpired) {
      setCodeError("인증코드가 만료되었습니다. 재발송해주세요.");
      return;
    }
    setCodeError("");

    if (password.trim() === "") {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }
    if (!isValidPassword(password)) {
      setPasswordError("영문, 숫자, 특수문자를 포함하여 10자 이상 입력해주세요.");
      return;
    }
    setPasswordError("");

    if (confirmPassword.trim() === "") {
      setConfirmError("비밀번호를 다시 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setConfirmError("");

    try {
      setIsSubmitting(true);
      await resetPassword(email.trim(), verificationCode, password);
      router.push("/login");
    } catch (caught) {
      const result = getPasswordResetError(caught);
      if (result.field === "verificationCode") setCodeError(result.message);
      else if (result.field === "email") setEmailError(result.message);
      else setSubmitError(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label="이메일" error={emailError}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          error={Boolean(emailError)}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError("");
          }}
          placeholder="s123@gsm.hs.kr"
          className="mt-2 h-13 w-full"
        />
      </Field>
      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          disabled={isSendingCode}
          onClick={sendCode}
          className="text-sm font-semibold text-[#02a946] disabled:text-[#9aa19c]"
        >
          {isSendingCode ? "발송 중…" : isCodeSent ? "인증코드 재발송" : "인증코드 발송"}
        </button>
      </div>

      <Field label="인증코드" error={displayedCodeError}>
        <Input
          inputMode="numeric"
          maxLength={6}
          value={verificationCode}
          error={Boolean(displayedCodeError)}
          disabled={codeExpired}
          onChange={(event) => {
            setVerificationCode(event.target.value.replace(/\D/g, ""));
            setCodeError("");
            setSubmitError("");
          }}
          placeholder="인증코드 6자리"
          rightElement={
            isCodeSent ? <span className="text-xs text-[#7d8580]">{minutes}:{seconds}</span> : undefined
          }
          className="mt-2 h-13 w-full"
        />
      </Field>

      <Field label="새 비밀번호" error={passwordError}>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          error={Boolean(passwordError)}
          showPasswordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            setPasswordError("");
            setSubmitError("");
          }}
          placeholder="영문, 숫자, 특수문자 포함 10자 이상"
          className="mt-2 h-13 w-full"
        />
      </Field>

      <Field label="비밀번호 확인" error={confirmError}>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          error={Boolean(confirmError)}
          showPasswordToggle
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setConfirmError("");
            setSubmitError("");
          }}
          placeholder="비밀번호 재입력"
          className="mt-2 h-13 w-full"
        />
      </Field>

      {submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}
      <Button
        content={isSubmitting ? "변경 중…" : "비밀번호 변경"}
        type="submit"
        disabled={!valid}
        className={`mt-2 h-13 w-full font-bold ${
          valid ? "cursor-pointer bg-[#02C551]" : "cursor-not-allowed bg-[#CFD0D1]"
        }`}
      />
    </form>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-sm font-semibold text-[#344039]">{label}</span>
    {children}
    <span className="mt-1 block min-h-5 text-xs text-[#D61E1E]">{error || ""}</span>
  </label>
);
