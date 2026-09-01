"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { ApiError, sendSignupVerificationCode, signup } from "@/app/utils/api";
import { isValidPassword } from "@/app/utils/authValidation";

type FormState = { email: string; verificationCode: string; password: string; confirm: string };
type ErrorState = FormState;
const emptyErrors: ErrorState = { email: "", verificationCode: "", password: "", confirm: "" };

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({ email: "", verificationCode: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<ErrorState>(emptyErrors);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  const update = (name: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^s.*@gsm\.hs\.kr$/.test(form.email)) return setErrors((current) => ({ ...current, email: "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요." }));
    if (form.verificationCode.length !== 6) return setErrors((current) => ({ ...current, verificationCode: "인증코드 6자리를 입력해주세요." }));
    if (!isValidPassword(form.password)) return setErrors((current) => ({ ...current, password: "영문, 숫자, 특수문자를 포함해 10자 이상 입력해주세요." }));
    if (form.password !== form.confirm) return setErrors((current) => ({ ...current, confirm: "비밀번호가 일치하지 않습니다." }));
    try {
      setSubmitting(true);
      setErrors(emptyErrors);
      await signup({ email: form.email.trim(), password: form.password, verificationCode: form.verificationCode });
      router.push("/login");
    } catch (caught) {
      setErrors((current) => ({ ...current, verificationCode: caught instanceof ApiError ? caught.message : "회원가입에 실패했습니다." }));
    } finally {
      setSubmitting(false);
    }
  };

  const sendCode = async () => {
    if (!/^s.*@gsm\.hs\.kr$/.test(form.email)) return setErrors((current) => ({ ...current, email: "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요." }));
    try {
      setSendingCode(true);
      setErrors((current) => ({ ...current, email: "" }));
      await sendSignupVerificationCode(form.email.trim());
      setIsCodeSent(true);
      setTimeLeft(180);
      setResendCooldown(10);
    } catch (caught) {
      setErrors((current) => ({ ...current, email: caught instanceof ApiError ? caught.message : "인증코드를 발송하지 못했습니다." }));
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const cooldownTimer = setInterval(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const valid = Object.values(form).every(Boolean) && !submitting;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form noValidate onSubmit={submit} className="flex flex-col items-center">
        <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100} className="mt-[64px]" />
        <Field label="이메일" value={form.email} error={errors.email} onChange={(value) => update("email", value)} type="email" placeholder="이메일 입력" />
        <button type="button" disabled={sendingCode || resendCooldown > 0} onClick={sendCode} className="mt-0 w-[600px] text-right text-[15px] text-[#02C551] disabled:text-[#95979D]">{sendingCode ? "발송 중" : resendCooldown > 0 ? "인증코드 발송 완료" : isCodeSent ? "인증코드 재발송" : "인증코드 발송"}</button>
        <Field label="인증코드" value={form.verificationCode} error={errors.verificationCode} onChange={(value) => update("verificationCode", value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} placeholder="인증코드 입력" rightElement={isCodeSent ? <span className="text-[15px] text-[#95979D]">{minutes}:{seconds}</span> : undefined} />
        <Field label="비밀번호" value={form.password} error={errors.password} onChange={(value) => update("password", value)} type="password" password placeholder="비밀번호 입력" />
        <Field label="비밀번호 확인" value={form.confirm} error={errors.confirm} onChange={(value) => update("confirm", value)} type="password" password placeholder="비밀번호 재입력" />
        <Button content="확인" type="submit" disabled={!valid} className={`mb-[128px] mt-[52px] h-[56px] w-[600px] text-[23px] text-white ${valid ? "cursor-pointer bg-[#02C551]" : "cursor-not-allowed bg-[#CFD0D1]"}`} />
      </form>
    </main>
  );
}

function Field({ label, value, error, onChange, password, rightElement, ...props }: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  password?: boolean;
  rightElement?: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <>
      <span className="mt-[20px] w-[600px] text-left text-[18px] font-medium">{label}</span>
      <Input {...props} value={value} error={Boolean(error)} onChange={(event) => onChange(event.target.value)} showPasswordToggle={password} rightElement={rightElement} className="mt-[16px] h-[56px] w-[600px] px-[16px] py-[16px]" />
      <p className={`mt-1 w-[600px] text-right text-[15px] text-[#D61E1E] ${error ? "visible" : "invisible"}`}>{error || "오류"}</p>
    </>
  );
}
