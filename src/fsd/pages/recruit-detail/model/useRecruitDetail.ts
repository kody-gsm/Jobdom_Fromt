import { useCallback, useEffect, useRef, useState } from "react";
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
  const formsRef = useRef<FormSummary[] | null>(null);
  const formRequestVersion = useRef(0);

  const loadForms = useCallback(() => {
    const version = formRequestVersion.current + 1;
    formRequestVersion.current = version;
    setFormLoading(true);
    setFormError("");
    setFormMessage("");

    void studentFormApi.getAll()
      .then((forms) => {
        if (formRequestVersion.current !== version) return;
        formsRef.current = forms;
        const data = recruitRef.current;
        if (data) setForm(findRecruitForm(data.formId ?? null, forms));
      })
      .catch((caught) => {
        if (formRequestVersion.current !== version) return;
        setForm(null);
        setFormError(caught instanceof Error ? caught.message : "연결된 신청 폼을 확인할 수 없습니다.");
      })
      .finally(() => {
        if (formRequestVersion.current === version) setFormLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      formRequestVersion.current += 1;
      recruitRef.current = null;
      formsRef.current = null;
      setItem(null);
      setError("");
      setForm(null);
      setFormLoading(true);
      setFormError("");
      setFormMessage("");

      void getRecruit(recruitId)
        .then((data) => {
          if (!active) return;
          recruitRef.current = data;
          if (formsRef.current) {
            setForm(findRecruitForm(data.formId ?? null, formsRef.current));
          }
          setItem(data);
          document.title = `${data.companyName || "취업 공고"} | 잡담`;
        })
        .catch((caught) => {
          if (active) setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.");
        });

      loadForms();
    });

    return () => {
      active = false;
      formRequestVersion.current += 1;
    };
  }, [loadForms, recruitId]);

  return {
    item,
    form,
    error,
    formLoading,
    formError,
    formMessage,
    retryForm: loadForms,
    showMissingForm: () => setFormMessage("연결된 신청 폼을 확인할 수 없습니다."),
  };
};
