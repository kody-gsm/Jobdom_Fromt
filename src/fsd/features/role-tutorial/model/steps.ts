import type { TutorialRole } from "./progress.ts";

export type TutorialRoute =
  | "/" | "/counsel" | "/recruit" | "/forms" | "/profile"
  | "/teacher" | "/teacher/recruit" | "/teacher/forms";

// 실제 화면 요소에 `data-tutorial-target`으로 붙는 이름이다.
export type TutorialTarget =
  | "navigation" | "account" | "upcoming"
  | "consultation-type" | "consultation-content" | "consultation-date" | "consultation-period" | "consultation-submit"
  | "recruit-search" | "recruit-list" | "form-list"
  | "calendar" | "timetable" | "slot-modes" | "requests" | "banner-editor"
  | "recruit-create" | "recruit-table" | "teacher-form-list" | "form-editor" | "form-publish"
  | "tutorial-replay";

export type TutorialStep = {
  id: string;
  section: string;
  route: TutorialRoute;
  target: TutorialTarget;
  title: string;
  description: string;
};

const REPLAY_STEP = {
  id: "tutorial-replay",
  section: "안내 완료",
  route: "/profile",
  target: "tutorial-replay",
  title: "안내는 언제든 다시 볼 수 있어요",
  description: "프로필의 ‘튜토리얼 다시 보기’를 누르면 이 안내를 처음부터 다시 볼 수 있어요. 마지막 버튼을 누르면 안내를 마치고 원래 보던 화면으로 돌아가요.",
} as const satisfies TutorialStep;

const STUDENT_STEPS: readonly TutorialStep[] = [
  { id: "student-navigation", section: "잡담 시작하기", route: "/", target: "navigation", title: "잡담에 오신 것을 환영해요", description: "지금 보이는 화면이 실제 학생용 잡담이에요. 상단 메뉴에서 ‘상담 대시보드’, ‘상담 신청’, ‘취업 공고’로 이동할 수 있어요. 안내 중에는 화면이 잠겨 있어 아무것도 신청·저장되지 않아요." },
  { id: "upcoming", section: "상담 대시보드", route: "/", target: "upcoming", title: "다가오는 상담을 한눈에", description: "‘예정 상담’에서 상담 유형, 선생님, 대기·확정 상태와 날짜·교시를 확인해요. 상담을 누르면 상세 내용을 볼 수 있고, 취소할 수 있는 상담은 여기서 취소해요. ‘전체 보기’로 모든 상담을 확인할 수 있어요." },
  { id: "consultation-type", section: "상담 신청 · 1/5", route: "/counsel", target: "consultation-type", title: "상담 유형과 선생님을 골라요", description: "‘취업 진로 상담’ 또는 ‘wee클래스 상담’을 고른 뒤 상담 선생님을 선택해요. 유형에 따라 선택할 수 있는 선생님과 상담 시간이 달라져요." },
  { id: "consultation-content", section: "상담 신청 · 2/5", route: "/counsel", target: "consultation-content", title: "어떤 고민인지 알려 주세요", description: "상담 제목을 쓰고 카테고리를 고른 뒤 구체적인 고민 내용을 적어요. 선생님이 미리 준비할 수 있도록 궁금한 점을 자세히 적어 주세요." },
  { id: "consultation-date", section: "상담 신청 · 3/5", route: "/counsel", target: "consultation-date", title: "상담 희망일을 선택해요", description: "달력에서 상담받고 싶은 날짜를 골라요. 다른 달의 일정은 달력 위 화살표로 이동해서 확인해요." },
  { id: "consultation-period", section: "상담 신청 · 4/5", route: "/counsel", target: "consultation-period", title: "예약 가능한 교시를 골라요", description: "선택한 날짜에 상담할 수 있는 교시가 표시돼요. 선택할 수 없는 시간은 비활성화되어 있어요. 선생님이나 날짜를 바꾸면 가능한 교시도 다시 확인해 주세요." },
  { id: "consultation-submit", section: "상담 신청 · 5/5", route: "/counsel", target: "consultation-submit", title: "마지막은 ‘상담 신청’ 버튼이에요", description: "내용을 확인한 뒤 이 버튼을 누르면 상담이 신청돼요. 신청한 상담은 상담 대시보드에서 대기·확정 상태로 확인할 수 있어요." },
  { id: "recruit-search", section: "취업 공고 · 1/2", route: "/recruit", target: "recruit-search", title: "관심 있는 공고를 찾아요", description: "회사명·직무·내용으로 검색하고, 모집 상태와 직무 필터로 공고를 좁혀요. ‘신청 폼 보기’에서는 공개된 신청 폼을 모아 볼 수 있어요." },
  { id: "recruit-list", section: "취업 공고 · 2/2", route: "/recruit", target: "recruit-list", title: "공고를 열어 자세히 확인해요", description: "공고를 누르면 채용 내용, 지원 마감일과 면접 일정을 확인할 수 있어요. 연결된 신청 폼이 있으면 공고에서 바로 지원을 이어갈 수 있어요." },
  { id: "form-list", section: "신청 폼", route: "/forms", target: "form-list", title: "신청 폼으로 지원해요", description: "공개된 신청 폼의 제목, 설명, 모집 상태를 확인하고 폼을 열어요. 별표(*)가 있는 질문은 필수이고, 모든 필수 질문에 답한 뒤 ‘제출하기’를 누르면 제출돼요." },
  { id: "student-account", section: "알림과 프로필", route: "/", target: "account", title: "새 소식은 알림에서 확인해요", description: "종 모양 아이콘에서 새 알림을 확인하고, 프로필 아이콘에서 내 정보와 상담 내역을 볼 수 있어요." },
  REPLAY_STEP,
];

const TEACHER_STEPS: readonly TutorialStep[] = [
  { id: "teacher-navigation", section: "잡담 시작하기", route: "/teacher", target: "navigation", title: "선생님용 잡담을 안내해 드릴게요", description: "지금 보이는 화면이 실제 선생님용 잡담이에요. 상단 메뉴에서 ‘상담 일정’, ‘취업 공고’, ‘신청 폼 관리’로 이동해요. 안내 중에는 화면이 잠겨 있어 상담이나 폼이 변경되지 않아요." },
  { id: "calendar", section: "상담 일정 · 1/5", route: "/teacher", target: "calendar", title: "달력에서 날짜를 선택해요", description: "월을 이동하고 날짜를 고르면 그 주의 상담 시간표가 표시돼요. 초록색은 오늘, 사각 테두리는 선택한 날짜예요." },
  { id: "timetable", section: "상담 일정 · 2/5", route: "/teacher", target: "timetable", title: "시간표에서 상담 상태를 확인해요", description: "교시별 수업과 상담 일정을 한눈에 봐요. 노란색은 수업, 초록색은 상담 확정, 연한 초록색은 상담 대기, 회색은 예약 금지예요. 상담을 누르면 신청 정보를 볼 수 있어요." },
  { id: "slot-modes", section: "상담 일정 · 3/5", route: "/teacher", target: "slot-modes", title: "예약 금지와 추가 신청", description: "‘시간 금지 모드’를 켜고 시간표 칸을 누르면 예약을 막거나 해제해요. ‘추가 신청’을 켜고 칸을 누르면 학생을 검색해 상담을 바로 추가할 수 있어요. 변경은 즉시 반영되니 확인 후 이용해 주세요." },
  { id: "requests", section: "상담 일정 · 4/5", route: "/teacher", target: "requests", title: "대기 중인 요청을 처리해요", description: "‘상담 예약 요청 목록’에서 학생과 신청 날짜·교시를 확인해요. 요청을 누르면 상담 제목과 내용을 확인하고 수락하거나 취소할 수 있어요." },
  { id: "banner", section: "상담 일정 · 5/5", route: "/teacher", target: "banner-editor", title: "학생 홈 배너를 등록해요", description: "학생 대시보드에 보일 배너 이미지를 고르고 제목·내용·링크를 입력해 저장해요. 배너 이미지는 필수예요." },
  { id: "recruit-create", section: "취업 공고 · 1/2", route: "/teacher/recruit", target: "recruit-create", title: "새 공고를 작성해요", description: "‘+ 공고 작성’으로 회사명, 직무, 마감일 같은 공고 내용을 입력해요. 공고 이미지로 AI 초안을 채운 뒤 내용을 검토할 수도 있어요." },
  { id: "recruit-table", section: "취업 공고 · 2/2", route: "/teacher/recruit", target: "recruit-table", title: "공고와 지원자를 함께 관리해요", description: "‘공고 데이터’에서 공고를 검색하고 상태별로 걸러 봐요. 공고를 선택하면 상세 내용과 지원자를 확인하고 수정할 수 있어요." },
  { id: "teacher-form-list", section: "신청 폼 관리 · 1/3", route: "/teacher/forms", target: "teacher-form-list", title: "폼을 선택하거나 새로 만들어요", description: "목록에서 초안·공개·마감 상태의 폼을 선택하거나 ‘새 폼’으로 새로 만들어요. 폼 제목에 회사명을 넣으면 같은 회사의 취업 공고와 연결돼요." },
  { id: "form-editor", section: "신청 폼 관리 · 2/3", route: "/teacher/forms", target: "form-editor", title: "질문과 필수 응답을 설정해요", description: "‘질문 추가’로 질문을 만들고 유형과 필수 여부를 정해요. 응답이 제출된 폼은 질문 변경이 제한돼요." },
  { id: "form-publish", section: "신청 폼 관리 · 3/3", route: "/teacher/forms", target: "form-publish", title: "저장하고 공개해요", description: "‘저장’한 뒤 ‘공개’하면 학생이 응답할 수 있어요. 공개된 폼은 링크를 복사하거나 ‘마감’으로 모집을 끝내요. 응답은 폼을 선택한 뒤 ‘응답 보기’에서 표로 확인하고 엑셀로 내려받아요." },
  { id: "teacher-account", section: "알림과 프로필", route: "/teacher", target: "account", title: "새 소식은 알림에서 확인해요", description: "종 모양 아이콘에서 새 알림을 확인하고, ‘프로필’에서 내 정보를 볼 수 있어요." },
  REPLAY_STEP,
];

const WEE_TEACHER_EXCLUDED = new Set(["recruit-create", "recruit-table", "teacher-form-list", "form-editor", "form-publish"]);

export const getTutorialSteps = (role: TutorialRole): readonly TutorialStep[] => {
  if (role === "STUDENT") return STUDENT_STEPS;
  if (role === "TEACHER") return TEACHER_STEPS;
  return TEACHER_STEPS.filter((step) => !WEE_TEACHER_EXCLUDED.has(step.id)).map((step) => step.id === "teacher-navigation" ? {
    ...step,
    title: "Wee클래스 선생님을 위한 안내예요",
    description: "지금 보이는 화면이 실제 Wee클래스 선생님용 잡담이에요. 상단 ‘wee클래스 상담’에서 상담 일정과 학생의 상담 요청을 관리하고 학생 홈 배너를 등록해요. 안내 중에는 화면이 잠겨 있어 상담이 변경되지 않아요.",
  } : step);
};
