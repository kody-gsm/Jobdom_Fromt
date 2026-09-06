import type { FormSummary } from "@fsd/entities/form";

export const PREVIEW_FORMS: FormSummary[] = [
  {
    id: -1001,
    title: "2026 취업 희망 기업 조사",
    description: "취업 희망 분야와 관심 기업을 확인하기 위한 사전 조사입니다.",
    status: "PUBLISHED",
    questionCount: 5,
    createdAt: "2026-09-07T09:00:00",
  },
  {
    id: -1002,
    title: "현장실습 참여 신청",
    description: "현장실습 참여 희망 여부와 기본 정보를 제출해주세요.",
    status: "PUBLISHED",
    questionCount: 7,
    createdAt: "2026-09-06T09:00:00",
  },
];

export const withFormPreviewFallback = (forms: FormSummary[]) =>
  forms.length > 0 ? forms : PREVIEW_FORMS;
