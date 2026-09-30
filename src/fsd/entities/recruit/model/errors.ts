type ErrorLike = { code?: string; message?: string };

const asError = (error: unknown): ErrorLike =>
  typeof error === "object" && error !== null ? error as ErrorLike : {};

export const getRecruitErrorMessage = (error: unknown, fallback: string) => {
  const current = asError(error);
  if (current.code === "RECRUIT_NOT_PUBLISHED") return "아직 공개되지 않은 공고입니다.";
  if (current.code === "RECRUIT_CLOSED") return "서류 접수가 마감된 공고입니다.";
  return current.message || fallback;
};
