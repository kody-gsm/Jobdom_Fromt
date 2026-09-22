"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TeacherHeader } from "@fsd/widgets/teacher-header";
import type { ConsultationKind, TeacherReservation } from "@fsd/entities/consultation";
import type { UserRole } from "@fsd/entities/user";
import { readHomeBanner, saveHomeBanner } from "@fsd/entities/banner";
import { approveConsultation, forceCreateConsultation, getSession, getTeacherConsultations, getPendingTeacherConsultations, getTeacherSlotStatus, getTeacherStudents, lockConsultation, rejectConsultation, unlockConsultation } from "../api/teacher";
import type { SimpleStudent } from "../api/teacher";
import { dateKey, formatPeriod, getWeek, reservationSlot, WEEKLY_CLASS_SCHEDULE } from "../model/calendar";
import {
    canManageHomeBanner,
    getTeacherConsultationKinds,
    getTeacherAvailablePeriods,
    getTeacherWorkspaceVariant,
} from "../model/workspace";

type SelectedRequest = { reservation: TeacherReservation; approved: boolean };
const WEEKDAYS = ["월", "화", "수", "목", "금"];

export function TeacherPage() {
    const [teacherName, setTeacherName] = useState("선생님");
    const [teacherRole, setTeacherRole] = useState<UserRole | null>(null);
    const [today, setToday] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [kind, setKind] = useState<ConsultationKind>("course");
    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [pending, setPending] = useState<TeacherReservation[]>([]);
    const [approved, setApproved] = useState<TeacherReservation[]>([]);
    const [lockedSlots, setLockedSlots] = useState<Set<string>>(() => new Set());
    const [isLockMode, setIsLockMode] = useState(false);
    const [isForceMode, setIsForceMode] = useState(false);
    const [forceSlotTarget, setForceSlotTarget] = useState<{ date: string; period: string } | null>(null);
    const [students, setStudents] = useState<SimpleStudent[]>([]);
    const [isStudentsLoading, setIsStudentsLoading] = useState(false);
    const [studentsLoadError, setStudentsLoadError] = useState<string | null>(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [isForceSubmitting, setIsForceSubmitting] = useState(false);
    const [submittingStudentId, setSubmittingStudentId] = useState<number | null>(null);
    const [forceSubmitError, setForceSubmitError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSlotLoading, setIsSlotLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [slotError, setSlotError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingSlot, setProcessingSlot] = useState<string | null>(null);
    const [selection, setSelection] = useState<SelectedRequest | null>(null);
    const [bannerMessage, setBannerMessage] = useState("");
    const [bannerStatus, setBannerStatus] = useState("");
    const dialog = useRef<HTMLDialogElement>(null);
    const forceDialog = useRef<HTMLDialogElement>(null);
    const requestVersion = useRef(0);
    const slotRequestVersion = useRef(0);

    const loadReservations = useCallback(async () => {
        const allowedKinds = getTeacherConsultationKinds(teacherRole);
        if (!allowedKinds.includes(kind)) {
            if (allowedKinds[0]) setKind(allowedKinds[0]);
            setApproved([]);
            setPending([]);
            setIsLoading(false);
            return;
        }
        const version = ++requestVersion.current;
        setIsLoading(true);
        setLoadError(null);
        try {
            const [confirmed, waiting] = await Promise.all([
                getTeacherConsultations(kind),
                getPendingTeacherConsultations(kind),
            ]);
            if (version !== requestVersion.current) return;
            setApproved(confirmed);
            setPending(waiting);
        } catch (error) {
            if (version !== requestVersion.current) return;
            setLoadError(error instanceof Error ? error.message : "상담 신청을 불러오지 못했습니다.");
        } finally {
            if (version === requestVersion.current) setIsLoading(false);
        }
    }, [kind, teacherRole]);

    useEffect(() => {
        queueMicrotask(() => {
            const session = getSession();
            const name = session?.name || "선생님";
            const role = session?.role ?? null;
            setTeacherId(session?.userId ?? null);
            setTeacherName(name);
            setTeacherRole(role);
            const [authorizedKind] = getTeacherConsultationKinds(role);
            if (authorizedKind) setKind(authorizedKind);
            if (canManageHomeBanner(name)) {
                setBannerMessage(readHomeBanner()?.message ?? "");
            }
        });
    }, []);

    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (active) void loadReservations();
        });
        return () => { active = false; requestVersion.current += 1; };
    }, [loadReservations]);

    useEffect(() => {
        const timer = window.setInterval(() => setToday(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (selection) dialog.current?.showModal();
        else dialog.current?.close();
    }, [selection]);

    useEffect(() => {
        if (forceSlotTarget) forceDialog.current?.showModal();
        else forceDialog.current?.close();
    }, [forceSlotTarget]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates = [
        ...Array<null>(new Date(year, month, 1).getDay()).fill(null),
        ...Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => new Date(year, month, index + 1)),
    ];
    const week = useMemo(() => getWeek(selectedDate), [selectedDate]);
    const teacherVariant = getTeacherWorkspaceVariant(teacherName);
    const periods = getTeacherAvailablePeriods(kind, teacherName);
    const teacherKinds = getTeacherConsultationKinds(teacherRole);
    const canManageBanner = teacherName !== "선생님" && canManageHomeBanner(teacherName);
    const todayKey = dateKey(today);
    const upcomingPending = useMemo(() => pending.filter((item) => item.date >= todayKey), [pending, todayKey]);
    const upcomingApproved = useMemo(() => approved, [approved]);
    const loadSlotStatuses = useCallback(async () => {
        const allowedKinds = getTeacherConsultationKinds(teacherRole);
        if (teacherId === null || !allowedKinds.includes(kind)) {
            setLockedSlots(new Set());
            setIsSlotLoading(false);
            return;
        }
        const version = ++slotRequestVersion.current;
        setIsSlotLoading(true);
        setSlotError(null);
        const results = await Promise.allSettled(
            week.map((date) => getTeacherSlotStatus(kind, teacherId, dateKey(date))),
        );
        if (version !== slotRequestVersion.current) return;
        const successful = results.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getTeacherSlotStatus>>> => result.status === "fulfilled");
        const slots = successful.flatMap((result) => result.value);
        setLockedSlots(new Set(slots.filter((slot) => slot.state === "LOCKED").map((slot) => reservationSlot(slot))));
        if (successful.length === 0) setSlotError("시간 금지 상태를 불러오지 못했습니다.");
        else if (successful.length < results.length) setSlotError("일부 날짜의 시간 금지 상태를 불러오지 못했습니다.");
        setIsSlotLoading(false);
    }, [kind, teacherId, teacherRole, week]);

    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (!active) return;
            setLockedSlots(new Set());
            void loadSlotStatuses();
        });
        return () => {
            active = false;
            slotRequestVersion.current += 1;
        };
    }, [loadSlotStatuses]);
    const changeMonth = (direction: number) => {
        const next = new Date(year, month + direction, 1);
        setCurrentDate(next);
        setSelectedDate(
            next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth()
                ? new Date(today)
                : next,
        );
    };
    const openReservation = (reservation: TeacherReservation, isApproved: boolean) => {
        setActionError(null);
        setSelection({ reservation, approved: isApproved });
    };
    const handleApprove = async () => {
        if (!selection || selection.approved || isProcessing) return;
        setIsProcessing(true);
        setActionError(null);
        try {
            await approveConsultation(kind, selection.reservation.reservation_id);
            setSelection({ ...selection, approved: true });
            setPending((items) => items.filter((item) => item.reservation_id !== selection.reservation.reservation_id));
            setApproved((items) => [...items, selection.reservation]);
            await loadReservations();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "상담을 수락하지 못했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };
    const handleReject = async () => {
        if (!selection || selection.approved || isProcessing) return;
        if (!window.confirm("이 상담 신청을 취소할까요?")) return;
        setIsProcessing(true);
        setActionError(null);
        try {
            await rejectConsultation(kind, selection.reservation.reservation_id);
            setPending((items) => items.filter((item) => item.reservation_id !== selection.reservation.reservation_id));
            dialog.current?.close();
            await loadReservations();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "상담 신청을 취소하지 못했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };
    const handleSlotToggle = async (date: string, period: string) => {
        if (teacherId === null || processingSlot) return;
        if (date < todayKey) return;
        const slot = `${date}_${period}`;
        const isLocked = lockedSlots.has(slot);
        const reservations = [...upcomingApproved, ...upcomingPending].filter((item) => reservationSlot(item) === slot);
        if (!isLocked && reservations.length > 0 && !window.confirm("이 시간의 신청을 거절하고 학생에게 알림을 보낸 뒤 예약 금지할까요?")) return;

        setProcessingSlot(slot);
        setSlotError(null);
        try {
            const input = { date, period };
            if (isLocked) await unlockConsultation(kind, input);
            else {
                await Promise.all(reservations.map((item) => rejectConsultation(kind, item.reservation_id)));
                await lockConsultation(kind, input);
            }
            setLockedSlots((current) => {
                const next = new Set(current);
                if (isLocked) next.delete(slot);
                else next.add(slot);
                return next;
            });
            if (!isLocked) {
                setApproved((items) => items.filter((item) => reservationSlot(item) !== slot));
                setPending((items) => items.filter((item) => reservationSlot(item) !== slot));
            }
            await loadReservations();
            await loadSlotStatuses();
        } catch (error) {
            setSlotError(error instanceof Error ? error.message : "시간 금지 상태를 변경하지 못했습니다.");
        } finally {
            setProcessingSlot(null);
        }
    };
    const handleBannerSave = () => {
        const message = bannerMessage.trim();
        if (!canManageBanner || !message) {
            setBannerStatus("배너 문구를 입력해 주세요.");
            return;
        }
        saveHomeBanner({ message, updatedBy: teacherName.replace(/ 선생님$/, "") });
        setBannerMessage(message);
        setBannerStatus("학생 홈 배너를 저장했습니다.");
    };

    const loadStudents = useCallback(async () => {
        setIsStudentsLoading(true);
        setStudentsLoadError(null);
        try {
            const list = await getTeacherStudents();
            setStudents(list);
        } catch (error) {
            setStudentsLoadError(error instanceof Error ? error.message : "학생 목록을 불러오지 못했습니다.");
        } finally {
            setIsStudentsLoading(false);
        }
    }, []);

    const filteredStudents = useMemo(() => {
        const query = studentSearchQuery.trim().toLowerCase();
        if (!query) return students;
        return students.filter(
            (s) =>
                (s.name && s.name.toLowerCase().includes(query)) ||
                (s.student_number && s.student_number.toLowerCase().includes(query))
        );
    }, [students, studentSearchQuery]);

    const handleSlotModeAction = (date: string, period: string, isLocked: boolean, isPast: boolean) => {
        if (isPast) return true;
        if (isLockMode) {
            void handleSlotToggle(date, period);
            return true;
        }
        if (!isForceMode) return false;
        if (isLocked) {
            alert("예약 금지된 시간입니다. 먼저 잠금을 해제해 주세요.");
            return true;
        }
        setForceSlotTarget({ date, period });
        setStudentSearchQuery("");
        setForceSubmitError(null);
        void loadStudents();
        forceDialog.current?.showModal();
        return true;
    };

    const handleReservationClick = (
        reservation: TeacherReservation,
        isApproved: boolean,
        date: string,
        period: string,
        isLocked: boolean,
        isPast: boolean,
    ) => {
        if (handleSlotModeAction(date, period, isLocked, isPast)) return;
        openReservation(reservation, isApproved);
    };

    const handleForceCreate = async (student: SimpleStudent) => {
        if (!forceSlotTarget || isForceSubmitting) return;
        setIsForceSubmitting(true);
        setSubmittingStudentId(student.id);
        setForceSubmitError(null);
        try {
            const category = kind === "course" ? "취업" : "기타";
            await forceCreateConsultation(kind, {
                studentId: student.id,
                title: "선생님 배정 상담",
                content: `${teacherName.replace(/ 선생님$/, "")} 선생님이 직접 등록한 상담입니다.`,
                category,
                date: forceSlotTarget.date,
                period: forceSlotTarget.period,
            });
            forceDialog.current?.close();
            setForceSlotTarget(null);
            await loadReservations();
        } catch (error) {
            setForceSubmitError(error instanceof Error ? error.message : "상담 신청을 등록하지 못했습니다.");
        } finally {
            setIsForceSubmitting(false);
            setSubmittingStudentId(null);
        }
    };

    return (
        <>
        <TeacherHeader />
        <div className="min-h-[calc(100vh-5rem)] bg-white text-ink lg:flex">
            <aside className="shrink-0 p-7 lg:w-[380px]">
                <div>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-bold">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
                        <div className="flex gap-2">
                            <button aria-label="이전 달" onClick={() => changeMonth(-1)} className="p-2"><FiChevronLeft /></button>
                            <button aria-label="다음 달" onClick={() => changeMonth(1)} className="p-2"><FiChevronRight /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-3 text-center">
                        {["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day} className="py-2 text-sm text-muted">{day}</span>)}
                        {dates.map((date, index) => {
                            if (!date) return <span key={`blank-${index}`} />;
                            const isToday = dateKey(date) === dateKey(today);
                            const isSelected = dateKey(date) === dateKey(selectedDate);
                            const hasReservation = upcomingPending.some((item) => item.date === dateKey(date))
                                || upcomingApproved.some((item) => item.date === dateKey(date));
                            return (
                                <button key={dateKey(date)} onClick={() => setSelectedDate(date)}
                                    aria-label={dateKey(date)} aria-current={isToday ? "date" : undefined} aria-pressed={isSelected}
                                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-md text-sm ${isToday ? "bg-brand text-white" : hasReservation ? "bg-brand-soft text-brand-accent" : "hover:bg-brand-soft"} ${isSelected ? "outline-2 outline-offset-2 outline-ink" : ""}`}>
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-5 text-xs text-secondary-text">초록색: 오늘 · 사각 테두리: 선택한 날짜</p>
                </div>
                {canManageBanner ? (
                    <section aria-labelledby="banner-title" className="mt-6 border-t border-border pt-5">
                        <h2 id="banner-title" className="font-bold">학생 홈 배너</h2>
                        <p className="mt-1 text-xs leading-5 text-secondary-text">일반 교사만 학생 대시보드의 안내 문구를 등록할 수 있습니다.</p>
                        <textarea
                            value={bannerMessage}
                            maxLength={160}
                            onChange={(event) => {
                                setBannerMessage(event.target.value);
                                setBannerStatus("");
                            }}
                            placeholder="학생에게 안내할 내용을 입력하세요."
                            className="mt-3 min-h-24 w-full resize-none rounded-xl border border-border p-3 text-sm outline-none focus:border-brand"
                        />
                        <button type="button" onClick={handleBannerSave} className="mt-2 min-h-11 w-full rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-hover">
                            배너 저장
                        </button>
                        {bannerStatus ? <p role="status" className="mt-2 text-xs font-semibold text-brand-accent">{bannerStatus}</p> : null}
                    </section>
                ) : null}
                <div className="my-6 space-y-3 border-t border-border pt-5 text-sm">
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-yellow-400" />수업</p>
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-brand" />상담 확정</p>
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full border border-brand bg-brand-soft" />상담 대기</p>
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-gray-400" />예약 금지</p>
                </div>
                <section aria-labelledby="pending-title" className="border-t border-border pt-5">
                    <h2 id="pending-title" className="mb-3 font-bold">상담 예약 요청 목록 <span className="text-brand-accent">{upcomingPending.length}</span></h2>
                    {!isLoading && !loadError && upcomingPending.length === 0 && <p className="text-sm text-secondary-text">대기 중인 예약이 없습니다.</p>}
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {upcomingPending.map((item) => (
                            <button key={item.reservation_id} onClick={() => openReservation(item, false)} className="w-full rounded-xl border border-border p-3 text-left hover:bg-brand-soft">
                                <span className="block font-semibold">{item.name}</span>
                                <span className="block text-xs text-secondary-text">{item.date} · {formatPeriod(item.period)}</span>
                                <span className="text-sm text-brand-accent">신청 정보 보기 · 수락/취소</span>
                            </button>
                        ))}
                    </div>
                </section>
            </aside>
            <main className="min-w-0 flex-1 bg-panel">
                <div className="border-b border-border bg-white px-8 py-5">
                    <div>
                        <h1 className="text-2xl font-bold">{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</h1>
                        <p className="mt-1 text-sm text-secondary-text">{teacherName.replace(/ 선생님$/, "")} 선생님</p>
                    </div>
                </div>
                <div className="flex gap-2 px-6 pt-5" aria-label="상담 종류">
                    {teacherKinds.map((value) => (
                        <button key={value} aria-pressed={kind === value} onClick={() => {
                             if (kind === value) return;
                             requestVersion.current += 1;
                             setKind(value); setPending([]); setApproved([]); setSelection(null); setIsLockMode(false); setIsForceMode(false);
                         }} className={`rounded-lg px-4 py-2 font-semibold ${kind === value ? "bg-brand text-white" : "bg-white text-secondary-text"}`}>
                             {value === "course" ? "진로 상담" : "일반 상담"}
                         </button>
                     ))}
                    <button type="button" aria-pressed={isLockMode} onClick={() => { setIsLockMode((current) => !current); setIsForceMode(false); }} className={`rounded-lg border px-4 py-2 font-semibold ${isLockMode ? "border-red-500 bg-red-50 text-red-600" : "border-border bg-white text-secondary-text"}`}>
                        {isLockMode ? "시간 금지 모드 끄기" : "시간 금지 모드"}
                    </button>
                    <button type="button" aria-pressed={isForceMode} onClick={() => { setIsForceMode((current) => !current); setIsLockMode(false); }} className={`rounded-lg border px-4 py-2 font-semibold ${isForceMode ? "border-blue-500 bg-blue-50 text-blue-600" : "border-border bg-white text-secondary-text"}`}>
                        {isForceMode ? "강제 추가 모드 끄기" : "강제 추가 모드"}
                    </button>
                 </div>
                {isLockMode && <p role="status" className="px-6 pt-3 text-sm font-semibold text-red-600">시간 금지 모드입니다. 금지할 셀을 클릭하세요. 금지된 셀을 클릭하면 해제됩니다. 변경 사항은 현재 선생님 계정에 즉시 저장됩니다.</p>}
                {isForceMode && <p role="status" className="px-6 pt-3 text-sm font-semibold text-blue-600">강제 추가 모드입니다. 상담을 추가할 셀을 클릭하세요. 학생을 검색하여 즉시 상담을 예약할 수 있습니다.</p>}
                {isLoading && <p role="status" className="px-6 pt-3 text-sm">상담 신청을 불러오는 중...</p>}
                {loadError && <div role="alert" className="px-6 pt-3 text-sm text-red-600">{loadError}<button onClick={() => void loadReservations()} className="ml-3 underline">다시 불러오기</button></div>}
                {slotError && <div role="alert" className="px-6 pt-3 text-sm text-red-600">{slotError}<button onClick={() => void loadSlotStatuses()} className="ml-3 underline">다시 불러오기</button></div>}
                {isSlotLoading && <p role="status" className="px-6 pt-3 text-sm text-secondary-text">시간 금지 상태를 불러오는 중...</p>}
                <div className="overflow-x-auto p-6">
                    <table className="w-full min-w-[720px] table-fixed border-collapse bg-white text-center">
                        <thead><tr>
                            <th className="w-24 border border-border p-3">교시</th>
                            {week.map((date, index) => {
                                const isPast = dateKey(date) < todayKey;
                                return <th key={dateKey(date)} className={`border border-border p-3 ${isPast ? "bg-gray-300 text-gray-500" : dateKey(date) === dateKey(selectedDate) ? "bg-brand-soft" : ""}`}><span className="block text-xs text-secondary-text">{WEEKDAYS[index]}</span><span className="text-2xl">{date.getDate()}</span></th>;
                            })}
                        </tr></thead>
                        <tbody>{periods.map((period) => <tr key={period}>
                            <th scope="row" className="border border-border p-2 text-sm">{period}</th>
                            {week.map((date, index) => {
                                const currentDate = dateKey(date);
                                const isPast = currentDate < todayKey;
                                const slot = `${currentDate}_${period}`;
                                const classItem = teacherVariant === "im-gyeongwon" ? WEEKLY_CLASS_SCHEDULE[WEEKDAYS[index]]?.[period] : undefined;
                                const confirmed = upcomingApproved.filter((item) => reservationSlot(item) === slot);
                                const waiting = isPast ? [] : upcomingPending.filter((item) => reservationSlot(item) === slot);
                                const isLocked = !isPast && lockedSlots.has(slot);
                                const isModeActive = !isPast && (isLockMode || isForceMode);
                                return <td key={slot}
                                    role={isModeActive ? "button" : undefined}
                                    tabIndex={isModeActive ? 0 : undefined}
                                    aria-label={isPast ? undefined : isLockMode ? `${currentDate} ${period} ${isLocked ? "예약 금지 해제" : "예약 금지"}` : isForceMode ? `${currentDate} ${period} 상담 강제 추가` : undefined}
                                    onClick={(event) => {
                                        if (isPast || (event.target instanceof Element && event.target.closest("button"))) return;
                                        handleSlotModeAction(currentDate, period, isLocked, isPast);
                                    }}
                                    onKeyDown={(event) => {
                                        if (isPast || (event.key !== "Enter" && event.key !== " ") || (event.target instanceof Element && event.target.closest("button"))) return;
                                        event.preventDefault();
                                        handleSlotModeAction(currentDate, period, isLocked, isPast);
                                    }}
                                    className={`h-20 border border-border p-0 align-top ${isPast ? "bg-gray-300" : isLocked ? "bg-gray-50" : ""} ${isLockMode && !isPast ? "cursor-pointer hover:ring-2 hover:ring-red-300 hover:ring-inset" : ""} ${isForceMode && !isPast ? "cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset" : ""}`}>
                                    <div className={`max-h-20 overflow-y-auto p-2 ${isModeActive ? "cursor-pointer" : ""}`}>
                                    {isLocked && <div className="rounded-xl bg-gray-200 p-2 text-sm font-semibold text-gray-600">예약 금지</div>}
                                    {classItem && <div className="rounded-xl bg-yellow-100 p-2 text-yellow-900"><span className="block font-semibold">{classItem.label}</span><span className="text-xs">{classItem.subtitle}</span></div>}
                                    {confirmed.map((item) => <button key={item.reservation_id} onClick={() => handleReservationClick(item, true, currentDate, period, isLocked, isPast)} className="mt-1 w-full rounded-xl bg-brand p-2 text-sm font-semibold text-white">{item.name} · 상담 확정</button>)}
                                    {waiting.map((item) => <button key={item.reservation_id} onClick={() => handleReservationClick(item, false, currentDate, period, isLocked, isPast)} className="mt-1 w-full rounded-xl border border-brand bg-brand-soft p-2 text-sm font-semibold text-brand-accent">{item.name} · 상담 대기</button>)}
                                    </div>
                                </td>;
                            })}
                        </tr>)}</tbody>
                    </table>
                </div>
            </main>
            <dialog ref={dialog} aria-labelledby="reservation-title" onCancel={(event) => { if (isProcessing) event.preventDefault(); }} onClose={() => setSelection(null)} className="fixed inset-0 m-auto max-h-[85vh] w-[450px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-6 backdrop:bg-black/30">
                {selection && <>
                    <h2 id="reservation-title" className="mb-5 text-xl font-bold">{selection.approved ? "예약 확정 정보" : "학생 상담 신청 정보"}</h2>
                    <dl className="space-y-3 text-sm">
                        <div><dt className="text-secondary-text">학생</dt><dd className="text-lg font-semibold">{selection.reservation.name}</dd></div>
                        <div><dt className="text-secondary-text">학번</dt><dd>{selection.reservation.student_number || "학번 정보 없음"}</dd></div>
                        <div><dt className="text-secondary-text">상담 일시</dt><dd>{selection.reservation.date} · {formatPeriod(selection.reservation.period)}</dd></div>
                        <div><dt className="text-secondary-text">제목</dt><dd>{selection.reservation.title || "제목 정보 없음"}</dd></div>
                        <div><dt className="text-secondary-text">신청 내용</dt><dd className="whitespace-pre-wrap break-words rounded-lg bg-panel p-3">{selection.reservation.content || "상담 내용 정보 없음"}</dd></div>
                    </dl>
                    {actionError && <p role="alert" className="mt-4 text-sm text-red-600">{actionError}</p>}
                    <div className="mt-6 flex gap-2">
                        <button disabled={isProcessing} onClick={() => dialog.current?.close()} className="flex-1 rounded-lg border border-border py-3">닫기</button>
                        {!selection.approved && <button disabled={isProcessing} onClick={() => void handleReject()} className="flex-1 rounded-lg border border-red-200 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">상담 신청 취소</button>}
                        {!selection.approved && <button disabled={isProcessing} onClick={() => void handleApprove()} className="flex-1 rounded-lg bg-brand py-3 font-semibold text-white hover:bg-brand-hover disabled:opacity-50">{isProcessing ? "처리 중..." : "상담 수락"}</button>}
                    </div>
                </>}
            </dialog>
            <dialog ref={forceDialog} aria-labelledby="force-dialog-title" onCancel={(event) => { if (isForceSubmitting) event.preventDefault(); }} onClose={() => setForceSlotTarget(null)} className="fixed inset-0 m-auto max-h-[85vh] w-[460px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-6 backdrop:bg-black/30">
                {forceSlotTarget && (
                    <div>
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h2 id="force-dialog-title" className="text-lg font-bold text-ink">상담 강제 추가</h2>
                                <p className="text-xs text-secondary-text">
                                    {forceSlotTarget.date} · {formatPeriod(forceSlotTarget.period)} ({kind === "course" ? "진로 상담" : "일반 상담"})
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={isForceSubmitting}
                                onClick={() => forceDialog.current?.close()}
                                className="text-sm p-1 text-secondary-text hover:text-ink"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={studentSearchQuery}
                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                placeholder="학생 이름 또는 학번 검색..."
                                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
                                autoFocus
                            />
                        </div>

                        {isStudentsLoading && (
                            <p role="status" className="py-8 text-center text-sm text-secondary-text">
                                학생 목록을 불러오는 중...
                            </p>
                        )}

                        {studentsLoadError && (
                            <div role="alert" className="py-4 text-center text-sm text-red-600">
                                {studentsLoadError}
                                <button
                                    type="button"
                                    onClick={() => void loadStudents()}
                                    className="ml-2 font-semibold underline"
                                >
                                    다시 불러오기
                                </button>
                            </div>
                        )}

                        {!isStudentsLoading && !studentsLoadError && (
                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                {filteredStudents.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-secondary-text">
                                        {studentSearchQuery ? "일치하는 학생이 없습니다." : "등록된 학생이 없습니다."}
                                    </p>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between rounded-xl border border-border p-3 transition hover:bg-brand-soft"
                                        >
                                            <div>
                                                <span className="font-semibold text-ink">{student.name}</span>
                                                <span className="ml-2 rounded bg-panel px-2 py-0.5 text-xs text-secondary-text">
                                                    {student.student_number || "학번 없음"}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isForceSubmitting}
                                                onClick={() => void handleForceCreate(student)}
                                                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-hover disabled:opacity-50"
                                            >
                                                {isForceSubmitting && submittingStudentId === student.id ? "추가 중..." : "추가"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {forceSubmitError && (
                            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
                                {forceSubmitError}
                            </p>
                        )}

                        <div className="mt-5 border-t border-border pt-4 text-right">
                            <button
                                type="button"
                                disabled={isForceSubmitting}
                                onClick={() => forceDialog.current?.close()}
                                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-secondary-text hover:bg-panel"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </dialog>
        </div>
        </>
    );
}
