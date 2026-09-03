export const createRecruitApplyUrl = (origin: string, recruitId: number) =>
  `${origin.replace(/\/$/, "")}/recruit/${recruitId}/apply`;
