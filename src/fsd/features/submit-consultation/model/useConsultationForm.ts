import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createReservationInput,
  getConsultationScheduleItem,
  toConsultationKind,
  validateConsultationDraft,
} from "@fsd/entities/consultation";
import type {
  CounselingCategory,
  ConsultationType,
} from "@fsd/entities/consultation";
import { ApiError } from "@fsd/shared/api";
import {
  getConsultationTeachers,
  submitConsultation,
} from "../api/consultation.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";
import { getConsultationTeacherLabel } from "./teacherOption.ts";
import { useConsultationAvailability } from "./useConsultationAvailability.ts";

export type ConsultationToast = {
  message: string;
  type: "error" | "success" | "info";
};

export type ConsultationErrorTarget =
  | "title"
  | "content"
  | "category"
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
  if (message === "상담 카테고리를 선택해주세요") return "category";
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

const isUnavailableSlotError = (error: ApiError) =>
  /예약한 시간|누군가 예약|이미 예약|잠긴 날짜|잠긴 시간/.test(error.message);

export const useConsultationForm = (initialType: ConsultationType) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitleState] = useState("");
  const [content, setContentState] = useState("");
  const [category, setCategory] = useState<CounselingCategory | null>(null);
  const [teachers, setTeachers] = useState<ConsultationTeacherOption[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<ConsultationTeacherStatus>("loading");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacherOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ConsultationToast | null>(null);
  const [errorTarget, setErrorTarget] = useState<ConsultationErrorTarget | null>(null);
  const toastTimer = useRef<number | null>(null);

  const {
    timetable,
    selectedDate,
    selectedTime,
    availabilityStatus,
    availabilityError,
    retryAvailability,
    dates,
    toggleDate: toggleAvailabilityDate,
    toggleTime: toggleAvailabilityTime,
    isTimeUnavailable,
    clearPeriodSelection,
    markUnavailableSlot,
    reset: resetAvailability,
  } = useConsultationAvailability({ counselType, selectedTeacher });

  useEffect(() => {
    let active = true;
    void getConsultationTeachers(toConsultationKind(counselType))
      .then((items) => {
        if (!active) return;
        setTeachers(items);
        setSelectedTeacher((current) =>
          current !== null && items.some((item) => item.id === current.id)
            ? current
            : null,
        );
        setTeacherStatus("ready");
      })
      .catch(() => {
        if (active) setTeacherStatus("error");
      });

    return () => {
      active = false;
    };
  }, [counselType]);

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

  const selectCategory = (value: CounselingCategory) => {
    setCategory(value);
    if (errorTarget === "category") setErrorTarget(null);
  };

  const handleTabChange = (type: ConsultationType) => {
    setCounselType(type);
    setTeachers([]);
    setTeacherStatus("loading");
    setSelectedTeacher(null);
    clearPeriodSelection();
    setErrorTarget(null);
    setCategory(null);
  };

  const toggleTeacher = (teacher: ConsultationTeacherOption) => {
    const isSelected = selectedTeacher?.id === teacher.id;
    setSelectedTeacher(isSelected ? null : teacher);
    clearPeriodSelection();
    if (errorTarget === "teacher") setErrorTarget(null);
  };

  const toggleDate = (date: string) => {
    toggleAvailabilityDate(date);
    if (errorTarget === "date") setErrorTarget(null);
  };

  const toggleTime = (time: string) => {
    if (!toggleAvailabilityTime(time)) return;
    const scheduleItem = getConsultationScheduleItem(time);
    if (
      counselType === "career" &&
      scheduleItem !== null &&
      scheduleItem.startHour !== 12 &&
      scheduleItem.startHour !== 17
    ) {
      if (selectedTime !== time) {
        showToast("수업 결손을 줄이기 위해 공강시간을 우선 선택해 주세요.", "info");
      }
    }
    if (errorTarget === "period") setErrorTarget(null);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    resetAvailability();
    setErrorTarget(null);
    router.push("/");
  };

  const getValidationMessage = () => {
    if (!title.trim()) return "제목을 입력해주세요";
    if (!content.trim()) return "내용을 입력해주세요";
    if (!category) return "상담 카테고리를 선택해주세요";
    if (!selectedTeacher) return "선생님을 선택해주세요";
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

    if (!category) return;
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
      });
      try {
        window.sessionStorage.setItem(
          "jobdam:consultation-toast",
          JSON.stringify({ message: "상담 신청 요청을 보냈습니다", type: "success", expiresAt: Date.now() + 2500 }),
        );
      } catch {
        // Toast persistence failure must not turn a successful reservation into an error.
      }
      showToast("상담 신청 요청을 보냈습니다", "success");
      window.setTimeout(() => router.push("/"), 700);
    } catch (error) {
      if (
        error instanceof ApiError &&
        isUnavailableSlotError(error) &&
        selectedDate &&
        selectedTime
      ) {
        markUnavailableSlot(teacherId, selectedDate, selectedTime);
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
    teachers,
    timetable,
    teacherStatus,
    selectedTeacher,
    selectedDate,
    selectedTime,
    availabilityStatus,
    availabilityError,
    retryAvailability,
    submitting,
    toast,
    errorTarget,
    dates,
    setTitle,
    setContent,
    selectCategory,
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    isTimeUnavailable,
    handleCancel,
    handleSubmit,
  };
};
