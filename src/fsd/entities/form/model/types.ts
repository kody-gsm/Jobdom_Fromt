export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "NUMBER"
  | "DATE"
  | "FILE";

export type FormStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface FormSummary {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  status: FormStatus;
  questionCount: number;
  createdAt: string;
}

export interface FormQuestionOption {
  id: number;
  orderIndex: number;
  label: string;
}

export interface FormQuestion {
  id: number;
  orderIndex: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  options: FormQuestionOption[];
}

export interface FormQuestionInput {
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[];
}

export interface FormInput {
  title: string;
  description: string;
  questions: FormQuestionInput[];
}
export interface DynamicForm extends Omit<FormSummary, "questionCount"> {
  questions: FormQuestion[];
  updatedAt: string;
}

export interface FormAnswerInput {
  questionId: number;
  textValue?: string;
  optionIds?: number[];
  fileId?: number;
}

export interface FormFileUpload {
  id: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string;
  uploadedAt: string;
}

export interface FormSubmissionSummary {
  id: number;
  userId: number;
  userName: string;
  studentNumber: string;
  submittedAt: string;
}

export interface FormAnswer {
  questionId: number;
  questionTitle: string;
  type: QuestionType;
  textValue: string | null;
  selectedOptionIds: number[];
  selectedOptionLabels: string[];
  fileId: number | null;
  fileName: string | null;
  fileSize: number | null;
  fileDownloadUrl: string | null;
}

export interface FormSubmission extends FormSubmissionSummary {
  formId: number;
  formTitle: string;
  answers: FormAnswer[];
}
