"use client";

import type { FormEvent } from "react";
import { formatCountdown } from "@fsd/shared/lib";
import { ActionButton, PasswordField, TextField } from "@fsd/shared/ui";
import { useSignupForm } from "../model/useSignupForm.ts";

export const SignupForm = () => {
  const signupForm = useSignupForm();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void signupForm.submit();
  };

  const codeActionLabel = signupForm.isSendingCode
    ? "발송 중"
    : signupForm.isCodeSent
      ? "인증코드 재발송"
      : "인증코드 발송";

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="이메일"
        type="email"
        autoComplete="email"
        value={signupForm.form.email}
        error={signupForm.errors.email}
        onChange={(event) => signupForm.updateField("email", event.target.value)}
        placeholder="s123@gsm.hs.kr"
      />

      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          disabled={!signupForm.canSendCode}
          onClick={() => void signupForm.sendCode()}
          className="min-h-11 rounded-lg px-2 text-sm font-semibold text-[#02A946] transition-colors hover:bg-[#F4F6F8] disabled:text-[#9AA0A6] disabled:hover:bg-transparent"
        >
          {codeActionLabel}
        </button>
      </div>

      <TextField
        label="인증코드"
        inputMode="numeric"
        maxLength={6}
        value={signupForm.form.verificationCode}
        error={
          signupForm.codeExpired
            ? "인증코드가 만료되었습니다. 재발송해주세요."
            : signupForm.errors.verificationCode
        }
        disabled={signupForm.codeExpired}
        onChange={(event) => signupForm.updateField("verificationCode", event.target.value)}
        placeholder="인증코드 6자리"
        endElement={
          signupForm.isCodeSent ? (
            <span className="text-xs text-[#737A82]">
              {formatCountdown(signupForm.verificationSecondsLeft)}
            </span>
          ) : undefined
        }
      />

      <PasswordField
        label="비밀번호"
        autoComplete="new-password"
        value={signupForm.form.password}
        error={signupForm.errors.password}
        onChange={(event) => signupForm.updateField("password", event.target.value)}
        placeholder="영문, 숫자, 특수문자 포함 10자 이상"
      />

      <PasswordField
        label="비밀번호 확인"
        autoComplete="new-password"
        value={signupForm.form.confirmPassword}
        error={signupForm.errors.confirmPassword}
        onChange={(event) => signupForm.updateField("confirmPassword", event.target.value)}
        placeholder="비밀번호 재입력"
      />

      {signupForm.submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {signupForm.submitError}
        </p>
      ) : null}

      <ActionButton type="submit" disabled={!signupForm.canSubmit} className="w-full">
        {signupForm.isSubmitting ? "가입 중" : "회원가입"}
      </ActionButton>
    </form>
  );
};