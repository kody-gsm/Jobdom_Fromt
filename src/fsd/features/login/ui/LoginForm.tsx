"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  clearRememberLoginPreference,
  getAuthErrorMessage,
  getRequiredMessage,
  getRoleHomePath,
  readRememberLoginPreference,
  restoreRememberedSession,
} from "@fsd/entities/user";
import { Button, Input } from "@fsd/shared/ui";
import { login } from "../api/login.ts";

export const LoginForm = () => {
  const [email, setEmail] = useState(() => readRememberLoginPreference().email);
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRememberLogin, setIsRememberLogin] = useState(
    () => readRememberLoginPreference().enabled,
  );
  const router = useRouter();

  useEffect(() => {
    let active = true;
    restoreRememberedSession().then((session) => {
      if (active && session) router.replace(getRoleHomePath(session.role));
    });
    return () => {
      active = false;
    };
  }, [router]);

  const isValid = email.trim() !== "" && password.trim() !== "" && !isSubmitting;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailErrorMessage("");
    setPasswordError(false);

    if (email.trim() === "") {
      setEmailErrorMessage(getRequiredMessage("이메일을"));
      return;
    }
    if (password.trim() === "") {
      setPasswordError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await login(email, password, isRememberLogin);
      router.push(getRoleHomePath(session.role));
    } catch (caught) {
      setEmailErrorMessage(
        getAuthErrorMessage(caught, "이메일 또는 비밀번호가 올바르지 않습니다."),
      );
      setPasswordError(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate autoComplete="on" onSubmit={handleLogin} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-[#344039]">이메일</span>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          error={emailErrorMessage !== ""}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailErrorMessage("");
          }}
          placeholder="이메일 입력"
          className="mt-2 h-13 w-full"
        />
        <span className="mt-2 block min-h-5 text-xs text-[#D61E1E]">
          {emailErrorMessage}
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#344039]">비밀번호</span>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          error={passwordError}
          showPasswordToggle
          onChange={(event) => {
            setPassword(event.target.value);
            setPasswordError(false);
          }}
          placeholder="비밀번호 입력"
          className="mt-2 h-13 w-full"
        />
        <span className="mt-2 block min-h-5 text-xs text-[#D61E1E]">
          {passwordError ? "비밀번호를 입력해주세요." : ""}
        </span>
      </label>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-[#5F6368]">
          <input
            type="checkbox"
            checked={isRememberLogin}
            onChange={(event) => {
              const checked = event.target.checked;
              setIsRememberLogin(checked);
              if (!checked) clearRememberLoginPreference();
            }}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border ${
              isRememberLogin
                ? "border-[#02C551] bg-[#02C551]"
                : "border-[#B8BBC0] bg-white"
            }`}
          >
            {isRememberLogin ? (
              <span className="text-[13px] leading-none text-white">✓</span>
            ) : null}
          </span>
          <span>아이디 저장</span>
        </label>
        <Link href="/forgot-password" className="font-semibold text-[#02a946]">
          비밀번호 찾기
        </Link>
      </div>

      <Button
        content={isSubmitting ? "로그인 중…" : "로그인"}
        type="submit"
        disabled={!isValid}
        className={`mt-3 h-13 w-full font-bold ${
          isValid ? "cursor-pointer bg-[#02C551]" : "cursor-not-allowed bg-[#CFD0D1]"
        }`}
      />

      <p className="text-center text-sm text-[#7d8580]">
        잡담 회원가입을 안 하셨나요?{" "}
        <Link href="/signup" className="font-bold text-[#02a946]">
          회원가입
        </Link>
      </p>
    </form>
  );
};
