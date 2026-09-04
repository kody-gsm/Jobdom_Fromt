"use client";

import Link from "next/link";
import { ActionButton, PasswordField, TextField } from "@fsd/shared/ui";
import { useLoginForm } from "../model/useLoginForm.ts";

export const LoginForm = () => {
  const {
    form,
    errors,
    submitError,
    isSubmitting,
    canSubmit,
    setEmail,
    setPassword,
    setRememberLogin,
    submit,
  } = useLoginForm();

  return (
    <form
      noValidate
      autoComplete="on"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <TextField
        label="이메일"
        type="email"
        name="email"
        autoComplete="email"
        value={form.email}
        error={errors.email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="학교 이메일을 입력해주세요"
        className="h-14 rounded-[14px]"
      />

      <PasswordField
        label="비밀번호"
        name="password"
        autoComplete="current-password"
        value={form.password}
        error={errors.password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="비밀번호를 입력해주세요"
        className="h-14 rounded-[14px]"
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-[#5E6670]">
          <input
            type="checkbox"
            checked={form.rememberLogin}
            onChange={(event) => setRememberLogin(event.target.checked)}
            className="h-4 w-4 accent-[#02C551]"
          />
          <span>아이디 저장</span>
        </label>
        <Link
          href="/forgot-password"
          className="font-semibold text-[#02A94A] transition-colors hover:text-[#018D3E]"
        >
          비밀번호 찾기
        </Link>
      </div>

      {submitError ? (
        <p role="alert" className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-sm text-[#C9342B]">
          {submitError}
        </p>
      ) : null}

      <ActionButton
        type="submit"
        disabled={!canSubmit}
        className="h-14 w-full rounded-[14px] text-base font-bold"
      >
        {isSubmitting ? "로그인 중…" : "로그인"}
      </ActionButton>

      <p className="pt-1 text-center text-sm text-[#7A828B]">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold text-[#02A94A] hover:text-[#018D3E]">
          회원가입
        </Link>
      </p>
    </form>
  );
};
