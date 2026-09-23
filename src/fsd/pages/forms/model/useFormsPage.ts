import { useCallback, useEffect, useRef, useState } from "react";
import type { FormSummary } from "@fsd/entities/form";
import { ApiError } from "@fsd/shared/api";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import { formsApi } from "../api/forms.ts";

export const useFormsPage = () => {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requests = useRef(createRequestVersionGuard());
  const mounted = useRef(true);

  const loadForms = useCallback((resetState = true) => {
    const requestVersion = requests.current.next();
    if (resetState) {
      setLoading(true);
      setError("");
    }
    return formsApi
      .getAll()
      .then((result) => {
        if (!mounted.current || !requests.current.isLatest(requestVersion)) return;
        setForms(result);
      })
      .catch((caught) => {
        if (!mounted.current || !requests.current.isLatest(requestVersion)) return;
        setError(
          caught instanceof ApiError && caught.status === 401
            ? "로그인이 필요합니다."
            : caught instanceof Error
              ? caught.message
              : "폼을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (mounted.current && requests.current.isLatest(requestVersion)) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    const requestGuard = requests.current;
    queueMicrotask(() => void loadForms(false));
    return () => {
      mounted.current = false;
      requestGuard.next();
    };
  }, [loadForms]);

  return { forms, loading, error, retry: () => loadForms() };
};
