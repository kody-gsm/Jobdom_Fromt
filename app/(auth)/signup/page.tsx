/* 회원가입 페이지 */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100} className="mt-[127px]" />
      <span className="mt-[63px] text-left w-[680px] text-[18px] font-medium">이메일</span>
        <Input
          type="email"
          placeholder="이메일 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
      <span className="mt-[38px] text-left w-[680px] text-[18px] font-medium">인증코드</span>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="인증코드 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
      <span className="mt-[38px] text-left w-[680px] text-[18px] font-medium">비밀번호</span>
        <Input
          type="password"
          placeholder="비밀번호 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
      <span className="mt-[38px] text-left w-[680px] text-[18px] font-medium">비밀번호 확인</span>
        <Input
          type="password"
          placeholder="비밀번호 재입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
        <Button
          content="확인"
          className="mt-[53px] w-[680px] h-[56px] text-[23px] cursor-pointer mb-[127px]"
          type="submit"
          onClick={() => router.push("/login")}
        />
    </main>
  );
}