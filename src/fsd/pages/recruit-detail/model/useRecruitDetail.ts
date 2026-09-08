import { useEffect, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import type { FormSummary } from "@fsd/entities/form";
import { getRecruit } from "../api/recruit.ts";
import { getStudentForms } from "@fsd/entities/form";
import { findRecruitForm } from "./formMatching.ts";

export const useRecruitDetail = (recruitId: number) => {
  const [item, setItem] = useState<Recruit | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Pick<FormSummary, "id" | "title"> | null>(null);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    let active = true;

    void Promise.all([getRecruit(recruitId), getStudentForms()])
      .then(([data, forms]) => {
        if (!active) return;
        setItem(data);
        setForm(findRecruitForm(data.companyName, forms));
        document.title = `${data.companyName || "취업 공고"} | 잡담`;
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.");
        }
      });

    return () => {
      active = false;
    };
  }, [recruitId]);

  return { item, form, error, formMessage, showMissingForm: () => setFormMessage("해당 폼이 없습니다.") };
};
