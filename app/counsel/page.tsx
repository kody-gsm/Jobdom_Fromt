"use client";

import { useState, CSSProperties } from "react";
import { ProfileIcon } from "../components/atoms/ProfileIcon";

export default function CounselingForm() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const MAX_LENGTH = 500;

  const handleCancel = (): void => {
    setTitle("");
    setContent("");
  };

  const handleConfirm = (): void => {
    console.log({ title, content });
    // TODO: 제출 로직 연결
  };

  const getInputStyle = (fieldName: string): CSSProperties => ({
    ...styles.input,
    border: focusedField === fieldName ? "1px solid #3DAB6F" : "1px solid #C5C5C5",
    boxShadow: focusedField === fieldName ? "0 0 0 3px rgba(61,171,111,0.12)" : "none",
  });

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <img src="/JobdamIcon.svg" alt="잡담" style={{ height: "32px" }} />
        <div style={styles.navLinks}>
          <ProfileIcon />
        </div>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.sectionTitle}>일반 상담 내용 입력을 도와드릴게요.</h1>

        <div style={styles.fieldWrap}>
          <p style={styles.fieldLabel}>원하는 상담 제목을 입력해주세요.</p>
          <input
            style={getInputStyle("title")}
            type="text"
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocusedField("title")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <div style={styles.fieldWrap}>
          <p style={styles.fieldLabel}>원하는 내용을 입력해주세요.</p>
          <textarea
            style={{ ...getInputStyle("content"), ...styles.textarea }}
            placeholder="상담 내용을 입력해주세요."
            value={content}
            maxLength={MAX_LENGTH}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocusedField("content")}
            onBlur={() => setFocusedField(null)}
          />
          <p style={styles.charCount}>{content.length}/{MAX_LENGTH}</p>
        </div>

        <h2 style={styles.sectionTitle}>일반 상담 일정 예약을 도와드릴게요.</h2>

        {/* TODO: 날짜 선택 UI 추가 예정 */}
        {/* TODO: 교시 선택 UI 추가 예정 */}

        <div style={styles.btnRow}>
          <button style={styles.btnCancel} onClick={handleCancel}>
            취소
          </button>
          <button style={styles.btnConfirm} onClick={handleConfirm}>
            확인
          </button>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "'Pretendard Variable', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
  },
  navLinks: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  profileIcon: {
    cursor: "pointer",
  },
  main: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "48px 20px 80px",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "28px",
    lineHeight: "1.4",
    letterSpacing: "-0.3px",
  },
  fieldWrap: {
    marginBottom: "24px",
  },
  fieldLabel: {
    fontSize: "16px",
    color: "#000000",
    marginBottom: "8px",
  },
  input: {
    width: "660px",
    height: "52px",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: 400,
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    fontFamily: "Pretendard Variable",
    transition: "border 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  textarea: {
    height: "auto",
    minHeight: "140px",
    resize: "none",
    lineHeight: "1.6",
    textAlign: "left",
  },
  charCount: {
    width: "660px",
    textAlign: "right",
    fontSize: "14px",
    color: "#C5C5C5",
    marginTop: "6px",
  },
  btnRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "48px",
  },
  btnCancel: {
    width: "144px",
    height: "52px",
    borderRadius: "12px",
    border: "1px solid #F7F7F7",
    backgroundColor: "#F7F7F7",
    fontSize: "20px",
    color: "#000000",
    cursor: "pointer",
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
  },
  btnConfirm: {
    width: "144px",
    height: "52px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#02C551",
    fontSize: "20px",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "Pretendard Variable",
    fontWeight: "500",
  },
};