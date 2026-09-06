import type { Recruit } from "@fsd/entities/recruit";

export const PREVIEW_RECRUITS: Recruit[] = [
  {
    id: -2001,
    companyName: "광주테크솔루션",
    summary: "프론트엔드 개발자를 채용합니다. 웹 서비스 개발과 UI 개선 업무를 함께합니다.",
    deadline: "2026-09-25",
    interviewDate: "2026-09-29",
    status: "PUBLISHED",
    createdAt: "2026-09-07T09:00:00",
    updatedAt: "2026-09-07T09:00:00",
  },
  {
    id: -2002,
    companyName: "스마트소프트",
    summary: "웹 서비스 개발 직무 신입 인재를 모집합니다. 학교 프로젝트 경험을 우대합니다.",
    deadline: "2026-10-02",
    interviewDate: "2026-10-06",
    status: "PUBLISHED",
    createdAt: "2026-09-06T09:00:00",
    updatedAt: "2026-09-06T09:00:00",
  },
];

export const withRecruitPreviewFallback = (items: Recruit[]) =>
  items.length > 0 ? items : PREVIEW_RECRUITS;
