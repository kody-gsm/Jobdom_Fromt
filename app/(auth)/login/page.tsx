/* 로그인 페이지 */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/app/utils/authApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    !isSubmitting;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      setIsSubmitting(true);
      await login(email, password);
      setEmailError(false);
      setPasswordError(false);
      router.push("/main");
    } catch {
      setEmailError(true);
      setPasswordError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col items-center">
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
        error={emailError}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(false);
        }}
        placeholder="이메일 입력"
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />
      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          emailError ? "visible" : "invisible"
        }`}
      >
        잘못된 이메일입니다.
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

      <p className="mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#02C551] cursor-pointer"
        onClick={() => router.push("/forgot-password")}>
        비밀번호 찾기
      </p>

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
