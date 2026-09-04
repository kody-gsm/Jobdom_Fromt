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

export const useConsultationForm = (initialType: ConsultationType) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hasCareerReservation, setHasCareerReservation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ConsultationToast | null>(null);
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

  const handleTabChange = (type: ConsultationType) => {
    setCounselType(type);
    setSelectedTeacher(null);
    setSelectedTime(null);
  };

  const toggleTeacher = (teacher: ConsultationTeacher) => {
    setSelectedTeacher((current) => current === teacher ? null : teacher);
    setSelectedTime(null);
  };

  const toggleDate = (date: string) => {
    setSelectedDate((current) => current === date ? null : date);
  };

  const toggleTime = (time: string) => {
    setSelectedTime((current) => current === time ? null : time);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    setSelectedDate(null);
    setSelectedTime(null);
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
      showToast(validationMessage);
      return;
    }

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
