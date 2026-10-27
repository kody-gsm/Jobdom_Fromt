import type { TutorialRole } from "./progress.ts";

export type TutorialScene =
  | "student-home" | "consultation" | "student-recruit" | "student-forms" | "student-form"
  | "teacher-schedule" | "teacher-request" | "banner" | "teacher-recruit"
  | "teacher-forms" | "teacher-form-editor" | "teacher-responses";

export type TutorialTarget =
  | "navigation" | "account" | "upcoming" | "consultation-type" | "consultation-content"
  | "consultation-date" | "consultation-period" | "consultation-submit" | "recruit-search" | "recruit-detail"
  | "form-list" | "form-fields" | "form-submit" | "calendar" | "timetable" | "requests"
  | "request-actions" | "slot-modes" | "force-submit" | "banner-editor" | "recruit-management"
  | "form-editor" | "form-publish" | "form-responses";

export type TutorialStep = {
  id: string;
  section: string;
  scene: TutorialScene;
  target: TutorialTarget;
  title: string;
  description: string;
};

const STUDENT_STEPS: readonly TutorialStep[] = [
  { id: "student-navigation", section: "잡담 시작하기", scene: "student-home", target: "navigation", title: "잡담에 오신 것을 환영해요", description: "학생용 잡담을 함께 둘러볼게요. 상단 메뉴에서 상담 대시보드, 상담 신청, 취업 공고로 이동할 수 있어요. 이 안내에서는 예시 데이터만 사용해요. ‘다음’을 눌러 시작해 주세요." },
  { id: "upcoming", section: "상담 대시보드", scene: "student-home", target: "upcoming", title: "다가오는 상담을 한눈에", description: "예정 상담에서 날짜와 교시, 선생님, 대기·확정 상태를 확인해요. 상담을 선택하면 상세 내용을 볼 수 있고, 취소 가능한 상담은 취소할 수 있어요. 새로운 상담은 ‘상담 신청’에서 시작해요." },
  { id: "consultation-type", section: "상담 신청 · 1/5", scene: "consultation", target: "consultation-type", title: "상담 유형과 선생님을 골라요", description: "취업 진로 상담 또는 wee클래스 상담을 선택한 뒤 선생님을 골라요. 유형에 따라 선택할 수 있는 선생님과 상담 시간이 달라져요. 지금 보이는 선생님은 튜토리얼용 예시예요." },
  { id: "consultation-content", section: "상담 신청 · 2/5", scene: "consultation", target: "consultation-content", title: "어떤 고민인지 알려 주세요", description: "상담 제목, 카테고리, 구체적인 고민을 작성해요. 선생님이 미리 준비할 수 있도록 궁금한 점을 적어 주세요. 여기에는 예시 내용을 미리 채워 두었어요." },
  { id: "consultation-date", section: "상담 신청 · 3/5", scene: "consultation", target: "consultation-date", title: "상담 희망일을 선택해요", description: "달력에서 상담을 원하는 날짜를 선택해요. 실제 화면에서는 선택할 수 있는 날짜가 표시돼요. 다른 달의 일정은 달력 위의 이전 달·다음 달로 확인해요." },
  { id: "consultation-period", section: "상담 신청 · 4/5", scene: "consultation", target: "consultation-period", title: "예약 가능한 교시를 골라요", description: "선택한 날짜에 상담 가능한 교시를 확인하고 골라요. 회색으로 표시된 시간은 선택할 수 없어요. 선생님이나 날짜를 바꾸면 가능한 시간을 다시 확인해 주세요." },
  { id: "consultation-submit", section: "상담 신청 · 5/5", scene: "consultation", target: "consultation-submit", title: "마지막은 ‘상담 신청’ 버튼이에요", description: "실제 이용 시 내용을 확인한 뒤 이 버튼으로 상담을 신청해요. 신청 후에는 대시보드에서 처리 상태를 확인할 수 있어요. 여기서는 버튼 위치만 안내하며 상담을 신청하지 않아요." },
  { id: "recruit-search", section: "취업 공고 · 1/2", scene: "student-recruit", target: "recruit-search", title: "관심 있는 공고를 찾아요", description: "회사명·직무·내용을 검색하고 모집 상태와 직무 필터로 공고를 좁힐 수 있어요. ‘신청 폼 보기’에서는 공개된 신청 폼 목록을 확인해요." },
  { id: "recruit-detail", section: "취업 공고 · 2/2", scene: "student-recruit", target: "recruit-detail", title: "지원 전에 공고를 확인해요", description: "공고 상세 보기에서 채용 내용, 지원 마감과 면접 일정을 확인해요. 연결된 신청 폼이 있으면 해당 폼으로 지원을 이어갈 수 있어요. 다음 단계에서는 튜토리얼 전용 폼을 살펴볼게요." },
  { id: "form-list", section: "신청 폼 · 1/3", scene: "student-forms", target: "form-list", title: "신청할 폼을 선택해요", description: "신청 폼 목록에서 제목과 설명, 모집 상태를 확인하고 폼을 열어요. 지금 보이는 ‘잡담 체험 회사 지원서’는 이 튜토리얼에서만 보여주는 가상 폼이에요." },
  { id: "form-fields", section: "신청 폼 · 2/3", scene: "student-form", target: "form-fields", title: "질문을 읽고 응답해요", description: "별표가 있는 질문은 필수예요. 폼에 따라 글쓰기, 선택형, 날짜, 파일 첨부 등 질문이 달라질 수 있어요. 예시 폼에는 가상의 응답을 넣어 두었고, 파일 업로드나 응답 저장은 하지 않아요." },
  { id: "form-submit", section: "신청 폼 · 3/3", scene: "student-form", target: "form-submit", title: "응답을 확인하고 제출해요", description: "실제 이용 시 모든 필수 질문에 답한 뒤 ‘제출하기’를 눌러요. 튜토리얼은 제출 버튼 설명에서 마무리하며 실제 지원이나 제출은 일어나지 않아요." },
  { id: "student-account", section: "안내 완료", scene: "student-home", target: "account", title: "이제 잡담을 이용해 보세요", description: "상단 알림에서 새 소식을, 프로필에서 내 정보와 상담 내역을 확인해요. ‘잡담 시작하기’를 누르면 안내가 완료되고 원래 화면으로 돌아가요. 안내는 계정마다 한 번만 보여 드리며, 완료하면 다음부터는 표시되지 않아요." },
];

const TEACHER_STEPS: readonly TutorialStep[] = [
  { id: "teacher-navigation", section: "잡담 시작하기", scene: "teacher-schedule", target: "navigation", title: "선생님용 잡담을 안내해 드릴게요", description: "상단 메뉴에서 상담 일정, 취업 공고, 신청 폼 관리로 이동해요. 상담 관리부터 신청 폼 응답 확인까지 살펴볼게요. 모든 화면은 튜토리얼 전용 예시로, 실제 학생 정보나 신청을 변경하지 않아요." },
  { id: "calendar", section: "상담 일정 · 1/5", scene: "teacher-schedule", target: "calendar", title: "달력에서 날짜를 선택해요", description: "월을 이동하고 날짜를 선택하면 해당 주의 상담 시간표를 확인할 수 있어요. 달력의 오늘 표시와 선택한 날짜를 구분해서 확인해 주세요." },
  { id: "timetable", section: "상담 일정 · 2/5", scene: "teacher-schedule", target: "timetable", title: "시간표에서 상담 상태를 확인해요", description: "주간 시간표에서 교시별 수업과 상담 일정을 확인해요. 초록색은 상담 확정, 연한 초록색은 상담 대기, 회색은 예약 금지 상태예요. 상담을 선택하면 신청 정보를 볼 수 있어요." },
  { id: "requests", section: "상담 일정 · 3/5", scene: "teacher-schedule", target: "requests", title: "대기 중인 요청을 확인해요", description: "‘상담 예약 요청 목록’에서 학생과 신청 날짜·교시를 확인해요. 요청을 선택하면 학생이 작성한 상담 제목과 내용을 확인할 수 있어요. 다음은 가상의 신청 정보예요." },
  { id: "request-actions", section: "상담 일정 · 4/5", scene: "teacher-request", target: "request-actions", title: "신청 내용을 확인하고 처리해요", description: "실제 이용 시 ‘상담 수락’으로 일정을 확정하고, ‘상담 신청 취소’로 요청을 취소해요. 여기서는 버튼의 역할만 안내하며 실제 수락·취소는 실행하지 않아요." },
  { id: "slot-modes", section: "상담 일정 · 5/5", scene: "teacher-schedule", target: "slot-modes", title: "예약 금지와 추가 신청", description: "‘시간 금지 모드’에서는 시간표의 셀을 눌러 예약을 막거나 해제해요. ‘추가 신청’에서는 날짜·교시를 선택한 뒤 학생을 찾아 상담을 추가할 수 있어요. 실제 화면에서는 변경이 즉시 반영되므로 확인 후 이용해 주세요." },
  { id: "force-submit", section: "상담 추가 신청", scene: "teacher-request", target: "force-submit", title: "학생을 찾아 상담을 추가해요", description: "추가 신청에서 학생 이름이나 학번을 검색한 뒤 ‘추가’를 누르면 해당 시간에 상담이 예약돼요. 이 단계는 추가 버튼 설명으로 끝내며 실제 상담은 만들지 않아요." },
  { id: "banner", section: "학생 홈 배너", scene: "banner", target: "banner-editor", title: "학생에게 안내할 배너를 등록해요", description: "학생 대시보드에 표시할 배너 이미지를 선택하고 제목·내용·링크를 입력한 뒤 저장해요. 이미지는 필수예요. 이 예시는 안내용이며 이미지 업로드와 저장을 하지 않아요." },
  { id: "recruit-management", section: "취업 공고 관리", scene: "teacher-recruit", target: "recruit-management", title: "공고와 지원 현황을 관리해요", description: "공고를 작성·수정하고 지원자를 확인해요. 이미지로 AI 초안을 채운 뒤 내용을 검토할 수도 있어요. 신청 폼 제목에 회사명을 포함하면 공고와 연결되며, 전체 응답 보기로 지원 내용을 확인해요." },
  { id: "teacher-form-list", section: "신청 폼 관리 · 1/4", scene: "teacher-forms", target: "form-list", title: "기존 폼을 선택하거나 새로 만들어요", description: "신청 폼 관리에서 폼 목록과 초안·공개·마감 상태를 확인해요. 새 폼을 만들어 제목과 설명을 입력할 수 있어요. 여기서는 ‘잡담 체험 회사 지원서’라는 가상 폼을 사용해요." },
  { id: "form-editor", section: "신청 폼 관리 · 2/4", scene: "teacher-form-editor", target: "form-editor", title: "질문과 필수 응답을 설정해요", description: "질문을 추가해 단답형·장문형·선택형·파일 첨부 등 유형과 필수 여부를 정해요. 응답이 있는 폼은 질문 변경이 제한될 수 있어요. 튜토리얼에서는 예시 질문만 보여드려요." },
  { id: "form-publish", section: "신청 폼 관리 · 3/4", scene: "teacher-form-editor", target: "form-publish", title: "저장하고 공개하면 신청을 받을 수 있어요", description: "실제 이용 시 폼을 저장하고 공개하면 학생이 응답할 수 있어요. 모집을 끝내려면 마감해요. 여기서는 저장·공개·마감 버튼만 안내하고 실제 폼을 만들거나 공개하지 않아요." },
  { id: "form-responses", section: "신청 폼 관리 · 4/4", scene: "teacher-responses", target: "form-responses", title: "응답을 시트로 확인해요", description: "폼의 응답 보기에서 학생별 답변을 표로 확인하고 엑셀로 내려받을 수 있어요. 지금 보이는 이름과 답변은 모두 가상 데이터이며, 파일을 내려받지는 않아요." },
  { id: "teacher-account", section: "안내 완료", scene: "teacher-schedule", target: "account", title: "안내를 모두 확인했어요", description: "상단에서 알림과 프로필을 확인할 수 있어요. ‘잡담 시작하기’를 누르면 원래 화면으로 돌아가요. 안내는 계정마다 한 번만 보여 드리며, 완료하면 다음부터는 표시되지 않아요." },
];

export const getTutorialSteps = (role: TutorialRole): readonly TutorialStep[] => {
  if (role === "STUDENT") return STUDENT_STEPS;
  if (role === "TEACHER") return TEACHER_STEPS;
  return TEACHER_STEPS.filter((step) => ![
    "recruit-management", "teacher-form-list", "form-editor", "form-publish", "form-responses",
  ].includes(step.id)).map((step) => step.id === "teacher-navigation" ? {
    ...step,
    title: "Wee클래스 선생님을 위한 안내예요",
    description: "Wee클래스 상담 일정과 학생의 상담 요청을 관리하고 학생 홈 배너를 등록하는 방법을 살펴볼게요. 모든 정보는 튜토리얼 전용 예시이며, 실제 상담을 변경하거나 추가하지 않아요. ‘다음’을 눌러 시작해 주세요.",
  } : step);
};
