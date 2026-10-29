import type { RecruitField } from "./fields.ts";

export interface Recruit {
  id: number;
  companyName: string | null;
  interviewDate: string | null;
  deadline: string | null;
  summary: string | null;
  fields?: RecruitField[];
  imageUrl?: string | null;
  /** 올린 순서대로 담긴 공고 이미지. 첫 번째가 imageUrl과 같다. */
  images?: RecruitImage[];
  formId?: number | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export type RecruitImage = { id: number; url: string };

export type RecruitCategory = "기업" | "공공기관";

export type RecruitNoticeChannel = { id: string; name: string; categoryName: string | null };

export type RecruitUpdate = Pick<
  Recruit,
  "companyName" | "interviewDate" | "deadline" | "summary" | "fields"
>;
