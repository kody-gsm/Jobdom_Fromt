import type { TutorialRole } from "./progress.ts";

// 연습용 서버의 고정 ID(공고 7001~7008, 폼 9001)로 실제 상세 화면까지 따라가 본다.
// "/recruit/7001"은 연습용 공고 상세 화면 전체를 뜻한다. 필터로 다른 연습 공고를 골라도 그대로 진행한다.
export type TutorialRoute =
  | "/" | "/counsel" | "/recruit" | "/recruit/7001" | "/forms/9001" | "/profile"
  | "/teacher" | "/teacher/recruit" | "/teacher/forms" | "/teacher/forms/9001/submissions";

// 실제 화면 요소에 `data-tutorial-target`으로 붙는 이름이다.
export type TutorialTarget =
  | "navigation" | "account" | "upcoming" | "nav-counsel" | "nav-recruit"
  | "consultation-type" | "consultation-content" | "consultation-date" | "consultation-period" | "consultation-submit"
  | "recruit-search" | "recruit-list" | "recruit-apply" | "form-fields" | "form-submit"
  | "calendar" | "timetable" | "slot-lock" | "slot-force" | "requests" | "banner-editor"
  | "nav-teacher-recruit" | "nav-teacher-forms" | "recruit-create" | "recruit-editor" | "recruit-table"
  | "teacher-form-list" | "form-responses-link" | "form-editor" | "form-publish" | "form-sheet"
  | "notifications" | "nav-profile" | "tutorial-replay";

// 다음 단계로 넘어가는 조건
export type TutorialAction =
  | { type: "next" } // '다음' 버튼
  | { type: "route"; path: TutorialRoute } // 강조된 메뉴·링크를 눌러 해당 화면으로 이동
  | { type: "selector"; selectors: readonly string[] } // 화면에 모든 선택자가 나타남 (선택·입력 완료)
  | { type: "dialog" }; // 열린 창을 처리하고 닫음

export type TutorialStep = {
  id: string;
  section: string;
  route: TutorialRoute;
  target: TutorialTarget;
  // 함께 눌러야 하는 영역. 함께 강조하고 클릭할 수 있게 연다.
  extraTargets?: readonly TutorialTarget[];
  action: TutorialAction;
  title: string;
  description: string;
  // 직접 해야 할 일. 끝내면 자동으로 다음 단계로 넘어간다.
  task?: string;
};

const PRACTICE_RECRUIT_DETAIL = /^\/recruit\/700[1-8]$/;
export const matchesRoute = (route: TutorialRoute, pathname: string) =>
  route === pathname || (route === "/recruit/7001" && PRACTICE_RECRUIT_DETAIL.test(pathname));

// 설명 단계에서 강조된 메뉴를 먼저 눌러 이동했을 때, 바로 다음 '메뉴 눌러 이동하기' 단계와 같은 이동이면
// 그 단계를 마친 것으로 보고 이어서 진행할 단계 번호를 돌려준다. 다른 곳으로 갔다면 null(단계 화면으로 돌아간다).
export const findNavigationResume = (steps: readonly TutorialStep[], index: number, from: string, to: string) => {
  const routeIndex = steps.findIndex((step, i) => i >= index && step.action.type === "route");
  if (routeIndex < 0) return null;
  const routeStep = steps[routeIndex];
  if (routeStep.action.type !== "route" || !matchesRoute(routeStep.route, from) || !matchesRoute(routeStep.action.path, to)) return null;
  // 건너뛰는 설명 단계는 모두 같은 화면이어야 한다. (다른 화면 단계를 몰래 건너뛰지 않게)
  if (steps.slice(index, routeIndex).some((step) => !matchesRoute(step.route, from))) return null;
  return Math.min(routeIndex + 1, steps.length - 1);
};

const NEXT = { type: "next" } as const;
// 읽지 않은 알림이 없어지면(알림을 열어 읽으면) 종 버튼 이름이 '알림'으로 바뀐다.
const NOTIFICATIONS_READ = '[data-tutorial-target~="notifications"] > button[aria-label="알림"]';
const pressed = (target: TutorialTarget) => `[data-tutorial-target~="${target}"] [aria-pressed="true"]`;

const REPLAY_STEP = {
  id: "tutorial-replay", section: "안내 완료", route: "/profile", target: "tutorial-replay", action: NEXT,
  title: "안내는 언제든 다시 볼 수 있어요",
  description: "프로필의 ‘튜토리얼 다시 보기’를 누르면 처음부터 다시 연습할 수 있어요. 지금까지 만든 연습 데이터는 안내를 마치면 사라지고, 실제 계정에는 아무것도 저장되지 않았어요.",
} as const satisfies TutorialStep;

const STUDENT_STEPS: readonly TutorialStep[] = [
  { id: "student-navigation", section: "잡담 시작하기", route: "/", target: "navigation", action: NEXT, title: "잡담에 오신 것을 환영해요", description: "지금부터 실제 화면에서 직접 눌러 보며 연습해요. 화면에 보이는 상담·공고·폼은 모두 연습용 데이터이고, 무엇을 눌러도 실제로 신청·제출되지 않아요." },
  { id: "upcoming", section: "상담 대시보드", route: "/", target: "upcoming", action: NEXT, title: "다가오는 상담을 한눈에", description: "‘예정 상담’에서 상담 유형, 선생님, 대기·확정 상태와 날짜·교시를 확인해요. 지금은 연습용 상담 하나가 ‘상담 대기’로 보여요." },
  { id: "go-counsel", section: "상담 신청 · 1/6", route: "/", target: "nav-counsel", action: { type: "route", path: "/counsel" }, title: "상담을 신청해 볼게요", description: "상단 메뉴에서 상담 신청 화면으로 이동해요.", task: "‘상담 신청’ 메뉴를 눌러 보세요." },
  { id: "consultation-type", section: "상담 신청 · 2/6", route: "/counsel", target: "consultation-type", action: { type: "selector", selectors: [pressed("consultation-type")] }, title: "상담 유형과 선생님을 골라요", description: "‘취업 진로 상담’ 또는 ‘wee클래스 상담’을 고르면 그 유형의 선생님이 보여요.", task: "선생님을 눌러 선택해 보세요." },
  { id: "consultation-content", section: "상담 신청 · 3/6", route: "/counsel", target: "consultation-content", action: NEXT, title: "어떤 고민인지 적어요", description: "선생님이 미리 준비할 수 있도록 제목과 카테고리, 구체적인 고민을 적어요.", task: "제목·카테고리·고민 내용을 채운 뒤 ‘다음’을 눌러 주세요." },
  { id: "consultation-date", section: "상담 신청 · 4/6", route: "/counsel", target: "consultation-date", action: { type: "selector", selectors: [pressed("consultation-date")] }, title: "상담 희망일을 골라요", description: "선택할 수 있는 날짜만 눌러져요. 다른 달은 달력 위 ‘이전 달·다음 달’로 이동해요.", task: "달력에서 다른 날짜를 하나 골라 보세요." },
  { id: "consultation-period", section: "상담 신청 · 5/6", route: "/counsel", target: "consultation-period", action: { type: "selector", selectors: [pressed("consultation-period")] }, title: "교시를 골라요", description: "회색으로 ‘예약 불가’라고 보이는 교시는 고를 수 없어요.", task: "가능한 교시를 하나 골라 보세요." },
  { id: "consultation-submit", section: "상담 신청 · 6/6", route: "/counsel", target: "consultation-submit", extraTargets: ["consultation-type", "consultation-content", "consultation-date", "consultation-period"], action: { type: "route", path: "/" }, title: "‘상담 신청’을 눌러요", description: "빠진 항목이 있으면 빨간색으로 알려 줘요. 연습이라 실제 선생님께는 신청되지 않아요.", task: "‘상담 신청’ 버튼을 눌러 보세요." },
  { id: "upcoming-after", section: "상담 대시보드", route: "/", target: "upcoming", action: NEXT, title: "방금 신청한 상담이 보여요", description: "신청한 상담은 선생님이 수락하기 전까지 ‘상담 대기’로 보여요. 수락되면 ‘상담 확정’으로 바뀌고 알림이 와요." },
  { id: "go-recruit", section: "취업 공고 · 1/3", route: "/", target: "nav-recruit", action: { type: "route", path: "/recruit" }, title: "취업 공고를 살펴봐요", description: "상단 메뉴에서 취업 공고로 이동해요.", task: "‘취업 공고’ 메뉴를 눌러 보세요." },
  { id: "recruit-search", section: "취업 공고 · 2/3", route: "/recruit", target: "recruit-search", action: NEXT, title: "관심 있는 공고를 찾아요", description: "회사명·직무·내용으로 검색하고, 모집 상태와 직무 필터로 좁혀요. 연습용 공고가 직무마다 하나씩, 마감된 공고도 하나 있어요. 자유롭게 눌러 본 뒤 ‘다음’을 눌러 주세요." },
  { id: "recruit-list", section: "취업 공고 · 3/3", route: "/recruit", target: "recruit-list", action: { type: "route", path: "/recruit/7001" }, title: "공고를 열어 봐요", description: "공고를 누르면 채용 내용, 지원 마감일과 면접 일정을 볼 수 있어요.", task: "모집 중인 공고 하나를 눌러 보세요." },
  { id: "recruit-apply", section: "신청 폼 · 1/3", route: "/recruit/7001", target: "recruit-apply", action: { type: "route", path: "/forms/9001" }, title: "연결된 신청 폼으로 지원해요", description: "공고에 신청 폼이 연결되어 있으면 여기서 바로 지원할 수 있어요.", task: "‘신청폼 보기’를 눌러 보세요." },
  { id: "form-fields", section: "신청 폼 · 2/3", route: "/forms/9001", target: "form-fields", action: NEXT, title: "질문에 답해요", description: "별표(*)가 있는 질문은 꼭 답해야 해요. 질문에 따라 글쓰기, 선택, 날짜, 파일 첨부 등이 있어요. 답을 적은 뒤 ‘다음’을 눌러 주세요." },
  { id: "form-submit", section: "신청 폼 · 3/3", route: "/forms/9001", target: "form-submit", extraTargets: ["form-fields"], action: { type: "selector", selectors: ['[data-tutorial-target~="form-submitted"]'] }, title: "‘제출’을 눌러요", description: "제출하면 이 자리에 내가 낸 응답이 보이고, 마감 전에는 ‘재응답’으로 고칠 수 있어요. 연습이라 실제로 제출되지 않아요.", task: "‘제출’ 버튼을 눌러 보세요." },
  { id: "student-notifications", section: "알림과 프로필 · 1/2", route: "/forms/9001", target: "notifications", action: { type: "selector", selectors: [NOTIFICATIONS_READ] }, title: "새 알림이 왔어요", description: "종 아이콘의 빨간 숫자는 읽지 않은 알림 수예요. 상담 수락·거절, 새 공고·신청 폼 소식이 여기로 와요. 알림을 누르면 관련 화면으로 이동하고 읽음으로 바뀌어요.", task: "종 아이콘을 눌러 알림을 열고, 새 알림을 눌러 읽어 보세요." },
  { id: "student-profile", section: "알림과 프로필 · 2/2", route: "/forms/9001", target: "nav-profile", action: { type: "route", path: "/profile" }, title: "내 정보는 프로필에서 봐요", description: "프로필에서 내 정보와 상담 내역을 확인하고, 이 안내를 다시 볼 수 있어요.", task: "오른쪽 위 프로필 아이콘을 눌러 보세요." },
  REPLAY_STEP,
];

const TEACHER_STEPS: readonly TutorialStep[] = [
  { id: "teacher-navigation", section: "잡담 시작하기", route: "/teacher", target: "navigation", action: NEXT, title: "선생님용 잡담을 연습해 볼게요", description: "지금부터 실제 화면에서 직접 눌러 보며 연습해요. 보이는 학생·상담·공고·폼은 모두 연습용 데이터이고, 무엇을 눌러도 실제 학생이나 상담은 바뀌지 않아요." },
  { id: "calendar", section: "상담 일정 · 1/7", route: "/teacher", target: "calendar", action: NEXT, title: "달력에서 날짜를 골라요", description: "날짜를 누르면 그 주의 시간표가 보여요. 초록색은 오늘, 사각 테두리는 선택한 날짜예요. 눌러 본 뒤 ‘다음’을 눌러 주세요." },
  { id: "requests", section: "상담 일정 · 2/7", route: "/teacher", target: "requests", action: { type: "dialog" }, title: "학생의 상담 요청을 처리해요", description: "요청을 누르면 학생이 적은 상담 제목과 내용이 열려요. ‘상담 수락’을 누르면 일정이 확정돼요.", task: "‘체험학생’ 요청을 눌러 열고 ‘상담 수락’을 누른 뒤 ‘닫기’를 눌러 보세요." },
  { id: "timetable", section: "상담 일정 · 3/7", route: "/teacher", target: "timetable", action: NEXT, title: "시간표에서 상담을 확인해요", description: "노란색은 수업, 초록색은 상담 확정, 연한 초록색은 상담 대기, 회색은 예약 금지예요. 상담 칸을 누르면 신청 정보를 다시 볼 수 있어요." },
  { id: "slot-lock", section: "상담 일정 · 4/7", route: "/teacher", target: "slot-lock", extraTargets: ["timetable"], action: NEXT, title: "예약을 막을 시간을 정해요", description: "‘시간 금지 모드’를 켜고 빈 칸을 누르면 그 시간에는 학생이 신청할 수 없어요. 금지된 칸을 다시 누르면 풀려요.", task: "‘시간 금지 모드’를 켜고 칸을 눌러 본 뒤 ‘다음’을 눌러 주세요." },
  { id: "slot-force", section: "상담 일정 · 5/7", route: "/teacher", target: "slot-force", extraTargets: ["timetable"], action: { type: "dialog" }, title: "학생 상담을 직접 추가해요", description: "‘추가 신청’을 켜고 빈 칸을 누르면 학생을 검색해 상담을 바로 잡을 수 있어요.", task: "‘추가 신청’을 켜고 빈 칸을 눌러 학생을 ‘추가’해 보세요." },
  { id: "teacher-notifications", section: "상담 일정 · 6/7", route: "/teacher", target: "notifications", action: { type: "selector", selectors: [NOTIFICATIONS_READ] }, title: "새 상담 신청 알림이 왔어요", description: "학생이 상담을 신청하거나 취소하면 종 아이콘에 빨간 숫자로 알려 줘요. 알림을 누르면 상담 일정 화면으로 이동하고 읽음으로 바뀌어요.", task: "종 아이콘을 눌러 알림을 열고, 새 알림을 눌러 읽어 보세요." },
  { id: "banner", section: "상담 일정 · 7/7", route: "/teacher", target: "banner-editor", action: NEXT, title: "학생 홈 배너를 등록해요", description: "학생 대시보드에 보일 배너 이미지를 고르고 제목·내용·링크를 넣어 저장해요. 이미지는 필수예요. 연습이라 학생 화면에는 올라가지 않아요." },
  { id: "go-teacher-recruit", section: "취업 공고 · 1/4", route: "/teacher", target: "nav-teacher-recruit", action: { type: "route", path: "/teacher/recruit" }, title: "취업 공고를 관리해요", description: "상단 메뉴에서 취업 공고 관리로 이동해요.", task: "‘취업 공고’ 메뉴를 눌러 보세요." },
  { id: "recruit-create", section: "취업 공고 · 2/4", route: "/teacher/recruit", target: "recruit-create", action: { type: "selector", selectors: ['[data-tutorial-target~="recruit-editor"]'] }, title: "새 공고를 작성해요", description: "공고 작성 화면을 열어요.", task: "‘+ 공고 작성’을 눌러 보세요." },
  { id: "recruit-editor", section: "취업 공고 · 3/4", route: "/teacher/recruit", target: "recruit-editor", action: NEXT, title: "공고 내용을 입력해요", description: "회사명, 분야, 마감일, 요약을 적고 저장해요. 공고 이미지를 올리면 AI가 내용을 채워 주니, 저장 전에 꼭 검토해 주세요. 입력해 본 뒤 ‘다음’을 눌러 주세요." },
  { id: "recruit-table", section: "취업 공고 · 4/4", route: "/teacher/recruit", target: "recruit-table", action: NEXT, title: "공고와 지원자를 함께 봐요", description: "‘공고 데이터’에서 공고를 검색하고 상태별로 걸러 봐요. 공고를 누르면 상세 내용과 지원자를 확인하고 수정할 수 있어요." },
  { id: "go-teacher-forms", section: "신청 폼 관리 · 1/6", route: "/teacher/recruit", target: "nav-teacher-forms", action: { type: "route", path: "/teacher/forms" }, title: "신청 폼을 관리해요", description: "상단 메뉴에서 신청 폼 관리로 이동해요.", task: "‘신청 폼 관리’ 메뉴를 눌러 보세요." },
  { id: "form-editor", section: "신청 폼 관리 · 2/6", route: "/teacher/forms", target: "form-editor", action: NEXT, title: "새 폼을 직접 만들어 봐요", description: "제목을 적고 질문 내용과 유형, 필수 여부를 정해요. ‘질문 추가’로 질문을 늘릴 수 있어요. 폼 제목에 회사명을 넣으면 같은 회사 공고와 연결돼요.", task: "제목과 질문을 채운 뒤 ‘다음’을 눌러 주세요." },
  { id: "form-publish", section: "신청 폼 관리 · 3/6", route: "/teacher/forms", target: "form-publish", action: { type: "selector", selectors: ['[data-form-status="PUBLISHED"]'] }, title: "저장하고 공개해요", description: "‘저장’하면 초안이 되고, 이어서 나타나는 ‘공개’를 누르면 학생이 응답할 수 있어요. 공개된 폼은 링크를 복사하거나 ‘마감’으로 모집을 끝내요. 빠진 항목이 있으면 위에 안내가 떠요.", task: "‘저장’을 누른 뒤 ‘공개’를 눌러 보세요." },
  { id: "teacher-form-list", section: "신청 폼 관리 · 4/6", route: "/teacher/forms", target: "teacher-form-list", action: { type: "selector", selectors: ['a[href="/teacher/forms/9001/submissions"]'] }, title: "만든 폼은 목록에 모여요", description: "방금 공개한 폼도 목록에 보여요. 초안·공개·마감 상태를 확인하고, 폼을 눌러 다시 고칠 수 있어요. 학생 응답이 있는 연습 폼을 열어 볼게요.", task: "‘[연습] 잡담 체험 회사 지원서’를 눌러 열어 보세요." },
  { id: "form-responses-link", section: "신청 폼 관리 · 5/6", route: "/teacher/forms", target: "form-responses-link", action: { type: "route", path: "/teacher/forms/9001/submissions" }, title: "응답을 확인해요", description: "학생들이 낸 응답은 ‘응답 보기’에서 확인해요. 응답이 들어온 폼은 기존 답변을 지키기 위해 질문을 바꿀 수 없어요.", task: "‘응답 보기’를 눌러 보세요." },
  { id: "form-sheet", section: "신청 폼 관리 · 6/6", route: "/teacher/forms/9001/submissions", target: "form-sheet", action: NEXT, title: "응답을 표로 보고 내려받아요", description: "학생별 답변을 한 줄씩 보고 엑셀로 내려받을 수 있어요. 지금 보이는 응답은 연습용이에요." },
  { id: "teacher-profile", section: "프로필", route: "/teacher/forms/9001/submissions", target: "nav-profile", action: { type: "route", path: "/profile" }, title: "내 정보는 프로필에서 봐요", description: "프로필에서 내 정보를 확인하고, 이 안내를 다시 볼 수 있어요.", task: "오른쪽 위 ‘프로필’을 눌러 보세요." },
  REPLAY_STEP,
];

const WEE_TEACHER_EXCLUDED = new Set([
  "go-teacher-recruit", "recruit-create", "recruit-editor", "recruit-table",
  "go-teacher-forms", "teacher-form-list", "form-editor", "form-publish", "form-responses-link", "form-sheet",
]);

export const getTutorialSteps = (role: TutorialRole): readonly TutorialStep[] => {
  if (role === "STUDENT") return STUDENT_STEPS;
  if (role === "TEACHER") return TEACHER_STEPS;
  return TEACHER_STEPS.filter((step) => !WEE_TEACHER_EXCLUDED.has(step.id)).map((step) => step.id === "teacher-profile" ? { ...step, route: "/teacher" as const } : step.id === "teacher-navigation" ? {
    ...step,
    title: "Wee클래스 선생님용 잡담을 연습해 볼게요",
    description: "상단 ‘wee클래스 상담’에서 상담 요청 처리, 예약 금지, 상담 추가, 알림 확인, 학생 홈 배너 등록을 직접 눌러 보며 연습해요. 보이는 학생과 상담은 모두 연습용이라 실제로 바뀌지 않아요.",
  } : step);
};

export const getStepTargets = (step: TutorialStep): readonly TutorialTarget[] => [step.target, ...(step.extraTargets ?? [])];
