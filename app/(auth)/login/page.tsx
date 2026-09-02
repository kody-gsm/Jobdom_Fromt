/* 로그인 페이지 */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, restoreRememberedSession } from "@/app/utils/authApi";
import { getRequiredMessage } from "@/app/utils/authValidation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRememberLogin, setIsRememberLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    restoreRememberedSession().then((session) => {
      if (active && session) router.replace(session.role === "TEACHER" ? "/teacher" : "/");
    });
    return () => {
      active = false;
    };
  }, [router]);

  const isValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    !isSubmitting;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setEmailErrorMessage("");
      setPasswordError(false);
      router.push(session.role === "TEACHER" ? "/teacher" : "/");
    } catch {
      setEmailErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      setPasswordError(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <form noValidate onSubmit={handleLogin} className="flex flex-col items-center">
      <Image
        src="/JobdamIcon.svg"
        alt="로고"
        width={210}
        height={100}
        className="mt-[64px]"
      />
      <span className="mt-[88px] text-left w-[600px] text-[18px] font-medium">
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
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          emailErrorMessage ? "visible" : "invisible"
        }`}
      >
        {emailErrorMessage || getRequiredMessage("이메일을")}
      </p>
      <span className="mt-[14px] text-left w-[600px] text-[18px] font-medium">
        비밀번호
      </span>
      <Input
        type="password"
        value={password}
        error={passwordError}
        showPasswordToggle={true}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError(false);
        }}
        placeholder="비밀번호 입력"
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          passwordError ? "visible" : "invisible"
        }`}
      >
        비밀번호가 일치하지 않습니다.
      </p>

      <div className="mt-[4px] flex w-[600px] items-center justify-between text-[15px]">
        <label className="flex cursor-pointer items-center gap-2 text-[#5F6368]">
          <input
            type="checkbox"
            checked={isRememberLogin}
            onChange={(event) => setIsRememberLogin(event.target.checked)}
            className="h-[18px] w-[18px] cursor-pointer accent-[#02C551]"
          />
          <span>자동 로그인</span>
        </label>
        <button
          type="button"
          className="cursor-pointer font-[400] text-[#02C551]"
          onClick={() => router.push("/forgot-password")}
        >
          비밀번호 찾기
        </button>
      </div>

      <Button
        content="확인"
        type="submit"
        disabled={!isValid}
        className={`mt-[52px] w-[600px] h-[56px] text-[23px] text-white ${
          isValid
            ? "bg-[#02C551] cursor-pointer"
            : "bg-[#CFD0D1] cursor-not-allowed"
        }`}
      />

      <div className="mt-[12px] w-[600px] text-[14px] flex">
        <p className="text-[#95979D]">잡담 회원가입을 안 하셨나요?</p>
        <p
          className="text-[#02C551] ml-[8px] cursor-pointer"
          onClick={() => router.push("/signup")}
        >
          회원가입
        </p>
      </div>
      </form>
    </main>
  );
}
