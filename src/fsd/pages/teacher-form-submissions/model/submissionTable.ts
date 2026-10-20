import type { FormAnswer } from "@fsd/entities/form";

export const formatSubmissionDate = (value: string): string => {
  const timestamp = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}+09:00`;
  return new Date(timestamp).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
};

export const getAnswerText = (answer: FormAnswer | undefined): string => {
  if (!answer) return "";
  if (answer.fileId !== null || answer.fileName) return answer.fileName || "첨부 파일";
  if (answer.selectedOptionLabels.length) return answer.selectedOptionLabels.join(", ");
  return answer.textValue ?? "";
};

export const getSpreadsheetColumnLabel = (index: number): string => {
  let label = "";
  let column = index + 1;
  while (column > 0) {
    column -= 1;
    label = String.fromCharCode(65 + column % 26) + label;
    column = Math.floor(column / 26);
  }
  return label;
};
