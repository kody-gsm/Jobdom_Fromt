import { useEffect, useRef, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import { createStudentFormApi, type FormSummary } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";
import { getRecruit } from "../api/recruit.ts";
import { findRecruitForm } from "./formMatching.ts";

const studentFormApi = createStudentFormApi(requestWithSession);

export const useRecruitDetail = (recruitId: number) => {
  const [item, setItem] = useState<Recruit | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Pick<FormSummary, "id" | "title"> | null>(null);
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const recruitRef = useRef<Recruit | null>(null);
  const formsRef = useRef<Pick<FormSummary, "id" | "title">[] | null>(null);

  useEffect(() => {
    let active = true;

    recruitRef.current = null;
    formsRef.current = null;
    queueMicrotask(() => {
      if (!active) return;
      setItem(null);
      setError("");
      setForm(null);
      setFormLoading(true);
      setFormError("");
      setFormMessage("");
    });

    void getRecruit(recruitId)
      .then((data) => {
        if (!active) return;
        recruitRef.current = data;
        setItem(data);
        const forms = formsRef.current;
        if (forms) {
          const linkedForm = data.formId
            ? forms.find((candidate) => candidate.id === data.formId) ?? null
            : findRecruitForm(data.companyName, forms);
          setForm(linkedForm);
        }
        document.title = `${data.companyName || "취업 공고"} | 잡담`;
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.");
        }
      });

    void studentFormApi.getAll()
      .then((forms) => {
        if (!active) return;
        formsRef.current = forms;
        const data = recruitRef.current;
        if (data) {
          const linkedForm = data.formId
            ? forms.find((candidate) => candidate.id === data.formId) ?? null
            : findRecruitForm(data.companyName, forms);
          setForm(linkedForm);
        }
        setFormLoading(false);
      })
      .catch((caught) => {
        if (!active) return;
        setFormError(caught instanceof Error ? caught.message : "신청 폼을 불러오지 못했습니다.");
        setFormLoading(false);
      });

    return () => {
      active = false;
    };
  }, [recruitId]);

  return {
    item,
    form,
    error,
    formLoading,
    formError,
    formMessage,
    showMissingForm: () => setFormMessage("해당 폼이 없습니다."),
  };
};
