export interface Recruit {
  id: number;
  companyName: string | null;
  interviewDate: string | null;
  deadline: string | null;
  summary: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
}

export type RecruitUpdate = Pick<
  Recruit,
  "companyName" | "interviewDate" | "deadline" | "summary"
>;
