/* 선생님 페이지 */
"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight } from "react-icons/fi";
import Link from "next/link";
import { approveConsultation, getSession, getTeacherConsultations } from "@/app/utils/api";

// ── 타입 ─────────────────────────────────────────────
interface RequestData {
    reservation_id: number;
    name: string;
    student_number: string;
    content: string;
    approved: boolean;
    // 어느 날짜+교시 슬롯에 요청했는지 (예: "2025-06-02_4교시")
    slotKey: string;
}

// 백엔드에서 내려주는 원본 예약 데이터 형태
// (실제 서버 응답 필드명에 맞게 자유롭게 조정하세요)
interface ReservationApiItem {
    reservation_id: number;
    name: string;
    student_number: string;
    content: string;
    approved: boolean;
    // 서버가 슬롯 정보를 date + period로 따로 줄 수도 있고,
    // slotKey를 그대로 줄 수도 있어서 둘 다 대응합니다.
    date?: string; // "YYYY-MM-DD"
    period?: string; // "4교시"
    slotKey?: string;
}

// 수업 시간표 한 칸(교시)에 표시할 정보
interface ClassScheduleEntry {
    label: string; // 예: "2-4" (학년-반), "창체", "취동" 등
    subtitle?: string; // 학년-반 수업일 때만 "수업"으로 표시, 창체/취동 등은 생략
}

// ── 순수 헬퍼 함수 (렌더링마다 재생성될 필요 없으므로 컴포넌트 밖으로 분리) ──
const days = ["S", "M", "T", "W", "T", "F", "S"];

const periods = [
    "1교시",
    "2교시",
    "3교시",
    "4교시",
    "점심시간",
    "5교시",
    "6교시",
    "7교시",
];

// 주간 요일 라벨 (weekDays 배열의 i=0(월) ~ i=4(금) 순서와 대응)
const weekdayLabels = ["월", "화", "수", "목", "금"];

// 임경원 선생님 시간표 (하드코딩) — 요일별 · 교시별 수업 정보
// 사진 속 시간표를 그대로 반영: 학년-반 수업은 subtitle "수업", 창체/취동은 label만 표시
const WEEKLY_CLASS_SCHEDULE: Record<string, Record<string, ClassScheduleEntry>> = {
    "월": {
        "4교시": { label: "3-1", subtitle: "수업" },
    },
    "화": {
        "5교시": { label: "2-2", subtitle: "수업" },
    },
    "수": {
        "1교시": { label: "3-3", subtitle: "수업" },
        "3교시": { label: "3-4", subtitle: "수업" },
        "5교시": { label: "창체" },
        "6교시": { label: "창체" },
        "7교시": { label: "취동" },
    },
    "목": {
        "1교시": { label: "3-4", subtitle: "수업" },
        "5교시": { label: "2-4", subtitle: "수업" },
    },
    "금": {
        "1교시": { label: "2-1", subtitle: "수업" },
        "4교시": { label: "3-2", subtitle: "수업" },
        "7교시": { label: "2-3", subtitle: "수업" },
    },
};

// 슬롯 키 생성: "YYYY-MM-DD_교시명"
function makeSlotKey(date: Date, period: string) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}_${period}`;
}

// 기준 날짜가 속한 주의 월요일
function getMonday(base: Date) {
    const date = new Date(base);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
}

// date 문자열("YYYY-MM-DD") + period → slotKey 계산
function resolveSlotKey(date?: string, period?: string, slotKey?: string) {
    if (slotKey) return slotKey;
    if (date && period) {
        const [y, m, d] = date.split("-").map(Number);
        return makeSlotKey(new Date(y, m - 1, d), period);
    }
    return "";
}

// 서버 응답(ReservationApiItem) → 화면에서 쓰는 RequestData로 변환
function toRequestData(item: ReservationApiItem): RequestData {
    return {
        reservation_id: item.reservation_id,
        name: item.name,
        student_number: item.student_number,
        content: item.content,
        approved: item.approved,
        slotKey: resolveSlotKey(item.date, item.period, item.slotKey),
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Teacher() {

    const [teacherName, setTeacherName] = useState("선생님");

    // 오늘 날짜
    const today = new Date();

    // 현재 보고 있는 달
    const [currentDate, setCurrentDate] = useState(new Date());

    // 선택 날짜
    const [selectedDate, setSelectedDate] = useState<number>(today.getDate());

    // 현재 연도 / 월
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 이번 달 시작 요일
    const firstDay = new Date(year, month, 1).getDay();

    // 이번 달 마지막 날짜
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 날짜 배열
    const dates = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: lastDate }, (_, i) => ({ day: i + 1 })),
    ];

    // 월 변경
    const changeMonth = (direction: number) => {
        const newDate = new Date(year, month + direction, 1);
        const newLastDate = new Date(
            newDate.getFullYear(),
            newDate.getMonth() + 1,
            0
        ).getDate();
        setCurrentDate(newDate);
        setSelectedDate((prev) => Math.min(prev, newLastDate));
    };

    // 선택 날짜 기준 → 해당 주의 월요일
    const baseDate = new Date(year, month, selectedDate);
    const monday = getMonday(baseDate);

    // 주간 날짜 (월~금)
    const weekDays = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return {
            fullDate: date,
            day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            koreanDay: weekdayLabels[i],
            date: date.getDate(),
            isToday: date.toDateString() === today.toDateString(),
        };
    });

    // 교시
    const periods = ["김권예소", "정윤기"].some((name) => teacherName.includes(name))
        ? ["점심시간", "저녁시간"]
        : Array.from({ length: 9 }, (_, index) => `${index + 1}교시`);

    // 상담 메모 (왼쪽 "+ create memo" 버튼용 독립 모달 - 슬롯 무관 / 상담 기록 작성)
    const [counselMemo, setCounselMemo] = useState(false);
    const [standaloneStudentName, setStandaloneStudentName] = useState("");
    const [standaloneContent, setStandaloneContent] = useState("");

    // + create memo 버튼 전용 저장 (슬롯 무관)
    const handleWriteStandalone = async () => {
        if (!standaloneStudentName.trim()) {
            alert("학생 이름을 입력해주세요.");
            return;
        }
        if (!standaloneContent.trim()) {
            alert("상담 내용을 입력해주세요.");
            return;
        }
        try {
            if (!standaloneStudentName.trim()) {
                alert("학생 이름을 입력해주세요.");
                return;
            }
            if (!standaloneContent.trim()) {
                alert("상담 내용을 입력해주세요.");
                return;
            }
            alert("상담 메모 저장 완료");
            setStandaloneStudentName("");
            setStandaloneContent("");
            setCounselMemo(false);
        } catch (error) {
            console.error(error);
            alert("상담 메모 저장 중 오류가 발생했습니다.");
        }
    };

    // 예약 요청 목록 (서버 데이터로만 채워짐)
    const [requestData, setRequestData] = useState<RequestData[]>([]);

    // 슬롯별로 승인된 예약 (key: slotKey)
    const [approvedBySlot, setApprovedBySlot] = useState<Record<string, RequestData>>({});

    // 상담 신청 데이터 로딩 상태
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [loadRequestsError, setLoadRequestsError] = useState<string | null>(null);

    const loadReservations = async () => {
        setIsLoadingRequests(true);
        setLoadRequestsError(null);

        try {
            const approved = await getTeacherConsultations("course");
            setRequestData([]);
            setApprovedBySlot(Object.fromEntries(approved.map((item) => [
                `${item.date}_${item.period}`,
                { ...item, student_number: "", content: "", approved: true, slotKey: `${item.date}_${item.period}` },
            ])));
        } catch (error) {
            console.error(error);
            setLoadRequestsError("상담 신청 데이터를 불러오지 못했습니다.");
            throw error;
        } finally {
            setIsLoadingRequests(false);
        }
    };

    useEffect(() => {
        setTeacherName(getSession()?.name || "선생님");
        void loadReservations().catch(() => undefined);
    }, []);

    // ✅ 핵심 변경: 어떤 슬롯에서 모달을 열었는지 저장 (null이면 모달 닫힘)
    const [openRequestModalSlot, setOpenRequestModalSlot] = useState<string | null>(null);

    // 예약 확정 정보 모달이 열린 슬롯 (null이면 닫힘)
    const [openConfirmSlot, setOpenConfirmSlot] = useState<string | null>(null);

    const handleOpenRequest = (slotKey: string) => setOpenRequestModalSlot(slotKey);
    const handleOpenConfirm = (slotKey: string) => setOpenConfirmSlot(slotKey);

    // ✅ 핵심 변경: 승인 시 해당 슬롯에만 저장, 다른 슬롯에는 영향 없음
    const handleApprove = async (reservationId: number) => {
        try {
            if (!openRequestModalSlot) return;
            await approveConsultation("course", reservationId);
            await loadReservations();
            setOpenRequestModalSlot(null);
        } catch (error) {
            console.error(error);
        }
    };

    // 현재 열린 요청 모달의 대기자 목록 (해당 슬롯에 요청한 사람들)
    const pendingForSlot = openRequestModalSlot
        ? requestData.filter((item) => !item.approved && item.slotKey === openRequestModalSlot)
        : [];

    return (
        <div className="flex min-h-screen bg-white">

            {/* 왼쪽 영역 */}
            <div className="m-7">

                {/* 로고 */}
                <div className="w-16 h-16">
                    <img src="/JobdamIcon.svg" alt="Jobdam Icon" />
                </div>

                {/* 버튼 */}
                <div className="ml-7">
                    <Link href="/teacher/recruit" className="flex bg-[#6EC76F] text-white w-70 h-12 rounded-xl text-xl items-center justify-center">
                        취업 공고 관리
                    </Link>
                </div>

                {/* 달력 */}
                <div className="w-[380px] bg-white rounded-2xl p-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#111827]">
                            {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => changeMonth(-1)}>
                                <ChevronLeft className="w-6 h-6 text-gray-500" />
                            </button>
                            <button onClick={() => changeMonth(1)}>
                                <ChevronRight className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-3 text-center">
                        {days.map((day, idx) => (
                            <div key={`${day}-${idx}`} className="text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-3 text-center">
                        {dates.map((date, idx) => {
                            if (date === null) return <div key={idx}></div>;
                            const isSelected = date.day === selectedDate;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date.day)}
                                    className={`
                                        w-10 h-10 mx-auto rounded-lg text-sm font-medium
                                        flex items-center justify-center transition-all
                                        text-black hover:bg-gray-200
                                        ${isSelected ? "bg-[#6BC46D] text-white" : ""}
                                    `}
                                >
                                    {date.day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-300 my-6" />

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-yellow-400" />
                            <span className="text-sm text-gray-700">수업</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-700">상담 확정</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-green-300" />
                            <span className="text-sm text-gray-700">상담 대기</span>
                        </div>
                    </div>

                    {loadRequestsError && (
                        <div className="mt-4 text-xs text-red-500">
                            {loadRequestsError}
                        </div>
                    )}
                </div>
            </div>

            {/* 오른쪽 영역 */}
            <div className="flex-1 flex flex-col bg-[#F9FAFB]">

                <div className="h-[95px] bg-white border-b border-gray-200 px-10 flex flex-col justify-center">
                    <h1 className="text-[28px] font-bold text-[#111827]">
                        {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
                    </h1>
                    <span className="text-[16px] font-semibold text-gray-500">
                        진로 상담
                        {isLoadingRequests ? " · 불러오는 중..." : ""}
                    </span>
                </div>

                {/* 시간표 */}
                <div className="flex justify-center py-5">
                    <div className="flex bg-white">

                        {/* 교시 */}
                        <div className="w-[95px]">
                            <div className="h-[60px] border border-gray-300" />
                            {periods.map((period) => (
                                <div
                                    key={period}
                                    className="h-[72px] border-l border-r border-b border-gray-300 flex items-center justify-center text-[18px] font-medium bg-white"
                                >
                                    {period}
                                </div>
                            ))}
                        </div>

                        {/* 날짜 칼럼: 각 날짜×교시 조합마다 독립적인 슬롯 키 사용 */}
                        {weekDays.map((item) => (
                            <div
                                key={item.fullDate.toISOString()}
                                className="w-[165px] border-r border-gray-300 bg-white"
                            >
                                {/* 상단 날짜 */}
                                <div className="h-[60px] border-t border-b border-gray-300 flex flex-col items-center justify-center">
                                    <span className="text-[11px] text-gray-400 font-semibold">{item.day}</span>
                                    <span className="text-[24px] font-bold text-[#111827]">{item.date}</span>
                                </div>

                                {/* 세로 기둥 */}
                                <div className="relative h-[576px]">

                                    {/* 교시마다 각자의 slotKey로 독립 상태 확인 (모든 요일/교시에 대해 데이터 기반으로 렌더링) */}
                                    {periods.map((period, pIdx) => {
                                        const slotKey = makeSlotKey(item.fullDate, period);
                                        const classItem = WEEKLY_CLASS_SCHEDULE[item.koreanDay]?.[period];
                                        const topPx = 10 + pIdx * 72;

                                        // 수업이 있는 슬롯: 하드코딩된 시간표 정보로 렌더링
                                        if (classItem) {
                                            return (
                                                <div
                                                    key={slotKey}
                                                    style={{ top: `${topPx}px` }}
                                                    className="absolute left-[20px] w-[120px] h-[60px] rounded-xl bg-[#F8EDAD] flex flex-col items-center justify-center"
                                                >
                                                    <span className="text-[18px] font-bold text-[#C68F7B]">
                                                        {classItem.label}
                                                    </span>
                                                    {classItem.subtitle && (
                                                        <span className="text-[10px] text-[#C68F7B]">
                                                            {classItem.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // 점심시간은 상담 슬롯에서 제외
                                        if (period === "점심시간") return null;

                                        const approved = approvedBySlot[slotKey];
                                        const hasPending = requestData.some(
                                            (r) => !r.approved && r.slotKey === slotKey
                                        );

                                        // 승인/대기 요청이 없는 슬롯은 표시하지 않음
                                        if (!approved && !hasPending) return null;

                                        return approved ? (
                                            <button
                                                key={slotKey}
                                                onClick={() => handleOpenConfirm(slotKey)}
                                                style={{ top: `${topPx}px` }}
                                                className="absolute left-[20px] w-[120px] h-[60px] rounded-xl bg-[#7FD986] flex items-center justify-center text-white text-[16px] font-semibold"
                                            >
                                                상담
                                            </button>
                                        ) : (
                                            <button
                                                key={slotKey}
                                                onClick={() => handleOpenRequest(slotKey)}
                                                style={{ top: `${topPx}px` }}
                                                className="absolute left-[20px] w-[120px] h-[60px] rounded-xl bg-[#DAFDE2] flex items-center justify-center text-[#62B96B] text-[16px] font-semibold"
                                            >
                                                상담 대기
                                            </button>
                                        );
                                    })}

                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* "+ create memo" 버튼 전용 모달: 상담 기록 작성 (슬롯 무관) */}
            {counselMemo && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
                    <div className="w-[450px] bg-white rounded-[15px] p-8">

                        <h2 className="text-[20px] font-bold mb-5">상담 기록 작성</h2>

                        <div className="mb-4">
                            <label className="block mb-2 text-[14px] font-semibold text-gray-700">
                                학생 이름
                            </label>
                            <input
                                type="text"
                                value={standaloneStudentName}
                                onChange={(e) => setStandaloneStudentName(e.target.value)}
                                className="w-full border border-gray-200 rounded-[12px] px-4 py-3 outline-none bg-white text-[14px]"
                                placeholder="학생의 이름을 입력하세요"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block mb-2 text-[14px] font-semibold text-gray-700">
                                상담 내용
                            </label>
                            <textarea
                                value={standaloneContent}
                                onChange={(e) => setStandaloneContent(e.target.value)}
                                placeholder="상담 내용을 입력하세요."
                                className="w-full h-[200px] border border-gray-200 rounded-[12px] px-4 py-3 outline-none resize-none bg-white text-[14px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setStandaloneStudentName("");
                                    setStandaloneContent("");
                                    setCounselMemo(false);
                                }}
                                className="flex-1 h-[44px] rounded-[11px] border text-sm text-gray-600 hover:bg-gray-50 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleWriteStandalone}
                                className="flex-1 h-[44px] rounded-[11px] bg-[#69C56D] text-white text-[15px] font-semibold hover:bg-[#57b55b] transition"
                            >
                                저장
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 예약 요청 목록 모달: 열린 슬롯의 대기자만 표시 */}
            {openRequestModalSlot && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
                    <div className="w-[450px] bg-white rounded-[30px] p-8">

                        <h2 className="text-[20px] font-bold mb-5">상담 예약 요청 목록</h2>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {pendingForSlot.map((item) => (
                                <div key={item.reservation_id} className="bg-[#F9FAFB] rounded-[18px] p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-[18px] font-semibold">{item.name}</div>
                                            <div className="text-[13px] text-gray-400">{item.student_number}</div>
                                        </div>
                                    </div>
                                    <div className="text-[14px] text-gray-600 mb-3">{item.content}</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(item.reservation_id)}
                                            className="w-full bg-[#69C56D] text-white rounded-lg py-2 text-sm"
                                        >
                                            승인
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {pendingForSlot.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    대기 중인 예약이 없습니다.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setOpenRequestModalSlot(null)}
                            className="w-full h-[44px] rounded-[14px] bg-[#69C56D] text-white border mt-5 text-sm"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {/* 상담 버튼 클릭 시 모달: 예약 확정 정보만 표시 */}
            {openConfirmSlot && approvedBySlot[openConfirmSlot] && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                    <div className="w-[450px] bg-white rounded-[15px] p-8">

                        <h2 className="text-[20px] font-bold mb-5">예약 확정 정보</h2>

                        <div className="bg-[#DAFDE2] rounded-[20px] p-5">
                            <div className="mb-4">
                                <div className="text-[24px] font-semibold">
                                    {approvedBySlot[openConfirmSlot].name}
                                </div>
                                <div className="text-[#69C56D] text-[14px]">
                                    {approvedBySlot[openConfirmSlot].student_number}
                                </div>
                            </div>
                            <div className="bg-white rounded-[13px] p-4 text-[14px] text-gray-700 leading-relaxed">
                                {approvedBySlot[openConfirmSlot].content}
                            </div>
                        </div>

                        <button
                            onClick={() => setOpenConfirmSlot(null)}
                            className="w-full h-[44px] rounded-[11px] border mt-5 bg-[#69C56D] text-white text-sm"
                        >
                            닫기
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}
