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
    setEmail,
    setPassword,
    setRememberLogin,
    submit,
  } = useLoginForm();
  const firstErrorField = errors.email ? "email" : errors.password ? "password" : null;

  return (
    <form
      noValidate
      autoComplete="on"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");
        void submit({ email, password });
      }}
    >
      <TextField
        label="이메일"
        type="email"
        name="email"
        autoComplete="email"
        value={form.email}
        error={firstErrorField === "email" ? errors.email : undefined}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="학교 이메일을 입력해주세요"
        className="h-14 rounded-2xl"
      />

      <PasswordField
        label="비밀번호"
        name="password"
        autoComplete="current-password"
        value={form.password}
        error={firstErrorField === "password" ? errors.password : undefined}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="비밀번호를 입력해주세요"
        className="h-14 rounded-2xl"
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[#5E6670]">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={form.rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
              className="absolute inset-0 h-5 w-5 appearance-none rounded-[4px] border border-[#B8C0C8] bg-white checked:border-brand checked:bg-brand"
            />
            {form.rememberLogin ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 12 10"
                className="pointer-events-none relative h-3 w-3 text-white"
                fill="none"
              >
                <path
                  d="M1 5 4.5 8.5 11 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
          <span>아이디 저장</span>
        </label>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center font-semibold text-brand-accent transition-colors hover:text-[#018D3E]"
        >
          비밀번호 재설정
        </Link>
      </div>

      {submitError ? (
        <p role="alert" className="rounded-xl bg-[#FFF1F0] px-4 py-3 text-sm text-[#C9342B]">
          {submitError}
        </p>
      ) : null}

      <ActionButton
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-2xl text-base font-bold"
      >
        {isSubmitting ? "로그인 중…" : "로그인"}
      </ActionButton>

      <p className="pt-1 text-center text-sm text-[#7A828B]">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center font-bold text-brand-accent hover:text-[#018D3E]"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
};
