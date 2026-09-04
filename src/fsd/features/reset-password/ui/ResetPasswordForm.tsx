"use client";

import type { FormEvent } from "react";
import { formatCountdown } from "@fsd/shared/lib";
import { ActionButton, PasswordField, TextField } from "@fsd/shared/ui";
import { useResetPasswordForm } from "../model/useResetPasswordForm.ts";

export const ResetPasswordForm = () => {
  const resetForm = useResetPasswordForm();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void resetForm.submit();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="이메일"
        type="email"
        autoComplete="email"
        value={resetForm.form.email}
        error={resetForm.errors.email}
        onChange={(event) => resetForm.updateField("email", event.target.value)}
        placeholder="s123@gsm.hs.kr"
      />

      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          disabled={resetForm.isSendingCode}
          onClick={() => void resetForm.sendCode()}
          className="text-sm font-semibold text-[#02A946] disabled:text-[#9AA0A6]"
        >
          {resetForm.isSendingCode
            ? "발송 중"
            : resetForm.isCodeSent
              ? "인증코드 재발송"
              : "인증코드 발송"}
        </button>
      </div>

      <TextField
        label="인증코드"
        inputMode="numeric"
        maxLength={6}
        value={resetForm.form.verificationCode}
        error={
          resetForm.codeExpired
            ? "인증코드가 만료되었습니다. 재발송해주세요."
            : resetForm.errors.verificationCode
        }
        disabled={resetForm.codeExpired}
        onChange={(event) => resetForm.updateField("verificationCode", event.target.value)}
        placeholder="인증코드 6자리"
        endElement={
          resetForm.isCodeSent ? (
            <span className="text-xs text-[#737A82]">
              {formatCountdown(resetForm.verificationSecondsLeft)}
            </span>
          ) : undefined
        }
      />

      <PasswordField
        label="새 비밀번호"
        autoComplete="new-password"
        value={resetForm.form.password}
        error={resetForm.errors.password}
        onChange={(event) => resetForm.updateField("password", event.target.value)}
        placeholder="영문, 숫자, 특수문자 포함 10자 이상"
      />

      <PasswordField
        label="비밀번호 확인"
        autoComplete="new-password"
        value={resetForm.form.confirmPassword}
        error={resetForm.errors.confirmPassword}
        onChange={(event) => resetForm.updateField("confirmPassword", event.target.value)}
        placeholder="비밀번호 재입력"
      />

      {resetForm.submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {resetForm.submitError}
        </p>
      ) : null}

      <ActionButton type="submit" disabled={!resetForm.canSubmit} className="w-full">
        {resetForm.isSubmitting ? "변경 중" : "비밀번호 재설정"}
      </ActionButton>
    </form>
  );
};