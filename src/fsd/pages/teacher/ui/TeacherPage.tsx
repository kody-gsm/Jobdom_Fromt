"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TeacherHeader } from "@fsd/widgets/teacher-header";
import { CONSULTATION_SCHEDULE } from "@fsd/entities/consultation";
import type { ConsultationKind, TeacherReservation } from "@fsd/entities/consultation";
import { approveConsultation, getSession, getTeacherConsultations, getPendingTeacherConsultations } from "../api/teacher";
import { dateKey, formatPeriod, getWeek, reservationSlot, WEEKLY_CLASS_SCHEDULE } from "../model/calendar";

type SelectedRequest = { reservation: TeacherReservation; approved: boolean };
const WEEKDAYS = ["월", "화", "수", "목", "금"];

export function TeacherPage() {
    const [teacherName, setTeacherName] = useState("선생님");
    const [today, setToday] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [kind, setKind] = useState<ConsultationKind>("course");
    const [pending, setPending] = useState<TeacherReservation[]>([]);
    const [approved, setApproved] = useState<TeacherReservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [approvalError, setApprovalError] = useState<string | null>(null);
    const [isApproving, setIsApproving] = useState(false);
    const [selection, setSelection] = useState<SelectedRequest | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const requestVersion = useRef(0);

    const loadReservations = useCallback(async () => {
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
    }, [kind]);

    useEffect(() => {
        queueMicrotask(() => {
            setTeacherName(getSession()?.name || "선생님");
            void loadReservations();
        });
        return () => { requestVersion.current += 1; };
    }, [loadReservations]);

    useEffect(() => {
        const timer = window.setInterval(() => setToday(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (selection) dialog.current?.showModal();
        else dialog.current?.close();
    }, [selection]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates = [
        ...Array<null>(new Date(year, month, 1).getDay()).fill(null),
        ...Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => new Date(year, month, index + 1)),
    ];
    const week = getWeek(selectedDate);
    const isLunchTeacher = ["김권예소", "정윤기"].some((name) => teacherName.includes(name));
    const periods = kind === "course" && isLunchTeacher
        ? ["점심시간", "저녁시간"]
        : [...CONSULTATION_SCHEDULE.map(({ period }) => period), "8교시", "9교시", "저녁시간"];
    const changeMonth = (direction: number) => {
        const next = new Date(year, month + direction, 1);
        setCurrentDate(next);
        setSelectedDate(next);
    };
    const openReservation = (reservation: TeacherReservation, isApproved: boolean) => {
        setApprovalError(null);
        setSelection({ reservation, approved: isApproved });
    };
    const handleApprove = async () => {
        if (!selection || selection.approved || isApproving) return;
        setIsApproving(true);
        setApprovalError(null);
        try {
            await approveConsultation(kind, selection.reservation.reservation_id);
            setSelection({ ...selection, approved: true });
            setPending((items) => items.filter((item) => item.reservation_id !== selection.reservation.reservation_id));
            setApproved((items) => [...items, selection.reservation]);
            await loadReservations();
        } catch (error) {
            setApprovalError(error instanceof Error ? error.message : "상담을 수락하지 못했습니다.");
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <>
        <TeacherHeader />
        <div className="min-h-[calc(100vh-5rem)] bg-white text-ink lg:flex">
            <aside className="shrink-0 p-7 lg:w-[380px]">
                <div>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-bold">{currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}</h2>
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
                            return (
                                <button key={dateKey(date)} onClick={() => setSelectedDate(date)}
                                    aria-label={dateKey(date)} aria-current={isToday ? "date" : undefined} aria-pressed={isSelected}
                                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-md text-sm ${isToday ? "bg-brand text-white" : "hover:bg-brand-soft"} ${isSelected ? "outline-2 outline-offset-2 outline-ink" : ""}`}>
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-5 text-xs text-secondary-text">초록색: 오늘 · 사각 테두리: 선택한 날짜</p>
                </div>
                <div className="my-6 space-y-3 border-t border-border pt-5 text-sm">
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-yellow-400" />수업</p>
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-brand" />상담 확정</p>
                    <p className="flex items-center gap-3"><span className="h-3 w-3 rounded-full border border-brand bg-brand-soft" />상담 대기</p>
                </div>
                <section aria-labelledby="pending-title" className="border-t border-border pt-5">
                    <h2 id="pending-title" className="mb-3 font-bold">상담 예약 요청 목록 <span className="text-brand-accent">{pending.length}</span></h2>
                    {!isLoading && !loadError && pending.length === 0 && <p className="text-sm text-secondary-text">대기 중인 예약이 없습니다.</p>}
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {pending.map((item) => (
                            <button key={item.reservation_id} onClick={() => openReservation(item, false)} className="w-full rounded-xl border border-border p-3 text-left hover:bg-brand-soft">
                                <span className="block font-semibold">{item.name}</span>
                                <span className="block text-xs text-secondary-text">{item.date} · {formatPeriod(item.period)}</span>
                                <span className="text-sm text-brand-accent">신청 정보 보기 · 수락</span>
                            </button>
                        ))}
                    </div>
                </section>
            </aside>
            <main className="min-w-0 flex-1 bg-panel">
                <div className="border-b border-border bg-white px-8 py-5">
                    <div>
                        <h1 className="text-2xl font-bold">{selectedDate.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}</h1>
                        <p className="mt-1 text-sm text-secondary-text">{teacherName.replace(/ 선생님$/, "")} 선생님</p>
                    </div>
                </div>
                <div className="flex gap-2 px-6 pt-5" aria-label="상담 종류">
                    {(["course", "common"] as const).map((value) => (
                        <button key={value} aria-pressed={kind === value} onClick={() => {
                            if (kind === value) return;
                            requestVersion.current += 1;
                            setKind(value); setPending([]); setApproved([]); setSelection(null);
                        }} className={`rounded-lg px-4 py-2 font-semibold ${kind === value ? "bg-brand text-white" : "bg-white text-secondary-text"}`}>
                            {value === "course" ? "진로 상담" : "일반 상담"}
                        </button>
                    ))}
                </div>
                {isLoading && <p role="status" className="px-6 pt-3 text-sm">상담 신청을 불러오는 중...</p>}
                {loadError && <div role="alert" className="px-6 pt-3 text-sm text-red-600">{loadError}<button onClick={() => void loadReservations()} className="ml-3 underline">다시 불러오기</button></div>}
                <div className="overflow-x-auto p-6">
                    <table className="w-full min-w-[720px] table-fixed border-collapse bg-white text-center">
                        <thead><tr>
                            <th className="w-24 border border-border p-3">교시</th>
                            {week.map((date, index) => <th key={dateKey(date)} className={`border border-border p-3 ${dateKey(date) === dateKey(selectedDate) ? "bg-brand-soft" : ""}`}><span className="block text-xs text-secondary-text">{WEEKDAYS[index]}</span><span className="text-2xl">{date.getDate()}</span></th>)}
                        </tr></thead>
                        <tbody>{periods.map((period) => <tr key={period}>
                            <th scope="row" className="border border-border p-2 text-sm">{period}</th>
                            {week.map((date, index) => {
                                const slot = `${dateKey(date)}_${period}`;
                                const classItem = teacherName.replace(/ 선생님$/, "") === "임경원" ? WEEKLY_CLASS_SCHEDULE[WEEKDAYS[index]]?.[period] : undefined;
                                const confirmed = approved.filter((item) => reservationSlot(item) === slot);
                                const waiting = pending.filter((item) => reservationSlot(item) === slot);
                                return <td key={slot} className="h-20 border border-border p-2 align-top">
                                    {classItem && <div className="rounded-xl bg-yellow-100 p-2 text-yellow-900"><span className="block font-semibold">{classItem.label}</span><span className="text-xs">{classItem.subtitle}</span></div>}
                                    {confirmed.map((item) => <button key={item.reservation_id} onClick={() => openReservation(item, true)} className="mt-1 w-full rounded-xl bg-brand p-2 text-sm font-semibold text-white">{item.name} · 상담 확정</button>)}
                                    {waiting.map((item) => <button key={item.reservation_id} onClick={() => openReservation(item, false)} className="mt-1 w-full rounded-xl border border-brand bg-brand-soft p-2 text-sm font-semibold text-brand-accent">{item.name} · 상담 대기</button>)}
                                </td>;
                            })}
                        </tr>)}</tbody>
                    </table>
                </div>
            </main>
            <dialog ref={dialog} aria-labelledby="reservation-title" onCancel={(event) => { if (isApproving) event.preventDefault(); }} onClose={() => setSelection(null)} className="fixed inset-0 m-auto max-h-[85vh] w-[450px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-6 backdrop:bg-black/30">
                {selection && <>
                    <h2 id="reservation-title" className="mb-5 text-xl font-bold">{selection.approved ? "예약 확정 정보" : "학생 상담 신청 정보"}</h2>
                    <dl className="space-y-3 text-sm">
                        <div><dt className="text-secondary-text">학생</dt><dd className="text-lg font-semibold">{selection.reservation.name}</dd></div>
                        <div><dt className="text-secondary-text">학번</dt><dd>{selection.reservation.student_number || "학번 정보 없음"}</dd></div>
                        <div><dt className="text-secondary-text">상담 일시</dt><dd>{selection.reservation.date} · {formatPeriod(selection.reservation.period)}</dd></div>
                        <div><dt className="text-secondary-text">제목</dt><dd>{selection.reservation.title || "제목 정보 없음"}</dd></div>
                        <div><dt className="text-secondary-text">신청 내용</dt><dd className="whitespace-pre-wrap break-words rounded-lg bg-panel p-3">{selection.reservation.content || "상담 내용 정보 없음"}</dd></div>
                    </dl>
                    {approvalError && <p role="alert" className="mt-4 text-sm text-red-600">{approvalError}</p>}
                    <div className="mt-6 flex gap-2">
                        <button disabled={isApproving} onClick={() => dialog.current?.close()} className="flex-1 rounded-lg border border-border py-3">닫기</button>
                        {!selection.approved && <button disabled={isApproving} onClick={() => void handleApprove()} className="flex-1 rounded-lg bg-brand py-3 font-semibold text-white hover:bg-brand-hover disabled:opacity-50">{isApproving ? "수락 중..." : "상담 수락"}</button>}
                    </div>
                </>}
            </dialog>
        </div>
        </>
    );
}
