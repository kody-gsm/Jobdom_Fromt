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
      <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100} className="mt-[64px]" />
      <span className="mt-[88px] text-left w-[600px] text-[18px] font-medium">이메일</span>
        <Input
          type="email"
          placeholder="이메일 입력"
          className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
        />
      <p className="mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E]">잘못된 이메일 형식입니다.</p>
      <span className="mt-[14px] text-left w-[600px] text-[18px] font-medium">인증코드</span>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="인증코드 입력"
          className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
        />
        <p className="mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E]">인증코드가 올바르지않습니다.</p>
        <p className="mt-[-4px] text-right w-[600px] text-[15px] font-[400] text-[#02C551] cursor-pointer">인증코드 재발송</p>
      <span className="text-left w-[600px] text-[18px] font-medium">비밀번호</span>
        <Input
          type="password"
          placeholder="비밀번호 입력"
          className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
        />
      <span className="mt-[36px] text-left w-[600px] text-[18px] font-medium">비밀번호 확인</span>
        <Input
          type="password"
          placeholder="비밀번호 재입력"
          className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
        />
      <p className="mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E]">비밀번호가 일치하지 않습니다.</p>
        <Button
          content="확인"
          className="mt-[74px] w-[600px] h-[56px] text-[23px] cursor-pointer mb-[128px]"
          type="submit"
          onClick={() => router.push("/login")}
        />
    </main>
  );
}