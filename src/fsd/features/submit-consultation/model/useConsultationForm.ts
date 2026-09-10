import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createReservationInput,
  getNextWeekdays,
  toConsultationKind,
  validateConsultationDraft,
} from "@fsd/entities/consultation";
import type { ConsultationType } from "@fsd/entities/consultation";
import { ApiError } from "@fsd/shared/api";
import {
  getConsultationSlotStatus,
  getConsultationTeachers,
  submitConsultation,
} from "../api/consultation.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";
import { getConsultationTeacherLabel } from "./teacherOption.ts";

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

const MAX_CONSULTATION_CONTENT_LENGTH = 500;

export type ConsultationTeacherStatus = "loading" | "ready" | "error";

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

const getSlotKey = (teacherId: number, date: string, period: string) =>
  `${teacherId}:${date}:${period}`;

const isUnavailableSlotError = (error: ApiError) =>
  error.status === 409 || /예약한 시간|누군가 예약|잠긴 날짜|잠긴 시간/.test(error.message);

export const useConsultationForm = (initialType: ConsultationType) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitleState] = useState("");
  const [content, setContentState] = useState("");
  const [category, setCategory] = useState("학업");
  const [otherCategory, setOtherCategory] = useState("");
  const [teachers, setTeachers] = useState<ConsultationTeacherOption[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<ConsultationTeacherStatus>("loading");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacherOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return today.getDay() === 0 || today.getDay() === 6
      ? null
      : getNextWeekdays(today, 1)[0]?.value ?? null;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [serverUnavailablePeriods, setServerUnavailablePeriods] = useState<Set<string>>(
    () => new Set(),
  );
  const [unavailableSlotKeys, setUnavailableSlotKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ConsultationToast | null>(null);
  const [errorTarget, setErrorTarget] = useState<ConsultationErrorTarget | null>(null);
  const toastTimer = useRef<number | null>(null);

  const dates = useMemo(() => getNextWeekdays(), []);

  useEffect(() => {
    let active = true;
    void getConsultationTeachers()
      .then((items) => {
        if (!active) return;
        setTeachers(items);
        setTeacherStatus("ready");
      })
      .catch(() => {
        if (active) setTeacherStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedTeacher === null || selectedDate === null) return;

    let active = true;
    void getConsultationSlotStatus(
      toConsultationKind(counselType),
      selectedTeacher.id,
      selectedDate,
    )
      .then((items) => {
        if (!active) return;
        const unavailable = new Set(
          items.filter((item) => !item.available).map((item) => item.period),
        );
        setServerUnavailablePeriods(unavailable);
        setSelectedTime((current) =>
          current !== null && unavailable.has(current) ? null : current,
        );
      })
      .catch(() => {
        if (active) setServerUnavailablePeriods(new Set());
      });

    return () => {
      active = false;
    };
  }, [counselType, selectedTeacher, selectedDate]);

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
    setContentState(value.slice(0, MAX_CONSULTATION_CONTENT_LENGTH));
    if (errorTarget === "content") setErrorTarget(null);
  };

  const handleTabChange = (type: ConsultationType) => {
    setCounselType(type);
    setSelectedTeacher(null);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
    setErrorTarget(null);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (value !== "기타") setOtherCategory("");
  };

  const toggleTeacher = (teacher: ConsultationTeacherOption) => {
    const isSelected = selectedTeacher?.id === teacher.id;
    setSelectedTeacher(isSelected ? null : teacher);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
    if (errorTarget === "teacher") setErrorTarget(null);
  };

  const toggleDate = (date: string) => {
    setSelectedDate((current) => current === date ? null : date);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
    if (errorTarget === "date") setErrorTarget(null);
  };

  const isTimeUnavailable = (time: string) =>
    (counselType === "general" && time === "4교시") ||
    serverUnavailablePeriods.has(time) ||
    (selectedTeacher !== null &&
      selectedDate !== null &&
      unavailableSlotKeys.has(getSlotKey(selectedTeacher.id, selectedDate, time)));

  const toggleTime = (time: string) => {
    if (isTimeUnavailable(time)) return;
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

  const getValidationMessage = () => {
    if (!selectedTeacher) return "선생님을 선택해주세요";
    if (!title.trim()) return "제목을 입력해주세요";
    if (!content.trim()) return "내용을 입력해주세요";
    if (category === "기타" && !otherCategory.trim()) {
      return "기타 상담 내용을 입력해주세요";
    }

    return validateConsultationDraft({
      type: counselType,
      title,
      content,
      teacher: getConsultationTeacherLabel(selectedTeacher.name),
      date: selectedDate,
      period: selectedTime,
    }, false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = getValidationMessage();
    if (validationMessage) {
      const target = getConsultationErrorTarget(validationMessage);
      setErrorTarget(target);
      showToast(validationMessage);
      if (target) focusConsultationError(target);
      return;
    }

    if (!selectedTeacher) return;
    const teacherId = selectedTeacher.id;

    const draft = {
      type: counselType,
      title,
      content,
      teacher: getConsultationTeacherLabel(selectedTeacher.name),
      date: selectedDate,
      period: selectedTime,
    };

    setErrorTarget(null);
    try {
      setSubmitting(true);
      await submitConsultation(toConsultationKind(counselType), {
        ...createReservationInput(draft),
        teacherId: teacherId,
        category,
        ...(category === "기타" ? { otherCategory: otherCategory.trim() } : {}),
      });
      showToast("상담 신청 요청을 보냈습니다", "success");
    } catch (error) {
      if (
        error instanceof ApiError &&
        isUnavailableSlotError(error) &&
        selectedDate &&
        selectedTime
      ) {
        const key = getSlotKey(teacherId, selectedDate, selectedTime);
        setUnavailableSlotKeys((current) => new Set(current).add(key));
        setSelectedTime(null);
        setErrorTarget("period");
        focusConsultationError("period");
      }
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
    category,
    otherCategory,
    teachers,
    teacherStatus,
    selectedTeacher,
    selectedDate,
    selectedTime,
    submitting,
    toast,
    errorTarget,
    dates,
    setTitle,
    setContent,
    setCategory: handleCategoryChange,
    setOtherCategory,
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    isTimeUnavailable,
    handleCancel,
    handleSubmit,
  };
};
