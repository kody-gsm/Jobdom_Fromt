import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createReservationInput,
  getNextAvailableDate,
  getNextWeekdays,
  getSelectableConsultationDates,
  getSelectablePeriods,
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
  getConsultationSlotStatus,
  getStudentSchedules,
  getConsultationTeachers,
  getStudentTimetable,
  submitConsultation,
} from "../api/consultation.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";
import { getConsultationTeacherLabel } from "./teacherOption.ts";
import { getUnavailablePeriods } from "./slotAvailability.ts";
import type { StudentTimetableItem } from "./timetablePresentation.ts";

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

const getKoreaDate = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date());

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

const getSlotKey = (teacherId: number, date: string, period: string) =>
  `${teacherId}:${date}:${period}`;

const isUnavailableSlotError = (error: ApiError) =>
  /예약한 시간|누군가 예약|이미 예약|잠긴 날짜|잠긴 시간/.test(error.message);

export const useConsultationForm = (initialType: ConsultationType) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitleState] = useState("");
  const [content, setContentState] = useState("");
  const [category, setCategory] = useState<CounselingCategory | null>(null);
  const [teachers, setTeachers] = useState<ConsultationTeacherOption[]>([]);
  const [timetable, setTimetable] = useState<StudentTimetableItem[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<ConsultationTeacherStatus>("loading");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacherOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return getNextWeekdays(today, 1)[0]?.value ?? null;
  });
  const selectedDateRef = useRef(selectedDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [serverUnavailablePeriods, setServerUnavailablePeriods] = useState<Set<string>>(
    () => new Set(),
  );
  const [unavailableSlotKeys, setUnavailableSlotKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [holidayDates, setHolidayDates] = useState<Set<string>>(
    () => new Set(),
  );
  const [clock, setClock] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ConsultationToast | null>(null);
  const [errorTarget, setErrorTarget] = useState<ConsultationErrorTarget | null>(null);
  const toastTimer = useRef<number | null>(null);

  const updateSelectedDate = (nextDate: string | null) => {
    if (selectedDateRef.current !== nextDate) {
      selectedDateRef.current = nextDate;
      setSelectedTime(null);
      setServerUnavailablePeriods(new Set());
    }
    setSelectedDate(nextDate);
  };

  const candidateDates = useMemo(() => getNextWeekdays(), []);
  const dates = useMemo(
    () => getSelectableConsultationDates(candidateDates, clock, holidayDates),
    [candidateDates, clock, holidayDates],
  );

  useEffect(() => {
    const from = candidateDates[0]?.value;
    const to = candidateDates.at(-1)?.value;
    if (!from || !to) return;
    void getStudentTimetable(from, to).then(setTimetable).catch(() => setTimetable([]));
  }, [candidateDates]);

  useEffect(() => {
    const from = candidateDates[0]?.value;
    const to = candidateDates.at(-1)?.value;
    if (!from || !to) return;

    let active = true;
    void getStudentSchedules(from, to)
      .then((items) => {
        if (!active) return;
        const holidays = new Set(
          items.filter((item) => item.holiday).map((item) => item.date),
        );
        const currentNow = new Date();
        const selectableDates = getSelectableConsultationDates(
          candidateDates,
          currentNow,
          holidays,
        );
        setHolidayDates(holidays);
        setClock(currentNow);
        const currentDate = selectedDateRef.current;
        updateSelectedDate(
          currentDate !== null && selectableDates.some((item) => item.value === currentDate)
            ? currentDate
            : selectableDates[0]?.value ?? null,
        );
      })
      .catch(() => {
        // The reservation API remains the final authority when the schedule feed is unavailable.
      });

    return () => {
      active = false;
    };
  }, [candidateDates]);

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
        const unavailable = getUnavailablePeriods(items);
        setServerUnavailablePeriods(unavailable);
        setSelectedTime((current) =>
          current !== null && unavailable.has(current) ? null : current,
        );
      })
      .catch(() => {
        if (active) {
          setServerUnavailablePeriods(new Set());
        }
      });

    return () => {
      active = false;
    };
  }, [counselType, selectedTeacher, selectedDate]);

  useEffect(() => {
    const advanceAfterLastPeriod = () => {
      const currentNow = new Date();
      setClock(currentNow);
      const currentDate = selectedDateRef.current;
      if (currentDate !== null) {
        updateSelectedDate(getNextAvailableDate(currentDate, currentNow, holidayDates));
      }
    };
    const timer = window.setInterval(advanceAfterLastPeriod, 30_000);
    advanceAfterLastPeriod();
    return () => window.clearInterval(timer);
  }, [holidayDates]);

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
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
    setErrorTarget(null);
    setCategory(null);
  };

  const toggleTeacher = (teacher: ConsultationTeacherOption) => {
    const isSelected = selectedTeacher?.id === teacher.id;
    setSelectedTeacher(isSelected ? null : teacher);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
    if (errorTarget === "teacher") setErrorTarget(null);
  };

  const toggleDate = (date: string) => {
    updateSelectedDate(selectedDateRef.current === date ? null : date);
    if (errorTarget === "date") setErrorTarget(null);
  };

  const isTimeUnavailable = (time: string) =>
    (counselType === "general" && time === "4교시") ||
    (selectedDate === getKoreaDate() &&
      !getSelectablePeriods(counselType, selectedTeacher ? getConsultationTeacherLabel(selectedTeacher.name) : null).includes(time)) ||
    serverUnavailablePeriods.has(time) ||
    (selectedTeacher !== null &&
      selectedDate !== null &&
      unavailableSlotKeys.has(getSlotKey(selectedTeacher.id, selectedDate, time)));

  const toggleTime = (time: string) => {
    if (isTimeUnavailable(time)) return;
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
    setSelectedTime((current) => current === time ? null : time);
    if (errorTarget === "period") setErrorTarget(null);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    selectedDateRef.current = null;
    setSelectedDate(null);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
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
    teachers,
    timetable,
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
