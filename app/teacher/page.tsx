/* 선생님 페이지 */
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Teacher() {

    // 오늘 날짜
    const today = new Date();

    // 현재 보고 있는 달
    const [currentDate, setCurrentDate] = useState(new Date());

    // 선택 날짜
    const [selectedDate, setSelectedDate] = useState<number>(
        today.getDate()
    );

    // 현재 시간 동기화
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // 요일
    const days = ["S", "M", "T", "W", "T", "F", "S"];

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
        ...Array.from({ length: lastDate }, (_, i) => ({
            day: i + 1,
        })),
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

    // 선택 날짜 기준
    const baseDate = new Date(year, month, selectedDate);

    // 현재 주의 월요일 계산
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate);
    monday.setDate(diff);

    // 주간 날짜
    const weekDays = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return {
            fullDate: date,
            day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            date: date.getDate(),
            isToday: date.toDateString() === today.toDateString(),
        };
    });

    // 교시
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

    // 상담 메모 (왼쪽 "+ create memo" 버튼용 독립 모달 - 슬롯 무관 / 상담 기록 작성)
    const [counselMemo, setCounselMemo] = useState(false);
    const [standaloneStudentName, setStandaloneStudentName] = useState("");
    const [standaloneContent, setStandaloneContent] = useState("");

    // 상담 버튼 클릭 시 열리는 모달의 입력값 (기존 로직 유지, 현재 화면에는 미사용)
    const [studentName, setStudentName] = useState("");
    const [content, setContent] = useState("");

    // API 주소
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // 상담 버튼 클릭 → 예약 확정 정보 모달 열기
    const handleOpenConfirm = (slotKey: string) => {
        setOpenConfirmSlot(slotKey);
    };

    // 상담 기록 저장 (슬롯별) - 기존 로직 유지
    const handleWrite = async () => {
        try {
            if (!studentName.trim()) {
                alert("학생 이름을 입력해주세요.");
                return;
            }
            if (!content.trim()) {
                alert("상담 내용을 입력해주세요.");
                return;
            }
            const response = await fetch(`${API_URL}/course/record/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentName, content }),
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            console.log(data);

            // 슬롯에 메모 저장
            if (openConfirmSlot) {
                setMemoBySlot((prev) => ({
                    ...prev,
                    [openConfirmSlot]: { studentName, content },
                }));
            }

            alert("상담 메모 저장 완료");
            setStudentName("");
            setContent("");
            setOpenConfirmSlot(null);
        } catch (error) {
            console.error(error);
            alert("상담 메모 저장 중 오류가 발생했습니다.");
        }
    };

    // + create memo 버튼 전용 저장 (슬롯 무관)
    const handleWriteStandalone = async () => {
        try {
            if (!standaloneStudentName.trim()) {
                alert("학생 이름을 입력해주세요.");
                return;
            }
            if (!standaloneContent.trim()) {
                alert("상담 내용을 입력해주세요.");
                return;
            }
            const response = await fetch(`${API_URL}/course/record/write`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentName: standaloneStudentName, content: standaloneContent }),
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            alert("상담 메모 저장 완료");
            setStandaloneStudentName("");
            setStandaloneContent("");
            setCounselMemo(false);
        } catch (error) {
            console.error(error);
            alert("상담 메모 저장 중 오류가 발생했습니다.");
        }
    };

    interface RequestData {
        reservation_id: number;
        name: string;
        student_number: string;
        content: string;
        approved: boolean;
        // 어느 날짜+교시 슬롯에 요청했는지 (예: "2025-06-02_4교시")
        slotKey: string;
    }

    // 슬롯 키 생성 함수: "YYYY-MM-DD_교시명"
    const makeSlotKey = (date: Date, period: string) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}_${period}`;
    };

    // 요청 목록 (각 항목에 slotKey 포함)
    const [requestData, setRequestData] = useState<RequestData[]>([
        {
            reservation_id: 1,
            name: "홍길동",
            student_number: "2301",
            content: "취업 관련 상담을 받고 싶습니다.",
            approved: false,
            slotKey: "", // 실제 연동 시 서버에서 받아올 값
        }
    ]);

    // ✅ 핵심 변경: 슬롯별로 승인된 예약을 따로 관리 (key: slotKey, value: RequestData)
    const [approvedBySlot, setApprovedBySlot] = useState<Record<string, RequestData>>({});

    // ✅ 핵심 변경: 어떤 슬롯에서 모달을 열었는지 저장 (null이면 모달 닫힘)
    const [openRequestModalSlot, setOpenRequestModalSlot] = useState<string | null>(null);

    // 상담(예약 확정 정보) 모달에 사용할 슬롯 키 (null이면 닫힘)
    const [openConfirmSlot, setOpenConfirmSlot] = useState<string | null>(null);

    // 슬롯별 저장된 상담 기록 (key: slotKey)
    const [memoBySlot, setMemoBySlot] = useState<Record<string, { studentName: string; content: string }>>({});

    // 슬롯 클릭 → 해당 슬롯의 대기 목록 모달 열기
    const handleOpenRequest = (slotKey: string) => {
        setOpenRequestModalSlot(slotKey);
    };

    const handleReject = async (reservationId: number) => {
        try {
            setRequestData((prev) =>
                prev.filter((item) => item.reservation_id !== reservationId)
            );
        } catch (error) {
            console.error(error);
            alert("상담 거절 실패");
        }
    };

    // ✅ 핵심 변경: 승인 시 해당 슬롯에만 저장, 다른 슬롯에는 영향 없음
    const handleApprove = async (reservationId: number) => {
        try {
            if (!openRequestModalSlot) return;

            const approvedItem = requestData.find(
                (item) => item.reservation_id === reservationId
            );

            if (approvedItem) {
                setApprovedBySlot((prev) => ({
                    ...prev,
                    [openRequestModalSlot]: { ...approvedItem, approved: true },
                }));
            }

            // 승인된 항목을 대기 목록에서 제거
            setRequestData((prev) =>
                prev.filter((item) => item.reservation_id !== reservationId)
            );

            // 모달 닫기
            setOpenRequestModalSlot(null);
        } catch (error) {
            console.error(error);
            alert("상담 승인 실패");
        }
    };

    // 현재 열린 요청 모달의 대기자 목록 (해당 슬롯에 요청한 사람들)
    // slotKey가 없는 더미 데이터는 현재 열린 슬롯에 임시로 배정
    const pendingForSlot = openRequestModalSlot
        ? requestData.filter((item) => !item.approved)
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
                    <button
                        onClick={() => setCounselMemo(true)}
                        className="bg-[#6EC76F] text-white w-70 h-12 rounded-xl text-xl"
                    >
                        + create memo
                    </button>
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
                </div>
            </div>

            {/* 오른쪽 영역 */}
            <div className="flex-1 flex flex-col bg-[#F9FAFB]">

                <div className="h-[95px] bg-white border-b border-gray-200 px-10 flex flex-col justify-center">
                    <h1 className="text-[28px] font-bold text-[#111827]">
                        {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
                    </h1>
                    <span className="text-[16px] font-semibold text-gray-500">진로 상담</span>
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

                        {/* ✅ 날짜 칼럼: 각 날짜×교시 조합마다 독립적인 슬롯 키 사용 */}
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

                                    {/* 노란 버튼 (수업) */}
                                    {/* 노란 버튼 (수업) - 월요일 1교시에만 표시 */}
                                    {item.day === "MON" && (
                                        <button className="absolute top-[10px] left-[20px] w-[120px] h-[60px] rounded-xl bg-[#F8EDAD] flex flex-col items-center justify-center">
                                            <span className="text-[18px] font-bold text-[#C68F7B]">2-4</span>
                                            <span className="text-[10px] text-[#C68F7B]">수업</span>
                                        </button>
                                    )}

                                    {/* ✅ 핵심: 교시마다 각자의 slotKey로 독립적으로 상태 확인 */}
                                    {periods.map((period, pIdx) => {
                                        const slotKey = makeSlotKey(item.fullDate, period);
                                        const approved = approvedBySlot[slotKey];

                                        // 교시별 top 위치 계산 (1교시=10px, 이후 +72px씩)
                                        // 단, 노란 버튼(수업)이 1교시 자리를 쓰고 있으므로
                                        // 상담 대기 버튼은 원본처럼 top-[210px] 고정 위치에 하나만 표시
                                        // 실제 서비스에서는 교시별로 top 계산 필요
                                        const topPx = 10 + pIdx * 72;

                                        // 수업 버튼과 겹치는 1교시(pIdx=0)는 건너뜀
                                        if (pIdx === 0) return null;

                                        // 예시로 4교시(pIdx=3)에만 상담 슬롯 표시 (원본 동작 유지)
                                        // 실제 서비스에서는 서버 데이터로 어느 교시에 상담이 있는지 결정
                                        if (pIdx !== 3 || item.day !== "MON") return null;

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

            {/* ✅ "+ create memo" 버튼 전용 모달: 상담 기록 작성 (슬롯 무관) */}
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

            {/* ✅ 예약 요청 목록 모달: 열린 슬롯의 대기자만 표시 */}
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
                                            onClick={() => handleReject(item.reservation_id)}
                                            className="flex-1 border rounded-lg py-2 text-sm"
                                        >
                                            거절
                                        </button>
                                        <button
                                            onClick={() => handleApprove(item.reservation_id)}
                                            className="flex-1 bg-[#69C56D] text-white rounded-lg py-2 text-sm"
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

            {/* ✅ 상담 버튼 클릭 시 모달: 예약 확정 정보만 표시 */}
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