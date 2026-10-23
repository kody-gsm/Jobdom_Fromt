import type { ReactNode } from "react";
import { FiBell, FiCalendar, FiCheck, FiFileText, FiMessageCircle, FiUser } from "react-icons/fi";
import { ContentCard } from "@fsd/shared/ui";
import type { TutorialRole } from "../model/progress.ts";
import type { TutorialStep, TutorialTarget } from "../model/steps.ts";
import styles from "./tutorial.module.css";

const SAMPLE_FORM = "[튜토리얼 전용] 잡담 체험 회사 지원서";
const SAMPLE_STUDENT = "체험학생";
const SAMPLE_TEACHER = "체험 선생님";

type FocusAreaProps = {
  target: TutorialTarget;
  step: TutorialStep;
  children: ReactNode;
  className?: string;
};

const FocusArea = ({ target, step, children, className = "" }: FocusAreaProps) => (
  <div data-tutorial-target={target} className={`${styles.area} ${step.target === target ? styles.highlight : ""} ${className}`}>
    {children}
  </div>
);

const SampleButton = ({ children, secondary = false }: { children: ReactNode; secondary?: boolean }) => (
  <span className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-center text-sm font-bold ${secondary ? "border border-border bg-white text-ink" : "bg-brand text-white"}`}>
    {children}
  </span>
);

const SampleField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="mb-2 text-sm font-semibold">{label}</p>
    <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-[#536174]">{children}</div>
  </div>
);

export const TutorialPreview = ({ role, step }: { role: TutorialRole; step: TutorialStep }) => {
  const isStudent = role === "STUDENT";
  const isWeeTeacher = role === "WEE_TEACHER";
  const navigation = isStudent
    ? ["상담 대시보드", "상담 신청", "취업 공고"]
    : isWeeTeacher ? ["wee클래스 상담"] : ["상담 일정", "취업 공고", "신청 폼 관리"];

  return (
    <div inert aria-hidden="true" className={styles.preview}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-5 py-5 sm:px-8">
        <span className="text-2xl font-black tracking-tight text-brand-accent">잡담<span className="ml-1 text-xs font-semibold text-muted">Jobdam</span></span>
        <FocusArea target="navigation" step={step} className="order-3 flex w-full flex-wrap items-center justify-center gap-5 p-3 text-sm font-bold sm:order-none sm:w-auto">
          {navigation.map((label) => <span key={label}>{label}</span>)}
        </FocusArea>
        <FocusArea target="account" step={step} className="flex items-center gap-4 p-3 text-secondary-text">
          <FiBell size={20} /><span className="flex items-center gap-1 text-sm"><FiUser size={18} />프로필</span>
        </FocusArea>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-7 sm:px-8">
        {step.scene === "student-home" ? <StudentHome step={step} /> : null}
        {step.scene === "consultation" ? <ConsultationPreview step={step} /> : null}
        {step.scene === "student-recruit" ? <StudentRecruit step={step} /> : null}
        {step.scene === "student-forms" || step.scene === "teacher-forms" ? <FormList step={step} isStudent={isStudent} /> : null}
        {step.scene === "student-form" || step.scene === "teacher-form-editor" ? <FormPreview step={step} isStudent={isStudent} /> : null}
        {step.scene === "teacher-schedule" ? <TeacherSchedule step={step} isWeeTeacher={isWeeTeacher} /> : null}
        {step.scene === "teacher-request" ? <TeacherRequest step={step} /> : null}
        {step.scene === "banner" ? <BannerPreview step={step} /> : null}
        {step.scene === "teacher-recruit" ? <TeacherRecruit step={step} /> : null}
        {step.scene === "teacher-responses" ? <FormResponses step={step} /> : null}
      </div>
    </div>
  );
};

const StudentHome = ({ step }: { step: TutorialStep }) => (
  <>
    <div><p className="text-sm font-semibold text-brand-accent">나의 학교생활, 잡담과 함께</p><h1 className="mt-2 text-2xl font-bold">상담 대시보드</h1></div>
    <div className="grid gap-5 xl:grid-cols-2">
      <ContentCard className="space-y-5 p-6">
        <FiMessageCircle className="text-brand-accent" size={30} /><h2 className="text-2xl font-bold">상담 신청</h2>
        <p className="text-sm leading-6 text-secondary-text">진로 또는 wee클래스 상담을 신청하고 고민을 나눠 보세요.</p><SampleButton>상담 신청</SampleButton>
      </ContentCard>
      <FocusArea target="upcoming" step={step}>
        <ContentCard className="h-full space-y-5 p-6">
          <h2 className="text-xl font-bold">예정 상담</h2>
          <div className="rounded-xl border border-border p-4">
            <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-bold text-brand-accent">상담 대기</span>
            <p className="mt-3 font-bold">진로에 대해 이야기하고 싶어요</p>
            <p className="mt-2 text-sm text-secondary-text">{SAMPLE_TEACHER} · 예시 날짜 21일 · 3교시</p>
            <div className="mt-4 flex gap-3 text-sm font-bold text-brand-accent"><span>상세 보기</span><span>상담 취소</span></div>
          </div>
        </ContentCard>
      </FocusArea>
    </div>
    <ContentCard className="space-y-4 p-6"><h2 className="text-xl font-bold">취업 공고</h2><p className="text-sm text-secondary-text">관심 있는 기업과 직무를 찾아보세요.</p><SampleButton secondary>공고 전체 보기</SampleButton></ContentCard>
  </>
);

const ConsultationPreview = ({ step }: { step: TutorialStep }) => (
  <>
    <h1 className="text-2xl font-bold">상담 신청</h1>
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <ContentCard className="space-y-6 p-5 sm:p-6">
        <FocusArea target="consultation-type" step={step} className="space-y-4 p-1">
          <div><p className="mb-2 text-sm font-semibold">상담 유형</p><div className="flex flex-wrap gap-2"><SampleButton>취업 진로 상담</SampleButton><SampleButton secondary>wee클래스 상담</SampleButton></div></div>
          <div><p className="mb-2 text-sm font-semibold">상담 선생님</p><span className="inline-flex rounded-xl border border-brand bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-accent">{SAMPLE_TEACHER}</span></div>
        </FocusArea>
        <FocusArea target="consultation-content" step={step} className="space-y-4 p-1">
          <SampleField label="상담 제목">진로에 대해 이야기하고 싶어요</SampleField>
          <div><p className="mb-2 text-sm font-semibold">상담 카테고리</p><div className="flex flex-wrap gap-2">{["학업", "취업", "진학", "생활", "기타"].map((item) => <span key={item} className={`rounded-xl border px-3 py-2 text-sm ${item === "취업" ? "border-brand bg-brand-soft text-brand-accent" : "border-border text-muted"}`}>{item}</span>)}</div></div>
          <SampleField label="구체적인 고민 내용">관심 있는 직무를 찾고 포트폴리오를 준비하는 방법이 궁금해요. 어떤 경험부터 시작하면 좋을까요?</SampleField>
        </FocusArea>
      </ContentCard>
      <ContentCard className="space-y-6 p-5 sm:p-6">
        <FocusArea target="consultation-date" step={step} className="p-1"><SampleCalendar /></FocusArea>
        <FocusArea target="consultation-period" step={step} className="p-1"><p className="mb-3 text-sm font-semibold">상담 교시</p><div className="space-y-2">{["3교시", "점심시간", "6교시"].map((period, index) => <div key={period} className={`flex justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${index === 0 ? "border-brand bg-brand-soft text-brand-accent" : "border-border bg-panel text-muted"}`}><span>{period}</span><span>{index === 0 ? "선택됨" : "예약 불가"}</span></div>)}</div></FocusArea>
        <div className="grid grid-cols-2 items-center gap-3"><SampleButton secondary>취소</SampleButton><FocusArea target="consultation-submit" step={step} className="grid"><SampleButton>상담 신청</SampleButton></FocusArea></div>
      </ContentCard>
    </div>
  </>
);

const SampleCalendar = () => (
  <div>
    <div className="mb-4 flex items-center justify-between"><strong className="flex items-center gap-2"><FiCalendar />예시 달력</strong><span className="text-xs text-muted">이전 달 / 다음 달</span></div>
    <div className="grid grid-cols-7 gap-1 text-center text-sm">
      {["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day} className="py-2 text-xs font-semibold text-muted">{day}</span>)}
      {Array.from({ length: 28 }, (_, index) => <span key={index} className={`rounded-lg py-2 ${index === 20 ? "bg-brand font-bold text-white" : "text-secondary-text"}`}>{index + 1}</span>)}
    </div>
  </div>
);

const StudentRecruit = ({ step }: { step: TutorialStep }) => (
  <>
    <h1 className="text-2xl font-bold">취업 공고</h1>
    <FocusArea target="recruit-search" step={step} className="flex flex-wrap items-center gap-3 p-3">
      <span className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted">회사명·직무·내용 검색</span><SampleButton secondary>모든 공고 ▾</SampleButton><SampleButton secondary>모든 직무 ▾</SampleButton><span className="text-sm font-bold text-brand-accent">신청 폼 보기 →</span>
    </FocusArea>
    <FocusArea target="recruit-detail" step={step} className="max-w-xl">
      <ContentCard className="space-y-5 p-6 sm:p-8">
        <span className="text-xs font-bold text-brand-accent">채용 공고 · 튜토리얼 전용</span><h2 className="text-2xl font-bold">잡담 체험 회사</h2><p className="text-sm font-semibold text-brand-accent">직무 · 소프트웨어 개발</p>
        <p className="text-sm leading-7 text-secondary-text">학교에서 쌓은 경험을 바탕으로 새로운 서비스를 함께 만들 학생을 찾습니다. 실제 모집하지 않는 예시 공고예요.</p>
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm"><div><p className="text-muted">지원 마감</p><p className="mt-1 font-semibold">예시 마감일</p></div><div><p className="text-muted">면접 일정</p><p className="mt-1 font-semibold">별도 안내</p></div></div><SampleButton>공고 상세 보기</SampleButton>
      </ContentCard>
    </FocusArea>
  </>
);

const FormList = ({ step, isStudent }: { step: TutorialStep; isStudent: boolean }) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold">{isStudent ? "신청 폼" : "신청 폼 관리"}</h1>{!isStudent ? <SampleButton>+ 새 폼</SampleButton> : null}</div>
    <FocusArea target="form-list" step={step}>
      <ContentCard className="space-y-5 p-6 sm:p-8"><span className="rounded-lg bg-brand-soft px-3 py-1 text-xs font-bold text-brand-accent">{isStudent ? "신청 가능" : "초안"}</span><h2 className="text-xl font-bold">{SAMPLE_FORM}</h2><p className="text-sm leading-6 text-secondary-text">잡담 이용 방법을 배우기 위한 가상 폼입니다. 실제 모집이나 신청에 사용되지 않습니다.</p><div className="flex flex-wrap gap-3"><SampleButton>{isStudent ? "신청하기" : "편집"}</SampleButton>{!isStudent ? <SampleButton secondary>응답 보기</SampleButton> : null}</div></ContentCard>
    </FocusArea>
  </>
);

const FormPreview = ({ step, isStudent }: { step: TutorialStep; isStudent: boolean }) => (
  <>
    <div><p className="mb-2 text-sm font-bold text-brand-accent">{isStudent ? "신청 폼" : "신청 폼 편집"} · 예시</p><h1 className="text-2xl font-bold leading-snug">{SAMPLE_FORM}</h1><p className="mt-3 text-sm leading-6 text-secondary-text">안내를 위한 가상 폼이에요. 응답이 제출되거나 폼이 저장되지 않아요.</p></div>
    <ContentCard className="space-y-5 p-5 sm:p-7">
        {!isStudent ? <><SampleField label="폼 제목">{SAMPLE_FORM}</SampleField><SampleField label="설명">관심 직무와 지원 동기를 알려 주세요.</SampleField><div className="border-t border-border pt-4 text-sm font-bold">질문 1 · 단답형 · 필수 ✓</div></> : null}
        <FocusArea target={isStudent ? "form-fields" : "form-editor"} step={step} className="space-y-5 p-1">
        <div className="grid gap-4 sm:grid-cols-2"><SampleField label="이름 *">{SAMPLE_STUDENT}</SampleField><SampleField label="학번 *">2101 (예시)</SampleField></div>
        <div><p className="mb-3 text-sm font-semibold">관심 직무 * {isStudent ? "" : "· 객관식"}</p><div className="flex flex-wrap gap-3">{["프론트엔드", "백엔드", "디자인"].map((item, index) => <span key={item} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${index === 0 ? "border-brand bg-brand-soft text-brand-accent" : "border-border text-secondary-text"}`}><span className={`h-3 w-3 rounded-full border ${index === 0 ? "border-brand bg-brand" : "border-muted"}`} />{item}</span>)}</div></div>
        </FocusArea>
        <SampleField label="지원 동기 · 장문형">사용하기 편한 서비스를 만드는 일에 관심이 있어요.</SampleField>
        <div className="rounded-xl border border-dashed border-border bg-panel p-4 text-sm text-secondary-text"><FiFileText className="mb-2" size={20} />포트폴리오 · 파일 첨부 (선택)<p className="mt-2 text-xs">튜토리얼에서는 파일을 선택하지 않아요.</p></div>
        {!isStudent ? <SampleButton secondary>+ 질문 추가</SampleButton> : null}
    </ContentCard>
    <FocusArea target={isStudent ? "form-submit" : "form-publish"} step={step} className="flex flex-wrap gap-3 p-3">
      {isStudent ? <SampleButton>제출하기</SampleButton> : <><SampleButton>저장</SampleButton><SampleButton secondary>공개</SampleButton><SampleButton secondary>마감</SampleButton></>}
    </FocusArea>
  </>
);

const TeacherSchedule = ({ step, isWeeTeacher }: { step: TutorialStep; isWeeTeacher: boolean }) => (
  <>
    <div><p className="text-sm font-semibold text-secondary-text">{SAMPLE_TEACHER}</p><h1 className="mt-2 text-2xl font-bold">{isWeeTeacher ? "wee클래스 상담" : "상담 일정"}</h1></div>
    <div className="grid items-start gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-5">
        <FocusArea target="calendar" step={step}><ContentCard className="p-4"><SampleCalendar /><p className="mt-3 text-xs leading-5 text-muted">초록색: 오늘 · 테두리: 선택한 날짜</p></ContentCard></FocusArea>
        <FocusArea target="requests" step={step}><ContentCard className="space-y-4 p-5"><h2 className="font-bold">상담 예약 요청 목록 <span className="text-brand-accent">1</span></h2><div className="space-y-2 rounded-xl border border-border p-3"><p className="font-bold">{SAMPLE_STUDENT}</p><p className="text-xs text-secondary-text">예시 날짜 21일 · 3교시</p><p className="text-xs font-bold text-brand-accent">신청 정보 보기 · 수락/취소</p></div></ContentCard></FocusArea>
      </div>
      <div className="space-y-5">
        <FocusArea target="slot-modes" step={step} className="flex flex-wrap gap-2 p-3"><SampleButton>{isWeeTeacher ? "wee클래스 상담" : "진로 상담"}</SampleButton><SampleButton secondary>시간 금지 모드</SampleButton><SampleButton secondary>추가 신청</SampleButton></FocusArea>
        <FocusArea target="timetable" step={step}>
          <ContentCard className="overflow-hidden p-3 sm:p-5">
            <div className="grid grid-cols-4 text-center text-xs sm:text-sm">
              {["교시", "월 20", "화 21", "수 22"].map((day) => <div key={day} className="border border-border bg-panel px-1 py-4 font-bold">{day}</div>)}
              {["1교시", "2교시", "3교시", "점심시간"].map((period, index) => <div key={period} className="contents"><div className="flex items-center justify-center border border-border px-1 py-4 font-semibold">{period}</div>{[0, 1, 2].map((day) => <div key={day} className="min-h-16 border border-border p-1 sm:p-2">{index === 0 && day === 0 ? <span className="block rounded-lg bg-gray-200 px-1 py-2 text-gray-600">예약 금지</span> : null}{index === 1 && day === 2 ? <span className="block rounded-lg bg-brand px-1 py-2 font-semibold text-white">{SAMPLE_STUDENT}<br />상담 확정</span> : null}{index === 2 && day === 1 ? <span className="block rounded-lg border border-brand bg-brand-soft px-1 py-2 font-semibold text-brand-accent">{SAMPLE_STUDENT}<br />상담 대기</span> : null}</div>)}</div>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-secondary-text">초록: 상담 확정 · 연한 초록: 상담 대기 · 회색: 예약 금지</p>
          </ContentCard>
        </FocusArea>
      </div>
    </div>
  </>
);

const TeacherRequest = ({ step }: { step: TutorialStep }) => (
  <>
    <h1 className="text-2xl font-bold">{step.target === "force-submit" ? "상담 추가 신청" : "학생 상담 신청 정보"}</h1>
    <ContentCard className="mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
      <span className="rounded-md bg-brand-soft px-3 py-1 text-xs font-bold text-brand-accent">가상의 상담 정보</span>
      <SampleField label="학생">{SAMPLE_STUDENT} · 2101 (예시)</SampleField>
      <SampleField label="상담 일시">예시 날짜 21일 · 3교시</SampleField>
      {step.target === "force-submit" ? <FocusArea target="force-submit" step={step} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"><span className="font-semibold">{SAMPLE_STUDENT} · 2101</span><SampleButton>추가</SampleButton></FocusArea> : <><SampleField label="상담 제목">진로에 대해 이야기하고 싶어요</SampleField><SampleField label="상담 내용">관심 직무를 정하고 포트폴리오를 준비하는 방법이 궁금해요.</SampleField><FocusArea target="request-actions" step={step} className="flex flex-wrap gap-3 p-2"><SampleButton secondary>닫기</SampleButton><SampleButton secondary>상담 신청 취소</SampleButton><SampleButton>상담 수락</SampleButton></FocusArea></>}
    </ContentCard>
  </>
);

const BannerPreview = ({ step }: { step: TutorialStep }) => (
  <>
    <h1 className="text-2xl font-bold">학생 홈 배너</h1>
    <FocusArea target="banner-editor" step={step} className="max-w-xl">
      <ContentCard className="space-y-3 p-5">
        <div className="flex min-h-16 items-center justify-center rounded-xl border border-dashed border-brand bg-brand-soft text-sm font-semibold text-brand-accent">배너 이미지 선택 · 필수</div>
        <dl className="space-y-3">
          {[["배너 제목", "진로 상담 안내"], ["배너 내용", "상담 일정을 확인해요."], ["배너 링크", "링크 입력 (선택)"]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border p-3"><dt className="text-xs font-semibold text-muted">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>
          ))}
        </dl>
        <SampleButton>배너 저장</SampleButton>
      </ContentCard>
    </FocusArea>
  </>
);

const TeacherRecruit = ({ step }: { step: TutorialStep }) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold">취업 공고 지원 현황</h1><SampleButton>+ 공고 작성</SampleButton></div>
    <FocusArea target="recruit-management" step={step}><ContentCard className="space-y-4 p-5"><h2 className="font-bold">공고 데이터</h2><div className="rounded-xl border border-border p-4"><span className="text-xs font-bold text-brand-accent">공개 · 소프트웨어 개발</span><h3 className="mt-3 text-xl font-bold">잡담 체험 회사</h3><p className="mt-3 text-sm text-secondary-text">신청 폼 · {SAMPLE_FORM}</p><div className="mt-4 flex flex-wrap gap-3"><SampleButton secondary>수정</SampleButton><SampleButton secondary>전체 응답 보기 →</SampleButton></div></div><p className="text-sm font-bold">지원자 1명</p><div className="rounded-xl bg-panel p-4 text-sm">{SAMPLE_STUDENT} · 2101 · 프론트엔드</div></ContentCard></FocusArea>
  </>
);

const FormResponses = ({ step }: { step: TutorialStep }) => (
  <>
    <h1 className="text-2xl font-bold leading-snug">{SAMPLE_FORM}</h1>
    <FocusArea target="form-responses" step={step}><ContentCard className="space-y-5 p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">응답 시트</h2><SampleButton secondary>엑셀 다운로드</SampleButton></div><div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="bg-panel"><tr>{["이름", "학번", "관심 직무", "지원 동기"].map((label) => <th key={label} className="border border-border px-3 py-4">{label}</th>)}</tr></thead><tbody><tr>{[SAMPLE_STUDENT, "2101", "프론트엔드", "서비스 개발에 관심이 있어요."].map((value) => <td key={value} className="border border-border px-3 py-5">{value}</td>)}</tr></tbody></table></div><p className="flex items-center gap-2 text-xs font-semibold text-brand-accent"><FiCheck />전체 응답 · 예시 1개</p></ContentCard></FocusArea>
  </>
);
