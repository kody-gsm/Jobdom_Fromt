/* 회원가입 페이지 */
"use client";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <p>회원가입 페이지</p>
      <text
        className="text-[#02C551] cursor-pointer"
        onClick={() => router.push("/login")}
      >
        로그인으로 돌아가기
      </text>
    </main>
  );
}