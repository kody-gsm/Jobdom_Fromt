import { useEffect, useState } from "react";
import type { FormSummary } from "@fsd/entities/form";
import { ApiError } from "@fsd/shared/api";
import { formsApi } from "../api/forms.ts";

export const useFormsPage = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    formsApi
      .getAll()
      .then(setForms)
      .catch((caught) =>
        setError(
          caught instanceof ApiError && caught.status === 401
            ? "로그인이 필요합니다."
            : caught instanceof Error
              ? caught.message
              : "폼을 불러오지 못했습니다.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return { forms, loading, error };
};
