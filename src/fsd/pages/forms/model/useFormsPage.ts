import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { createRequestVersionGuard, useDeadlineClock } from "@fsd/shared/lib";
import { formsApi } from "../api/forms.ts";
import {
  filterForms,
  type FormListFilter,
  type StudentFormSummary,
} from "./formFilters.ts";

const SUBMISSION_CHECK_CONCURRENCY = 4;

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

const loadMissingSubmissionStates = async (
  forms: StudentFormSummary[],
  isCurrent: () => boolean,
  onResult: (form: StudentFormSummary) => void,
) => {
  const missing = forms.filter((form) => typeof form.submitted !== "boolean");
  let index = 0;
  const worker = async () => {
    while (isCurrent() && index < missing.length) {
      const form = missing[index++];
      const updated = await loadSubmissionState(form);
      if (!isCurrent()) return;
      if (updated !== form) onResult(updated);
    }
  };
  await Promise.all(Array.from({ length: Math.min(SUBMISSION_CHECK_CONCURRENCY, missing.length) }, worker));
};

export const useFormsPage = () => {
  const [forms, setForms] = useState<StudentFormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FormListFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const requests = useRef(createRequestVersionGuard());
  const mounted = useRef(true);
  const now = useDeadlineClock(forms.map((form) => form.deadline));

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
        setLoading(false);
        const isCurrent = () => mounted.current && requests.current.isLatest(requestVersion);
        void loadMissingSubmissionStates(result, isCurrent, (updated) => {
          setForms((current) => isCurrent()
            ? current.map((form) => form.id === updated.id ? updated : form)
            : current);
        });
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
    let active = true;
    mounted.current = true;
    const requestGuard = requests.current;
    queueMicrotask(() => {
      if (active) void loadForms(false);
    });
    return () => {
      active = false;
      mounted.current = false;
      requestGuard.next();
    };
  }, [loadForms]);

  const visibleForms = useMemo(
    () => filterForms(forms, filter, searchQuery, now),
    [filter, forms, now, searchQuery],
  );

  return {
    forms,
    now,
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
