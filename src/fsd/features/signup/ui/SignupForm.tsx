"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { formatCountdown } from "@fsd/shared/lib";
import { ActionButton, PasswordField, TextField } from "@fsd/shared/ui";
import { SignupConsentDialog } from "./SignupConsentDialog.tsx";
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
        error={signupForm.errorField === "email" ? signupForm.errors.email : undefined}
        onChange={(event) => signupForm.updateField("email", event.target.value)}
        placeholder="s123@gsm.hs.kr"
      />

      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          disabled={!signupForm.canSendCode}
          onClick={() => void signupForm.sendCode()}
          className="min-h-11 rounded-lg px-2 text-sm font-semibold text-brand-hover transition-colors hover:bg-surface disabled:text-[#9AA0A6] disabled:hover:bg-transparent"
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
          signupForm.errorField === "verificationCode" && signupForm.codeExpired
            ? "인증코드가 만료되었습니다. 재발송해주세요."
            : signupForm.errorField === "verificationCode"
              ? signupForm.errors.verificationCode
              : undefined
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
        error={signupForm.errorField === "password" ? signupForm.errors.password : undefined}
        onChange={(event) => signupForm.updateField("password", event.target.value)}
        placeholder="영문, 숫자, 특수문자 포함 10자 이상"
      />

      <PasswordField
        label="비밀번호 확인"
        autoComplete="new-password"
        value={signupForm.form.confirmPassword}
        error={signupForm.errorField === "confirmPassword" ? signupForm.errors.confirmPassword : undefined}
        onChange={(event) => signupForm.updateField("confirmPassword", event.target.value)}
        placeholder="비밀번호 재입력"
      />

      <div className="space-y-3 rounded-2xl border border-border bg-[#FAFBFC] p-4">
        <p className="text-sm font-semibold text-[#27364A]">약관 동의</p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex min-w-0 items-center gap-3 text-sm text-[#4D5663]">
                <input
                  type="checkbox"
                  checked={signupForm.form.termsAccepted}
                  disabled={!signupForm.canAgreeToTerms}
                  onChange={(event) => signupForm.updateConsent("termsAccepted", event.target.checked)}
                  className="h-5 w-5 shrink-0 accent-brand disabled:cursor-not-allowed"
                />
                <span>이용약관에 동의합니다 <strong className="text-[#E53935]">(필수)</strong></span>
              </label>
              <button
                type="button"
                onClick={() => signupForm.openConsent("terms")}
                className="shrink-0 text-sm font-semibold text-brand-hover hover:underline"
              >
                이용약관 보기
              </button>
            </div>
            {signupForm.errorField === "termsAccepted" && signupForm.errors.termsAccepted ? (
              <p role="alert" className="mt-2 pl-8 text-sm text-[#D93025]">
                {signupForm.errors.termsAccepted}
              </p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex min-w-0 items-center gap-3 text-sm text-[#4D5663]">
                <input
                  type="checkbox"
                  checked={signupForm.form.privacyAccepted}
                  disabled={!signupForm.canAgreeToPrivacy}
                  onChange={(event) => signupForm.updateConsent("privacyAccepted", event.target.checked)}
                  className="h-5 w-5 shrink-0 accent-brand disabled:cursor-not-allowed"
                />
                <span>개인정보 수집 및 이용에 동의합니다 <strong className="text-[#E53935]">(필수)</strong></span>
              </label>
              <button
                type="button"
                onClick={() => signupForm.openConsent("privacy")}
                className="shrink-0 text-sm font-semibold text-brand-hover hover:underline"
              >
                개인정보 처리방침 보기
              </button>
            </div>
            {signupForm.errorField === "privacyAccepted" && signupForm.errors.privacyAccepted ? (
              <p role="alert" className="mt-2 pl-8 text-sm text-[#D93025]">
                {signupForm.errors.privacyAccepted}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {signupForm.submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {signupForm.submitError}
        </p>
      ) : null}

      <ActionButton type="submit" disabled={!signupForm.canSubmit} className="w-full">
        {signupForm.isSubmitting ? "가입 중" : "회원가입"}
      </ActionButton>

      <p className="pt-1 text-center text-sm text-[#7A828B]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-brand-hover hover:underline">
          로그인
        </Link>
      </p>

      {signupForm.activeConsent ? (
        <SignupConsentDialog
          document={signupForm.activeConsent}
          onClose={signupForm.closeConsent}
          onScroll={(event) => signupForm.handleConsentScroll(signupForm.activeConsent!, event)}
          hasReadToEnd={signupForm.activeConsent === "terms" ? signupForm.canAgreeToTerms : signupForm.canAgreeToPrivacy}
        />
      ) : null}
    </form>
  );
};
