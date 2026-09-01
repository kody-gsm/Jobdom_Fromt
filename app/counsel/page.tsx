"use client";

import { useEffect, useState, CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ApiError, createConsultation, getUpcomingConsultations } from "@/app/utils/api";
import { HomeLogoButton } from "@/app/components/atoms/HomeLogoButton";

const getDates = () => {
  const result: { day: string; date: number; value: string }[] = [];
  const cursor = new Date();
  while (result.length < 5) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const value = new Date(cursor.getTime() - cursor.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      result.push({ day: ["??, "??, "??, "??, "紐?, "湲?, "??][cursor.getDay()], date: cursor.getDate(), value });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

export default function CounselPage() {
  const [mounted, setMounted] = useState(false);

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
    "?꾧꼍???좎깮??,
    "源沅뚯삁???좎깮??,
    "?뺤쑄湲??좎깮??,
  ];

  const dates = getDates();

  const times = counselType === "career"
    ? selectedTeacher === "?꾧꼍???좎깮??
      ? Array.from({ length: 9 }, (_, index) => `${index + 1}援먯떆`)
      : selectedTeacher ? ["?먯떖?쒓컙", "??곸떆媛?] : []
    : ["1援먯떆", "2援먯떆", "3援먯떆", "4援먯떆", "?먯떖?쒓컙", "5援먯떆", "6援먯떆", "7援먯떆"];

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
      return showToast("?쒕ぉ???낅젰?댁＜?몄슂");

    if (!content.trim())
      return showToast("?댁슜???낅젰?댁＜?몄슂");

    if (counselType === "career" && !selectedTeacher)
      return showToast("?좎깮?섏쓣 ?좏깮?댁＜?몄슂");

    if (!selectedDate)
      return showToast("?좎쭨瑜??좏깮?댁＜?몄슂");

    if (!selectedTime)
      return showToast("援먯떆瑜??좏깮?댁＜?몄슂");

    if (counselType === "career" && hasCareerReservation)
      return showToast("吏꾨줈 ?곷떞? 以묐났 ?좎껌?????놁뒿?덈떎");

    try {
      setSubmitting(true);
      await createConsultation(counselType === "career" ? "course" : "common", {
        title: counselType === "career" ? `[${selectedTeacher}] ${title.trim()}` : title.trim(),
        content: content.trim(),
        date: selectedDate,
        period: selectedTime,
      });
      if (counselType === "career") setHasCareerReservation(true);
      showToast("?곷떞 ?좎껌???꾨즺?섏뿀?듬땲??, "success");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "?곷떞 ?좎껌???ㅽ뙣?덉뒿?덈떎");
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

    showToast("珥덇린?붾릺?덉뒿?덈떎.", "success");
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
          <HomeLogoButton />

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
            ?곷떞???좏깮 諛?二쇱젣 ?낅젰???댁＜?몄슂
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
              吏꾨줈 ?곷떞
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
              ?쇰컲?곷떞
            </button>
          </div>

          <div style={styles.field}>
            <p style={styles.label}>
              ?먰븯???곷떞 ?쒕ぉ???낅젰?댁＜?몄슂.
            </p>

            <input
              style={inputStyle("title")}
              placeholder="?쒕ぉ???낅젰?댁＜?몄슂."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocused("title")}
              onBlur={() => setFocused("")}
            />
          </div>

          <div style={styles.field}>
            <p style={styles.label}>
              ?먰븯???댁슜???낅젰?댁＜?몄슂.
            </p>

            <textarea
              style={{
                ...inputStyle("content"),
                ...styles.textarea,
              }}
              placeholder="?곷떞 ?댁슜???낅젰?댁＜?몄슂."
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
              ? "吏꾨줈 ?곷떞 ?쇱젙 ?덉빟???꾩??쒕┫寃뚯슂."
              : "?쇰컲 ?곷떞 ?쇱젙 ?덉빟???꾩??쒕┫寃뚯슂."}
          </h2>

          <p style={styles.week}>
            {`< ${new Date(dates[0].value).getMonth() + 1}??>`}
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

          {counselType === "career" && selectedTeacher === "?꾧꼍???좎깮?? && selectedTime?.endsWith("援먯떆") && (
            <p style={{ color: "#DC2626", margin: "-32px 0 32px", fontSize: "14px" }}>
              ?섏뾽 ?대떦 ?좎깮?섏쓽 ?덇?瑜?癒쇱? 諛쏆븘二쇱꽭??
            </p>
          )}

          <div style={styles.bottom}>
            <button
              style={styles.cancelBtn}
              onClick={handleCancel}
            >
              痍⑥냼
            </button>

            <button
              style={styles.okBtn}
              onClick={handleConfirm}
              disabled={submitting}
            >
              ?뺤씤
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
  },`r`n
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
