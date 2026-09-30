type ErrorLike = { code?: string; message?: string };

const asError = (error: unknown): ErrorLike =>
  typeof error === "object" && error !== null ? error as ErrorLike : {};

export const getFormErrorMessage = (error: unknown, fallback: string) => {
  const current = asError(error);
  if (current.code === "FORM_NOT_PUBLISHED") return "아직 공개되지 않은 폼입니다.";
  if (current.code === "FORM_CLOSED") return "마감된 폼입니다. 더 이상 응답을 받지 않습니다.";
  return current.message || fallback;
};
