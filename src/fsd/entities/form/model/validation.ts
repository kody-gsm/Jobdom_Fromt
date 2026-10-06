import { FORM_TEXT_LIMITS } from "./types.ts";
import type { FormInput, FormQuestion } from "./types.ts";
import type { FormValue } from "./answers.ts";

export const FORM_EDITOR_LIMITS = { TITLE: 255, DESCRIPTION: 1000, OPTION: 255 } as const;
export const FORM_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const FORM_FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.zip,.doc,.docx,.ppt,.pptx,.hwp,.hwpx,.txt,.md";

export const getFormFileError = (file: File) => {
  if (file.size === 0) return "빈 파일은 첨부할 수 없습니다.";
  if (file.size > FORM_FILE_MAX_BYTES) return "파일은 최대 10MB까지 첨부할 수 있습니다.";
  const dot = file.name.lastIndexOf(".");
  const extension = dot < 0 ? "" : file.name.slice(dot).toLowerCase();
  if (!FORM_FILE_ACCEPT.split(",").includes(extension)) return "지원하는 형식의 파일을 선택해주세요.";
  return "";
};

export const getFormValueError = (question: FormQuestion, value: FormValue | undefined): string => {
  if (value === undefined) return "";
  if (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(question.type)) {
    if (!Array.isArray(value)) return "제공된 선택지를 선택해주세요.";
    if (question.type !== "MULTIPLE_CHOICE" && value.length > 1) return "하나의 선택지만 선택할 수 있습니다.";
    if (new Set(value).size !== value.length) return "선택지를 중복해서 선택할 수 없습니다.";
    if (value.some((id) => !question.options.some((option) => option.id === id))) return "이 질문에 있는 선택지를 선택해주세요.";
    return "";
  }
  if (question.type === "FILE") {
    if (typeof value === "string" || Array.isArray(value)) return "파일을 첨부해주세요.";
    if (value.file) return getFormFileError(value.file);
    if (value.fileId !== undefined && (!Number.isSafeInteger(value.fileId) || value.fileId <= 0)) return "유효한 파일을 첨부해주세요.";
    return "";
  }
  if (typeof value !== "string") return "이 항목에는 값을 직접 입력해주세요.";
  const text = value.trim();
  if (!text) return "";
  if (question.type === "SHORT_TEXT" || question.type === "LONG_TEXT") {
    const limit = FORM_TEXT_LIMITS[question.type];
    if (value.length > limit) return `최대 ${limit.toLocaleString("ko-KR")}자까지 입력할 수 있습니다.`;
  }
  if (question.type === "NUMBER"
    && (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text) || !Number.isFinite(Number(text)))) {
    return "유효한 숫자를 입력해주세요. 음수와 소수도 입력할 수 있습니다.";
  }
  if (question.type === "DATE") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || text < "0001-01-01") return "유효한 날짜를 YYYY-MM-DD 형식으로 입력해주세요.";
    const date = new Date(`${text}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) return "존재하는 날짜를 입력해주세요.";
  }
  return "";
};

export const getInvalidFormAnswer = (questions: FormQuestion[], values: Record<number, FormValue>) => {
  for (const question of questions) {
    const message = getFormValueError(question, values[question.id]);
    if (message) return { question, message };
  }
  return null;
};

export const getFormInputLimitError = (input: FormInput): string => {
  if (input.title.length > FORM_EDITOR_LIMITS.TITLE) return "폼 제목은 최대 255자까지 입력할 수 있습니다.";
  if (input.description.length > FORM_EDITOR_LIMITS.DESCRIPTION) return "폼 설명은 최대 1,000자까지 입력할 수 있습니다.";
  for (const [index, question] of input.questions.entries()) {
    if (question.title.length > FORM_EDITOR_LIMITS.TITLE) return `질문 ${index + 1}의 제목은 최대 255자까지 입력할 수 있습니다.`;
    if (question.description.length > FORM_EDITOR_LIMITS.DESCRIPTION) return `질문 ${index + 1}의 설명은 최대 1,000자까지 입력할 수 있습니다.`;
    if (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(question.type)
      && question.options.some((option) => option.length > FORM_EDITOR_LIMITS.OPTION)) return `질문 ${index + 1}의 보기는 최대 255자까지 입력할 수 있습니다.`;
  }
  return "";
};
