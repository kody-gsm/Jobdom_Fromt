/* 비밀번호 재설정 페이지 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getGsmEmailErrorMessage,
  getRequiredMessage,
  isValidPassword,
} from "@/app/utils/authValidation";
import {
  resetPassword,
  sendPasswordResetCode,
} from "@/app/utils/authApi";
import {
  getAuthErrorMessage,
  getPasswordResetError,
} from "@/app/utils/authErrorMessages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [codeErrorMessage, setCodeErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const codeExpired = isCodeSent && timeLeft <= 0;
  const displayedCodeError = codeExpired
    ? "인증코드가 만료되었습니다. 재발송해주세요."
    : codeErrorMessage;
  const isValid =
    email.trim() !== "" &&
    authenticationCode.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    !isSubmitting &&
    !codeExpired;
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitErrorMessage("");

    const emailError = getGsmEmailErrorMessage(email);
    if (emailError) return setEmailErrorMessage(emailError);
    setEmailErrorMessage("");

    if (authenticationCode.trim() === "") return setCodeErrorMessage("인증코드를 입력해주세요.");
    if (authenticationCode.length !== 6) return setCodeErrorMessage("인증코드 6자리를 입력해주세요.");
    if (codeExpired) return setCodeErrorMessage("인증코드가 만료되었습니다. 재발송해주세요.");
    setCodeErrorMessage("");

    if (password.trim() === "") return setPasswordErrorMessage("비밀번호를 입력해주세요.");
    if (!isValidPassword(password)) return setPasswordErrorMessage("영문, 숫자, 특수문자를 포함하여 10자 이상 입력해주세요.");
    setPasswordErrorMessage("");

    if (confirmPassword.trim() === "") return setConfirmPasswordErrorMessage("비밀번호를 다시 입력해주세요.");
    if (password !== confirmPassword) return setConfirmPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
    setConfirmPasswordErrorMessage("");

    try {
      setIsSubmitting(true);
      await resetPassword(email.trim(), authenticationCode, password);
      router.push("/login");
    } catch (caught) {
      const result = getPasswordResetError(caught);
      if (result.field === "verificationCode") setCodeErrorMessage(result.message);
      else if (result.field === "email") setEmailErrorMessage(result.message);
      else setSubmitErrorMessage(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCode = async () => {
    if (isSendingCode) return;

    const emailError = getGsmEmailErrorMessage(email);
    if (emailError) return setEmailErrorMessage(emailError);

    try {
      setIsSendingCode(true);
      setSubmitErrorMessage("");
      await sendPasswordResetCode(email.trim());
      setEmailErrorMessage("");
      setCodeErrorMessage("");
      setIsCodeSent(true);
      setTimeLeft(180);
    } catch (caught) {
      setEmailErrorMessage(
        getAuthErrorMessage(caught, "인증코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요."),
      );
      setIsCodeSent(false);
      setTimeLeft(0);
    } finally {
      setIsSendingCode(false);
    }
  };
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <form noValidate onSubmit={handleReset} className="flex flex-col items-center">
      <Image
        src="/JobdamIcon.svg"
        alt="로고"
        width={210}
        height={100}
        className="mt-[64px]"
      />
      <span style={{ marginTop: 88 }} className="text-left w-[600px] text-[18px] font-medium">
        이메일
      </span>
      <Input
        type="email"
        value={email}
        error={emailErrorMessage !== ""}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailErrorMessage("");
        }}
        placeholder="이메일 입력"
        className="mt-[8px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          emailErrorMessage ? "visible" : "invisible"
        }`}
      >
        {emailErrorMessage || getRequiredMessage("이메일을")}
      </p>
      <span className="mt-[12px] text-left w-[600px] text-[18px] font-medium">
        인증코드
      </span>
      <Input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={authenticationCode}
        error={Boolean(displayedCodeError)}
        onChange={(e) => {
          setAuthenticationCode(
            e.target.value.replace(/[^0-9]/g, "")
          );
          setCodeErrorMessage("");
          setSubmitErrorMessage("");
        }}
        rightElement={
          isCodeSent ? (
            <span className="text-[15px] font-[400] text-[#95979D]">
              {minutes}:{seconds}
            </span>
          ) : null
        }
        placeholder="인증코드 입력"
        className="mt-[8px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          displayedCodeError ? "visible" : "invisible"
        }`}
      >
        {displayedCodeError || "인증코드를 입력해주세요."}
      </p>
      <div className="mt-[-4px] flex justify-end items-center w-[600px]">
        <button
          type="button"
          disabled={isSendingCode}
          className={`text-[15px] font-[400] ${
            isSendingCode
              ? "text-[#95979D] cursor-not-allowed"
              : "text-[#02C551] cursor-pointer"
          }`}
          onClick={handleSendCode}
        >
          {isSendingCode
            ? "발송 중"
            : isCodeSent
              ? "인증코드 재발송"
              : "인증코드 발송"}
        </button>
      </div>
      <span className="mt-[12px] text-left w-[600px] text-[18px] font-medium">
        새 비밀번호
      </span>
      <Input
        type="password"
        value={password}
        error={Boolean(passwordErrorMessage)}
        showPasswordToggle={true}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordErrorMessage("");
          setSubmitErrorMessage("");
        }}
        placeholder="비밀번호 입력"
        className="mt-[8px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          passwordErrorMessage ? "visible" : "invisible"
        }`}
      >
        {passwordErrorMessage || "비밀번호를 입력해주세요."}
      </p>
      <span className="mt-[12px] text-left w-[600px] text-[18px] font-medium">
        비밀번호 확인
      </span>
      <Input
        type="password"
        value={confirmPassword}
        error={Boolean(confirmPasswordErrorMessage)}
        showPasswordToggle={true}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setConfirmPasswordErrorMessage("");
          setSubmitErrorMessage("");
        }}
        placeholder="비밀번호 재입력"
        className="mt-[8px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          confirmPasswordErrorMessage ? "visible" : "invisible"
        }`}
      >
        {confirmPasswordErrorMessage || "비밀번호를 다시 입력해주세요."}
      </p>
      {submitErrorMessage ? (
        <p role="alert" className="mt-[4px] w-[600px] text-right text-[15px] text-[#D61E1E]">
          {submitErrorMessage}
        </p>
      ) : null}
      <Button
        content="확인"
        type="submit"
        disabled={!isValid}
        className={`mt-[28px] w-[600px] h-[56px] text-[23px] text-white mb-[64px]
          ${
            isValid
              ? "bg-[#02C551] cursor-pointer"
              : "bg-[#CFD0D1] cursor-not-allowed"
          }`}
      />
      </form>
    </main>
  );
}
