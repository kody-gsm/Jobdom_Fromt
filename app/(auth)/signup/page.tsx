/* 회원가입 페이지 */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100}/>
      <span className="mt-[63px] text-left w-[680px] text-[18px] font-medium">이메일</span>
        <Input
          type="email"
          placeholder="이메일 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
      <span className="mt-[38px] text-left w-[680px] text-[18px] font-medium">비밀번호</span>
        <Input
          type="password"
          placeholder="비밀번호 입력"
          className="mt-[15px] py-[16px] px-[18px] w-[680px] h-[56px]"
        />
        <Button
          content="확인"
          className="mt-[53px] w-[680px] h-[56px] text-[23px] cursor-pointer"
          type="submit"
        />
    </main>
  );
}