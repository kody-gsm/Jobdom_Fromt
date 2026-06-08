//비밀번호 재설정 페이지
"use client";

import { useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function ForgotPasswordPage(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100} className="mt-[128px]" />
      <span className="mt-[63px] text-left w-[680px] text-[18px] font-medium">이메일</span>
        <Input
          type="email"
          placeholder="이메일 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
      <span className="mt-[38px] text-left w-[680px] text-[18px] font-medium">인증코드</span>
        <Input
          type="email"
          placeholder="인증코드 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
        <p className="mt-[4px] text-right w-[680] text-[15px] font-[400] text-[#02C551] cursor-pointer" >인증코드 발송</p>
      <span className=" text-left w-[680px] text-[18px] font-medium">새 비밀번호</span>
        <Input
          type="password"
          placeholder="새로운 비밀번호 입력"
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
          className="mt-[50px] mb-[128px] w-[680px] h-[56px] text-[23px] cursor-pointer"
          type="submit"
          onClick={() => router.push("/login")}
        />
    </main>
  );
}