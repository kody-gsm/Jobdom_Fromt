import type { FormSubmissionSummary, FormSummary } from "@fsd/entities/form";
import type { Recruit, RecruitUpdate } from "@fsd/entities/recruit";

export type RecruitDashboardRow = {
  recruit: Recruit;
  form: FormSummary | null;
  applicants: FormSubmissionSummary[];
};

export type { Recruit, RecruitUpdate };
