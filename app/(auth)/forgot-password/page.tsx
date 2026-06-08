/* 비밀번호 재설정 페이지 */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [authenticationCode, setAuthenticationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const router = useRouter();

  const MOCK_CODE = "123456";

  const isValid =
    email.trim() !== "" &&
    authenticationCode.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  const handleReset = () => {
    // ✅ SignupPage와 동일: 이메일 도메인 제한
    if (!email.endsWith("@gsm.hs.kr")) {
      setEmailError(true);
      setCodeError(false);
      setConfirmPasswordError(false);
      return;
    }
    setEmailError(false);

    // 인증코드 검증 (Signup과 동일)
    if (authenticationCode !== MOCK_CODE) {
      setCodeError(true);
      setConfirmPasswordError(false);
      return;
    }
    setCodeError(false);

    // 비밀번호 확인 (Signup과 동일)
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      return;
    }
    setConfirmPasswordError(false);

    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/JobdamIcon.svg"
        alt="로고"
        width={210}
        height={100}
        className="mt-[64px]"
      />

      {/* 이메일 */}
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
        @gsm.hs.kr 이메일만 사용 가능합니다.
      </p>

      {/* 인증코드 */}
      <span className="mt-[14px] text-left w-[600px] text-[18px] font-medium">
        인증코드
      </span>

      <Input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={authenticationCode}
        error={codeError}
        onChange={(e) => {
          setAuthenticationCode(
            e.target.value.replace(/[^0-9]/g, "")
          );
          setCodeError(false);
        }}
        placeholder="인증코드 입력"
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />

      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          codeError ? "visible" : "invisible"
        }`}
      >
        인증코드가 올바르지 않습니다.
      </p>

      <p className="mt-[-4px] text-right w-[600px] text-[15px] font-[400] text-[#02C551] cursor-pointer">
        인증코드 발송
      </p>

      {/* 비밀번호 */}
      <span className="text-left w-[600px] text-[18px] font-medium">
        새 비밀번호
      </span>

      <Input
        type="password"
        value={password}
        showPasswordToggle={true}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호 입력"
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />

      {/* 비밀번호 확인 */}
      <span className="mt-[36px] text-left w-[600px] text-[18px] font-medium">
        비밀번호 확인
      </span>

      <Input
        type="password"
        value={confirmPassword}
        error={confirmPasswordError}
        showPasswordToggle={true}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setConfirmPasswordError(false);
        }}
        placeholder="비밀번호 재입력"
        className="mt-[16px] py-[16px] px-[16px] w-[600px] h-[56px]"
      />

      <p
        className={`mt-[4px] text-right w-[600px] text-[15px] font-[400] text-[#D61E1E] ${
          confirmPasswordError ? "visible" : "invisible"
        }`}
      >
        비밀번호가 일치하지 않습니다.
      </p>

      {/* 버튼 */}
      <Button
        content="확인"
        type="submit"
        disabled={!isValid}
        onClick={handleReset}
        className={`mt-[74px] w-[600px] h-[56px] text-[23px] text-white mb-[128px]
          ${
            isValid
              ? "bg-[#02C551] cursor-pointer"
              : "bg-[#CFD0D1] cursor-not-allowed"
          }`}
      />
    </main>
  );
}