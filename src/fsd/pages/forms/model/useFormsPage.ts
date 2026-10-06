import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import { formsApi } from "../api/forms.ts";
import {
  filterForms,
  type FormListFilter,
  type StudentFormSummary,
} from "./formFilters.ts";

const loadSubmissionState = async (form: StudentFormSummary): Promise<StudentFormSummary> => {
  try {
    await formsApi.getMySubmission(form.id);
    return { ...form, submitted: true };
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) {
      return { ...form, submitted: false };
    }
    return form;
  }
};

export const useFormsPage = () => {
  const [forms, setForms] = useState<StudentFormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FormListFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
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
      .then(async (result) => {
        if (!mounted.current || !requests.current.isLatest(requestVersion)) return;
        setForms(result);
        const formsWithSubmissionState = await Promise.all(result.map(loadSubmissionState));
        if (!mounted.current || !requests.current.isLatest(requestVersion)) return;
        setForms(formsWithSubmissionState);
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

  const visibleForms = useMemo(
    () => filterForms(forms, filter, searchQuery),
    [filter, forms, searchQuery],
  );

  return {
    forms,
    loading,
    error,
    retry: () => loadForms(),
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    visibleForms,
  };
};
