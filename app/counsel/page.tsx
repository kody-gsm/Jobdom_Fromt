"use client";

import { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ApiError, createConsultation, getSession, getUpcomingConsultations } from "@/app/utils/api";

const getDates = () => {
  const result: { day: string; date: number; value: string }[] = [];
  const cursor = new Date();
  while (result.length < 5) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const value = new Date(cursor.getTime() - cursor.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      result.push({ day: ["일", "월", "화", "수", "목", "금", "토"][cursor.getDay()], date: cursor.getDate(), value });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

export default function CounselPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [counselType, setCounselType] = useState<"career" | "general">(
    "career"
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [hoverTeacher, setHoverTeacher] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [hoverTime, setHoverTime] = useState<string | null>(null);

  const [focused, setFocused] = useState("");
  const [hasCareerReservation, setHasCareerReservation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (new URLSearchParams(window.location.search).get("type") === "general") setCounselType("general");
    getUpcomingConsultations("course").then((items) => setHasCareerReservation(items.length > 0)).catch(() => undefined);
  }, []);

  const teachers = [
    "임경원 선생님",
    "김권예소 선생님",
    "정윤기 선생님",
  ];

  const dates = getDates();

  const times = counselType === "career"
    ? selectedTeacher === "임경원 선생님"
      ? Array.from({ length: 9 }, (_, index) => `${index + 1}교시`)
      : selectedTeacher ? ["점심시간", "저녁시간"] : []
    : ["1교시", "2교시", "3교시", "4교시", "점심시간", "5교시", "6교시", "7교시"];

  const showToast = (
    msg: string,
    type: "error" | "success" = "error"
  ) => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleConfirm = async () => {
    if (!title.trim())
      return showToast("제목을 입력해주세요");

    if (!content.trim())
      return showToast("내용을 입력해주세요");

    if (counselType === "career" && !selectedTeacher)
      return showToast("선생님을 선택해주세요");

    if (!selectedDate)
      return showToast("날짜를 선택해주세요");

    if (!selectedTime)
      return showToast("교시를 선택해주세요");

    if (counselType === "career" && hasCareerReservation)
      return showToast("진로 상담은 중복 신청할 수 없습니다");

    try {
      setSubmitting(true);
      await createConsultation(counselType === "career" ? "course" : "common", {
        title: counselType === "career" ? `[${selectedTeacher}] ${title.trim()}` : title.trim(),
        content: content.trim(),
        date: selectedDate,
        period: selectedTime,
      });
      if (counselType === "career") setHasCareerReservation(true);
      showToast("상담 신청이 완료되었습니다", "success");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "상담 신청에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    setSelectedDate(null);
    setSelectedTime(null);

    router.push("/");
  };

  const handleTabChange = (type: "career" | "general") => {
    setCounselType(type);
    setSelectedTeacher(null);
    setSelectedTime(null);
  };

  const inputStyle = (name: string): CSSProperties => ({
    ...styles.input,
    border:
      focused === name
        ? "1px solid #02C551"
        : "1px solid #E5E7EB",

    boxShadow:
      focused === name
        ? "0 0 0 3px rgba(2, 197, 81, .15)"
        : "none",
  });

  return (
    <>
      {mounted &&
        toast &&
        createPortal(
          <div
            style={{
              ...styles.toast,
              background:
                toast.type === "success"
                  ? "#02C551"
                  : "#DC2626",
            }}
          >
            <svg
              width="22"
              height="16"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 7L6.5 11.5L16 2"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{toast.msg}</span>
          </div>,
          document.body
        )}

      <div style={styles.page}>
        <nav style={styles.nav}>
          <div
            style={styles.logo}
            onClick={() => {
              if (getSession()?.role === "STUDENT") router.push("/");
            }}
          >
            <svg
              width="64"
              height="33"
              viewBox="0 0 63 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="63" height="31.8172" fill="white" />
              <path
                d="M59.5106 5.39275H60.494C62.429 5.39275 63 6.88369 63 8.15257C63 9.45317 62.3973 10.9124 60.494 10.9124H59.5106V16.4637H53.1662V3.14048C53.1662 1.07855 54.6571 0 56.3384 0C58.0197 0 59.5106 1.07855 59.5106 3.14048V5.39275ZM48.8203 15.6707H36.0363C33.3399 15.6707 32.4834 14.6239 32.4834 12.1813V4.40937C32.4834 1.96677 33.3399 0.951661 36.0363 0.951661H47.4562C49.2961 0.951661 49.8354 2.22054 49.8354 3.39426C49.8354 4.56798 49.2644 5.86858 47.4562 5.86858H39.1768C38.7326 5.86858 38.5423 6.05891 38.5423 6.4713V10.2145C38.5423 10.6269 38.7326 10.8172 39.1768 10.8172H48.8203C50.6601 10.8172 51.136 12.1178 51.136 13.2598C51.136 14.4653 50.6284 15.6707 48.8203 15.6707ZM38.1616 17.574H55.2598C59.003 17.574 59.7009 18.716 59.7009 22.2372V29.787H38.1616C34.3233 29.787 33.6254 28.645 33.6254 25.0287V22.3323C33.6254 18.716 34.3233 17.574 38.1616 17.574ZM40.6042 25.3776H53.4517V22.713C53.4517 22.0786 53.2931 21.9199 52.7221 21.9199H40.6042C40.0332 21.9199 39.8746 22.0786 39.8746 22.713V24.5846C39.8746 25.2825 40.0332 25.3776 40.6042 25.3776Z"
                fill="#02C551"
              />
              <path
                d="M33.4033 19.1285C33.4033 18.2525 34.1134 17.5424 34.9894 17.5424H58.4637C59.3397 17.5424 60.0499 18.2525 60.0499 19.1285V29.4352C60.0499 29.7343 59.9004 30.0136 59.6515 30.1795C59.6 30.2139 59.545 30.2428 59.4875 30.2658L58.781 30.5484L56.719 31.3415L56.216 31.4786C55.7614 31.6026 55.3854 31.1126 55.6228 30.7056C55.8275 30.3547 55.5744 29.914 55.1681 29.914H34.9894C34.1134 29.914 33.4033 29.2038 33.4033 28.3279V19.1285Z"
                fill="#02C551"
              />
              <path
                d="M40.0654 20.8732H53.3887"
                stroke="white"
                strokeWidth="1.26888"
                strokeLinecap="round"
              />
              <path
                d="M40.0654 23.7281H53.3887"
                stroke="white"
                strokeWidth="1.26888"
                strokeLinecap="round"
              />
              <path
                d="M40.0654 26.5831H49.2648"
                stroke="white"
                strokeWidth="1.26888"
                strokeLinecap="round"
              />
              <path
                d="M27.7885 5.39275H28.7719C30.707 5.39275 31.278 6.88369 31.278 8.15257C31.278 9.45317 30.6752 10.9124 28.7719 10.9124H27.7885V16.3051H21.4441V3.14048C21.4441 1.07855 22.9351 0 24.6163 0C26.2976 0 27.7885 1.07855 27.7885 3.14048V5.39275ZM10.7538 12.3082C8.9139 14.8459 5.96375 16.3686 2.91843 16.3686C1.36405 16.3686 0 15.4486 0 13.8308C0 12.5619 0.729607 11.7054 1.99849 11.5151C4.98036 11.1027 6.53474 9.16768 6.53474 6.62991V5.99547H2.53776C1.04683 5.99547 0.222055 4.66314 0.222055 3.52115C0.222055 2.37915 0.91994 1.01511 2.53776 1.01511H17.0665C18.6843 1.01511 19.3822 2.37915 19.3822 3.52115C19.3822 4.66314 18.5574 5.99547 17.0665 5.99547H12.5302V6.62991C12.5302 7.10574 12.4985 7.54985 12.435 7.99396C17.2568 8.0574 19.6994 10.7221 19.5725 16.1465H13.6405C13.8625 13.9577 12.6888 12.2447 10.7538 12.3082ZM24.8384 17.2251C26.6783 17.2251 27.9789 18.145 27.9789 20.207V29.787H6.37613C2.88671 29.787 1.93505 28.5499 1.93505 25.3459V20.207C1.93505 18.1133 3.29909 17.2251 5.13897 17.2251C6.85197 17.2251 8.08912 18.0181 8.24774 19.7628H21.6662C21.8248 17.9864 23.1254 17.2251 24.8384 17.2251ZM9.07251 25.6631H21.6344V23.6964H8.27946V24.9335C8.27946 25.568 8.43807 25.6631 9.07251 25.6631Z"
                fill="#02C551"
              />
            </svg>
          </div>

          <div style={styles.profile}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4C26.6264 3.99999 29.2271 4.51729 31.6537 5.52238C34.0802 6.52747 36.285 8.00065 38.1421 9.85782C39.9993 11.715 41.4725 13.9198 42.4776 16.3463C43.4827 18.7728 44 21.3735 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4ZM26 26H22C17.0486 26 12.7977 28.9988 10.9642 33.2795C13.8652 37.3474 18.6228 40 24 40C29.3771 40 34.1347 37.3474 37.0358 33.2793C35.2023 28.9988 30.9514 26 26 26ZM24 10C20.6863 10 18 12.6863 18 16C18 19.3137 20.6863 22 24 22C27.3137 22 30 19.3137 30 16C30 12.6863 27.3138 10 24 10Z"
                fill="black"
              />
            </svg>
          </div>
        </nav>

        <main style={styles.main}>
          <h1 style={styles.title}>
            상담을 선택 및 주제 입력을 해주세요
          </h1>

          <div style={styles.tabRow}>
            <button
              style={{
                ...styles.tabBtn,
                background:
                  counselType === "career"
                    ? "#02C551"
                    : "#fff",

                color:
                  counselType === "career"
                    ? "#fff"
                    : "#111",

                border:
                  counselType === "career"
                    ? "1px solid #02C551"
                    : "1px solid #D9D9D9",
              }}
              onClick={() => handleTabChange("career")}
            >
              진로 상담
            </button>

            <button
              style={{
                ...styles.tabBtn,
                background:
                  counselType === "general"
                    ? "#02C551"
                    : "#fff",

                color:
                  counselType === "general"
                    ? "#fff"
                    : "#111",

                border:
                  counselType === "general"
                    ? "1px solid #02C551"
                    : "1px solid #D9D9D9",
              }}
              onClick={() => handleTabChange("general")}
            >
              일반상담
            </button>
          </div>

          <div style={styles.field}>
            <p style={styles.label}>
              원하는 상담 제목을 입력해주세요.
            </p>

            <input
              style={inputStyle("title")}
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocused("title")}
              onBlur={() => setFocused("")}
            />
          </div>

          <div style={styles.field}>
            <p style={styles.label}>
              원하는 내용을 입력해주세요.
            </p>

            <textarea
              style={{
                ...inputStyle("content"),
                ...styles.textarea,
              }}
              placeholder="상담 내용을 입력해주세요."
              value={content}
              maxLength={500}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused("content")}
              onBlur={() => setFocused("")}
            />

            <div style={styles.count}>
              {content.length}/500
            </div>
          </div>

          {counselType === "career" && (
            <div style={styles.teacherRow}>
              {teachers.map((teacher) => {
                const selected =
                  selectedTeacher === teacher;

                const hover =
                  hoverTeacher === teacher;

                return (
                  <button
                    key={teacher}
                    onMouseEnter={() =>
                      setHoverTeacher(teacher)
                    }
                    onMouseLeave={() =>
                      setHoverTeacher(null)
                    }
                    onClick={() =>
                      setSelectedTeacher(
                        selected ? null : teacher
                      )
                    }
                    style={{
                      ...styles.teacherBtn,

                      background: selected
                        ? "#02C551"
                        : hover
                        ? "#F0FFF4"
                        : "#fff",

                      color: selected
                        ? "#fff"
                        : hover
                        ? "#02C551"
                        : "#111",

                      border:
                        selected || hover
                          ? "1px solid #02C551"
                          : "1px solid #D9D9D9",
                    }}
                  >
                    {teacher}
                  </button>
                );
              })}
            </div>
          )}

          <h2 style={styles.reserveTitle}>
            {counselType === "career"
              ? "진로 상담 일정 예약을 도와드릴게요."
              : "일반 상담 일정 예약을 도와드릴게요."}
          </h2>

          <p style={styles.week}>
            {`< ${new Date(dates[0].value).getMonth() + 1}월 >`}
          </p>

          <div style={styles.dateRow}>
            {dates.map((item) => {
              const selected =
                selectedDate === item.value;

              const hover =
                hoverDate === item.value;

              return (
                <button
                  key={item.value}
                  onMouseEnter={() =>
                    setHoverDate(item.value)
                  }
                  onMouseLeave={() =>
                    setHoverDate(null)
                  }
                  onClick={() =>
                    setSelectedDate(
                      selected ? null : item.value
                    )
                  }
                  style={{
                    ...styles.dateBtn,

                    background: selected
                      ? "#02C551"
                      : hover
                      ? "#F0FFF4"
                      : "#F7F7F7",

                    color: selected
                      ? "#fff"
                      : hover
                      ? "#02C551"
                      : "#111",

                    border: selected
                      ? "1px solid #02C551"
                      : "none",
                  }}
                >
                  <span>{item.day}</span>

                  <strong>{item.date}</strong>
                </button>
              );
            })}
          </div>

          <div style={styles.timeRow}>
            {times.map((time) => {
              const selected =
                selectedTime === time;

              const hover =
                hoverTime === time;

              return (
                <button
                  key={time}
                  onMouseEnter={() =>
                    setHoverTime(time)
                  }
                  onMouseLeave={() =>
                    setHoverTime(null)
                  }
                  onClick={() =>
                    setSelectedTime(
                      selected ? null : time
                    )
                  }
                  style={{
                    ...styles.timeBtn,

                    background: selected
                      ? "#02C551"
                      : "#fff",

                    color: selected
                      ? "#fff"
                      : hover
                      ? "#02C551"
                      : "#111",

                    border:
                      selected || hover
                        ? "1px solid #02C551"
                        : "1px solid #D9D9D9",
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {counselType === "career" && selectedTeacher === "임경원 선생님" && selectedTime?.endsWith("교시") && (
            <p style={{ color: "#DC2626", margin: "-32px 0 32px", fontSize: "14px" }}>
              수업 담당 선생님의 허가를 먼저 받아주세요.
            </p>
          )}

          <div style={styles.bottom}>
            <button
              style={styles.cancelBtn}
              onClick={handleCancel}
            >
              취소
            </button>

            <button
              style={styles.okBtn}
              onClick={handleConfirm}
              disabled={submitting}
            >
              확인
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
  },

  nav: {
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },

  profile: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  main: {
    width: "720px",
    margin: "50px auto",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#111827",
  },

  tabRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "40px",
  },

  tabBtn: {
    width: "103px",
    height: "52px",
    borderRadius: "12px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all .2s",
  },

  field: {
    marginBottom: "28px",
  },

  label: {
    marginBottom: "10px",
    fontSize: "15px",
    color: "#444",
  },

  input: {
    width: "100%",
    height: "52px",
    borderRadius: "10px",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
    transition: ".2s",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    height: "130px",
    padding: "14px 16px",
    resize: "none",
    boxSizing: "border-box",
    borderRadius: "10px",
    fontSize: "15px",
  },

  count: {
    marginTop: "8px",
    textAlign: "right",
    color: "#9CA3AF",
    fontSize: "13px",
  },

  teacherRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "45px",
    flexWrap: "wrap",
  },

  teacherBtn: {
    height: "48px",
    padding: "0 22px",
    borderRadius: "10px",
    background: "#fff",
    cursor: "pointer",
    transition: ".2s",
    fontSize: "15px",
  },

  reserveTitle: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "18px",
    color: "#111827",
  },

  week: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "22px",
  },

  dateRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
  },

  dateBtn: {
    width: "64px",
    height: "72px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: ".2s",
    gap: "6px",
  },

  timeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "50px",
  },

  timeBtn: {
    height: "46px",
    padding: "0 20px",
    borderRadius: "10px",
    background: "#fff",
    cursor: "pointer",
    transition: ".2s",
    fontSize: "15px",
  },

  bottom: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },

  cancelBtn: {
    width: "140px",
    height: "50px",
    border: "none",
    borderRadius: "10px",
    background: "#F3F4F6",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  okBtn: {
    width: "140px",
    height: "50px",
    border: "none",
    borderRadius: "10px",
    background: "#02C551",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  toast: {
    position: "fixed",
    top: "32px",
    right: "48px",
    width: "360px",
    height: "80px",
    borderRadius: "24px",
    padding: "0 28px",
    color: "#ffffff",
    fontWeight: "500",
    fontSize: "20px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    boxSizing: "border-box",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  },
};
