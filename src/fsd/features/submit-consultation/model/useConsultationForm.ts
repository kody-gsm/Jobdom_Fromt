import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createReservationInput,
  getAvailablePeriods,
  getNextWeekdays,
  toConsultationKind,
  validateConsultationDraft,
} from "@fsd/entities/consultation";
import type {
  ConsultationTeacher,
  ConsultationType,
} from "@fsd/entities/consultation";
import { ApiError } from "@fsd/shared/api";
import {
  getUpcomingConsultations,
  submitConsultation,
} from "../api/consultation.ts";

export type ConsultationToast = {
  message: string;
  type: "error" | "success";
};

export type ConsultationErrorTarget =
  | "title"
  | "content"
  | "teacher"
  | "date"
  | "period";

const getConsultationErrorTarget = (
  message: string,
): ConsultationErrorTarget | null => {
  if (message === "제목을 입력해주세요") return "title";
  if (message === "내용을 입력해주세요") return "content";
  if (message === "선생님을 선택해주세요") return "teacher";
  if (message === "날짜를 선택해주세요") return "date";
  if (message === "교시를 선택해주세요") return "period";
  return null;
};

const focusConsultationError = (target: ConsultationErrorTarget) => {
  window.requestAnimationFrame(() => {
    const container = document.querySelector<HTMLElement>(
      `[data-consultation-field="${target}"]`,
    );
    container?.scrollIntoView({ behavior: "smooth", block: "center" });

    const focusTarget = container?.matches("input, textarea, button")
      ? container
      : container?.querySelector<HTMLElement>(
          "input, textarea, button:not(:disabled)",
        );
    focusTarget?.focus();
  });
};

export const useConsultationForm = (initialType: ConsultationType) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitleState] = useState("");
  const [content, setContentState] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hasCareerReservation, setHasCareerReservation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ConsultationToast | null>(null);
  const [errorTarget, setErrorTarget] = useState<ConsultationErrorTarget | null>(null);
  const toastTimer = useRef<number | null>(null);

  const dates = useMemo(() => getNextWeekdays(), []);
  const times = getAvailablePeriods(counselType, selectedTeacher);

  useEffect(() => {
    let active = true;
    void getUpcomingConsultations("course")
      .then((items) => {
        if (active) setHasCareerReservation(items.length > 0);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string, type: ConsultationToast["type"] = "error") => {
    setToast({ message, type });
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  };

  const setTitle = (value: string) => {
    setTitleState(value);
    if (errorTarget === "title") setErrorTarget(null);
  };

  const setContent = (value: string) => {
    setContentState(value);
    if (errorTarget === "content") setErrorTarget(null);
  };

  const handleTabChange = (type: ConsultationType) => {
    setCounselType(type);
    setSelectedTeacher(null);
    setSelectedTime(null);
    setErrorTarget(null);
  };

  const toggleTeacher = (teacher: ConsultationTeacher) => {
    setSelectedTeacher((current) => current === teacher ? null : teacher);
    setSelectedTime(null);
    if (errorTarget === "teacher") setErrorTarget(null);
  };

  const toggleDate = (date: string) => {
    setSelectedDate((current) => current === date ? null : date);
    if (errorTarget === "date") setErrorTarget(null);
  };

  const toggleTime = (time: string) => {
    setSelectedTime((current) => current === time ? null : time);
    if (errorTarget === "period") setErrorTarget(null);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setErrorTarget(null);
    router.push("/");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draft = {
      type: counselType,
      title,
      content,
      teacher: selectedTeacher,
      date: selectedDate,
      period: selectedTime,
    };
    const validationMessage = validateConsultationDraft(draft, hasCareerReservation);

    if (validationMessage) {
      const target = getConsultationErrorTarget(validationMessage);
      setErrorTarget(target);
      showToast(validationMessage);
      if (target) focusConsultationError(target);
      return;
    }

    setErrorTarget(null);
    try {
      setSubmitting(true);
      await submitConsultation(
        toConsultationKind(counselType),
        createReservationInput(draft),
      );
      if (counselType === "career") setHasCareerReservation(true);
      showToast("상담 신청이 완료되었습니다", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "상담 신청에 실패했습니다",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    counselType,
    title,
    content,
    selectedTeacher,
    selectedDate,
    selectedTime,
    submitting,
    toast,
    errorTarget,
    dates,
    times,
    setTitle,
    setContent,
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    handleCancel,
    handleSubmit,
  };
};
