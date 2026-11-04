"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@fsd/shared/api";
import { ActionButton, TextField } from "@fsd/shared/ui";
import { submitPassReport } from "../api/passReport.ts";

const MAX_COMPANY_NAME = 100;

export const PassReportForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentCompany, setSentCompany] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = companyName.trim();
    if (!name) {
      setError("회사명을 입력해 주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitPassReport(name);
      setSentCompany(name);
      setCompanyName("");
    } catch (caught) {
      setError(caught instanceof ApiError && caught.message ? caught.message : "합격 보고를 보내지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-5">
      <TextField
        label="회사명"
        value={companyName}
        maxLength={MAX_COMPANY_NAME}
        onChange={(event) => {
          setCompanyName(event.target.value);
          setSentCompany("");
          if (error) setError("");
        }}
        placeholder="합격한 회사 이름"
        error={error}
        disabled={submitting}
      />
      <ActionButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "보내는 중…" : "제출"}
      </ActionButton>
      {sentCompany ? (
        <p role="status" className="text-sm font-semibold text-brand-accent">
          {sentCompany} 합격 소식을 선생님께 보냈어요.
        </p>
      ) : null}
    </form>
  );
};
