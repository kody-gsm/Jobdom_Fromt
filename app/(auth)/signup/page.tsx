"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/atoms/Button";
import { Input } from "@/app/components/atoms/Input";
import { ApiError, sendSignupVerificationCode, signup } from "@/app/utils/api";
import { isValidPassword } from "@/app/utils/authValidation";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", verificationCode: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const router = useRouter();

  const update = (name: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "email") setCodeSent(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^s.*@gsm\.hs\.kr$/.test(form.email)) return setError("s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.");
    if (form.verificationCode.length !== 6) return setError("인증코드 6자리를 입력해주세요.");
    if (!isValidPassword(form.password)) return setError("영문, 숫자, 특수문자를 포함해 10자 이상 입력해주세요.");
    if (form.password !== form.confirm) return setError("비밀번호가 일치하지 않습니다.");
    try {
      setSubmitting(true);
      setError("");
      await signup({ email: form.email.trim(), password: form.password, verificationCode: form.verificationCode });
      router.push("/login");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const sendCode = async () => {
    if (!/^s.*@gsm\.hs\.kr$/.test(form.email)) {
      setCodeSent(false);
      return setError("s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.");
    }
    try {
      setSendingCode(true);
      setError("");
      setCodeSent(false);
      await sendSignupVerificationCode(form.email.trim());
      setCodeSent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "인증코드를 발송하지 못했습니다.");
    } finally {
      setSendingCode(false);
    }
  };

  const valid = Object.values(form).every(Boolean) && !submitting;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form noValidate onSubmit={submit} className="flex flex-col items-center">
        <Image src="/JobdamIcon.svg" alt="로고" width={210} height={100} className="mt-[64px]" />
        <Field label="이메일" value={form.email} onChange={(value) => update("email", value)} type="email" />
        <button type="button" disabled={sendingCode} onClick={sendCode} className="mt-3 w-[600px] text-right text-[15px] text-[#02C551] disabled:text-[#95979D]">{sendingCode ? "발송 중" : "인증코드 발송"}</button>
        <Field label="인증코드" value={form.verificationCode} onChange={(value) => update("verificationCode", value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} />
        <Field label="비밀번호" value={form.password} onChange={(value) => update("password", value)} type="password" password />
        <Field label="비밀번호 확인" value={form.confirm} onChange={(value) => update("confirm", value)} type="password" password />
        <p aria-live="polite" className={`mt-2 w-[600px] text-right text-[15px] ${error ? "text-[#D61E1E]" : "text-[#02A946]"} ${error || codeSent ? "visible" : "invisible"}`}>{error || "인증코드를 발송했습니다."}</p>
        <Button content="확인" type="submit" disabled={!valid} className={`mb-[128px] mt-[52px] h-[56px] w-[600px] text-[23px] text-white ${valid ? "cursor-pointer bg-[#02C551]" : "cursor-not-allowed bg-[#CFD0D1]"}`} />
      </form>
    </main>
  );
}

function Field({ label, value, onChange, password, ...props }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  password?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <>
      <span className="mt-[20px] w-[600px] text-left text-[18px] font-medium">{label}</span>
      <Input {...props} value={value} onChange={(event) => onChange(event.target.value)} showPasswordToggle={password} className="mt-[16px] h-[56px] w-[600px] px-[16px] py-[16px]" />
    </>
  );
}
