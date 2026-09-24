import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNextAvailableDate,
  getNextWeekdays,
  getSelectableConsultationDates,
  getSelectablePeriods,
  toConsultationKind,
} from "@fsd/entities/consultation";
import type { ConsultationType } from "@fsd/entities/consultation";
import {
  getConsultationSlotStatus,
  getStudentSchedules,
  getStudentTimetable,
} from "../api/consultation.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";
import { getConsultationTeacherLabel } from "./teacherOption.ts";
import { getUnavailablePeriods } from "./slotAvailability.ts";
import type { StudentTimetableItem } from "./timetablePresentation.ts";

type UseConsultationAvailabilityInput = {
  counselType: ConsultationType;
  selectedTeacher: ConsultationTeacherOption | null;
};

const getKoreaDate = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date());

const getSlotKey = (teacherId: number, date: string, period: string) =>
  `${teacherId}:${date}:${period}`;

export const useConsultationAvailability = ({
  counselType,
  selectedTeacher,
}: UseConsultationAvailabilityInput) => {
  const [timetable, setTimetable] = useState<StudentTimetableItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const koreaToday = getKoreaDate();
    return getNextWeekdays(new Date(`${koreaToday}T00:00:00Z`), 1)[0]?.value ?? null;
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

  const koreaToday = getKoreaDate();
  const candidateDates = useMemo(
    () => getNextWeekdays(new Date(`${koreaToday}T00:00:00Z`)),
    [koreaToday],
  );
  const dates = useMemo(
    () => getSelectableConsultationDates(candidateDates, clock, holidayDates),
    [candidateDates, clock, holidayDates],
  );

  const updateSelectedDate = (nextDate: string | null) => {
    if (selectedDateRef.current !== nextDate) {
      selectedDateRef.current = nextDate;
      setSelectedTime(null);
      setServerUnavailablePeriods(new Set());
    }
    setSelectedDate(nextDate);
  };

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
        if (active) setServerUnavailablePeriods(new Set());
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
  }, [candidateDates, holidayDates]);

  const isTimeUnavailable = (time: string) =>
    (counselType === "general" && time === "4교시") ||
    (selectedDate === getKoreaDate() &&
      !getSelectablePeriods(
        counselType,
        selectedTeacher ? getConsultationTeacherLabel(selectedTeacher.name) : null,
      ).includes(time)) ||
    serverUnavailablePeriods.has(time) ||
    (selectedTeacher !== null &&
      selectedDate !== null &&
      unavailableSlotKeys.has(getSlotKey(selectedTeacher.id, selectedDate, time)));

  const toggleTime = (time: string) => {
    if (isTimeUnavailable(time)) return false;
    setSelectedTime((current) => current === time ? null : time);
    return true;
  };

  const clearPeriodSelection = () => {
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
  };

  const markUnavailableSlot = (teacherId: number, date: string, period: string) => {
    setUnavailableSlotKeys((current) => new Set(current).add(getSlotKey(teacherId, date, period)));
    setSelectedTime(null);
  };

  const reset = () => {
    selectedDateRef.current = null;
    setSelectedDate(null);
    setSelectedTime(null);
    setServerUnavailablePeriods(new Set());
  };

  return {
    timetable,
    selectedDate,
    selectedTime,
    dates,
    toggleDate: (date: string) =>
      updateSelectedDate(selectedDateRef.current === date ? null : date),
    toggleTime,
    isTimeUnavailable,
    clearPeriodSelection,
    markUnavailableSlot,
    reset,
  };
};
