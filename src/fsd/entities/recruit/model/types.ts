import type { RecruitField } from "./fields.ts";

export interface Recruit {
  id: number;
  companyName: string | null;
  interviewDate: string | null;
  deadline: string | null;
  summary: string | null;
  fields?: RecruitField[];
  imageUrl?: string | null;
  formId?: number | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export type RecruitCategory = "기업" | "공공기관";

export type RecruitUpdate = Pick<
  Recruit,
  "companyName" | "interviewDate" | "deadline" | "summary" | "fields"
>;
