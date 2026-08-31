export type ConsultationKind = "course" | "common";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER";
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  student_number: string;
  emailVerified: boolean;
}

export interface ReservationInput {
  title: string;
  content: string;
  date: string;
  period: string;
}

export interface StudentReservation {
  id: number;
  name: string;
  date: string;
  period: string;
}

export interface TeacherReservation {
  reservation_id: number;
  name: string;
  date: string;
  period: string;
}

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

export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "NUMBER"
  | "DATE";

export type FormStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface FormSummary {
  id: number;
  title: string;
  description: string | null;
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

export interface DynamicForm extends Omit<FormSummary, "questionCount"> {
  questions: FormQuestion[];
  updatedAt: string;
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

export interface FormAnswerInput {
  questionId: number;
  textValue?: string;
  optionIds?: number[];
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
}

export interface FormSubmission extends FormSubmissionSummary {
  formId: number;
  formTitle: string;
  answers: FormAnswer[];
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
const TOKEN_KEY = "jobdam_access_token";
const SESSION_KEY = "jobdam_session";

export class ApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.status = status;
  }
}

const decodeRole = (token: string): AuthSession["role"] => {
  try {
    const raw = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = raw.padEnd(Math.ceil(raw.length / 4) * 4, "=");
    const role = JSON.parse(atob(payload)).role;
    return role === "TEACHER" ? "TEACHER" : "STUDENT";
  } catch {
    return "STUDENT";
  }
};

export const saveSession = (response: Omit<AuthSession, "role">) => {
  const session: AuthSession = { ...response, role: decodeRole(response.accessToken) };
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("jobdam-session"));
  return session;
};

export const getSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("jobdam-session"));
};

const parseError = async (response: Response) => {
  if ([502, 503, 504].includes(response.status)) return "백엔드 서버에 연결할 수 없습니다.";
  const text = await response.text();
  if (response.status === 500 && text.trim() === "Internal Server Error") return "백엔드 서버에 연결할 수 없습니다.";
  if (!text) return `요청에 실패했습니다. (${response.status})`;
  try {
    const data = JSON.parse(text);
    return data.message || data.error || text;
  } catch {
    return text;
  }
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", 0);
  }
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(await parseError(response), response.status);
  }
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  if (response.headers.get("content-type")?.includes("application/json")) {
    return JSON.parse(text) as T;
  }
  return text as T;
};

export const login = async (email: string, password: string) => {
  const response = await request<Omit<AuthSession, "role">>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return saveSession(response);
};

export const signup = (input: { email: string; password: string; verificationCode: string }) =>
  request<UserResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const sendSignupVerificationCode = (email: string) =>
  request<void>("/auth/email/signup-code", { method: "POST", body: JSON.stringify({ email }) });

export const sendPasswordResetCode = (email: string) =>
  request<void>("/auth/email/password-reset-code", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (email: string, verificationCode: string, newPassword: string) =>
  request<void>("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ email, verificationCode, newPassword }),
  });

export const logout = async () => {
  const refreshToken = getSession()?.refreshToken;
  clearSession();
  if (refreshToken) await request<void>("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) });
};

export const createConsultation = (kind: ConsultationKind, input: ReservationInput) =>
  request<string>(`/student/${kind}`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const cancelConsultation = (kind: ConsultationKind, id: number) =>
  request<string>(`/student/${kind}/cancel/${id}`, { method: "PATCH" });

export const getStudentConsultations = (kind: ConsultationKind) =>
  request<StudentReservation[]>(`/student/${kind}`);

export const getUpcomingConsultations = (kind: ConsultationKind) =>
  request<StudentReservation[]>(`/student/${kind}`);

export const getTeacherConsultations = (kind: ConsultationKind) =>
  request<TeacherReservation[]>(`/teacher/${kind}`);

export const approveConsultation = (kind: ConsultationKind, id: number) =>
  request<string>(`/teacher/${kind}/allow/${id}`, { method: "PATCH" });

export const lockConsultation = (
  kind: ConsultationKind,
  input: Pick<ReservationInput, "date" | "period">,
) =>
  request<string>(`/teacher/${kind}/lock`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getTeacherIds = () => request<number[]>("/teacher");

export const analyzeRecruit = (image: File) => {
  const body = new FormData();
  body.append("image", image);
  return request<Recruit>("/teacher/recruit/analyze", { method: "POST", body });
};

export const updateRecruit = (id: number, input: RecruitUpdate) =>
  request<Recruit>(`/teacher/recruit/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const publishRecruit = (id: number) =>
  request<Recruit>(`/teacher/recruit/${id}/publish`, { method: "POST" });

export const getTeacherRecruits = () => request<Recruit[]>("/teacher/recruit");
export const getRecruits = () => request<Recruit[]>("/recruit");
export const getRecruit = (id: number) => request<Recruit>(`/recruit/${id}`);

export const createForm = (input: FormInput) =>
  request<DynamicForm>("/teacher/form", { method: "POST", body: JSON.stringify(input) });

export const updateForm = (id: number, input: FormInput) =>
  request<DynamicForm>(`/teacher/form/${id}`, { method: "PATCH", body: JSON.stringify(input) });

export const publishForm = (id: number) =>
  request<DynamicForm>(`/teacher/form/${id}/publish`, { method: "POST" });

export const closeForm = (id: number) =>
  request<DynamicForm>(`/teacher/form/${id}/close`, { method: "POST" });

export const getTeacherForms = () => request<FormSummary[]>("/teacher/form");
export const getTeacherForm = (id: number) => request<DynamicForm>(`/teacher/form/${id}`);
export const getForms = () => request<FormSummary[]>("/form");
export const getForm = (id: number) => request<DynamicForm>(`/form/${id}`);

export const submitForm = (id: number, answers: FormAnswerInput[]) =>
  request<FormSubmission>(`/student/form/${id}/submission`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });

export const getMyFormSubmission = (id: number) =>
  request<FormSubmission>(`/student/form/${id}/submission`);

export const getFormSubmissions = (id: number) =>
  request<FormSubmissionSummary[]>(`/teacher/form/${id}/submission`);

export const getFormSubmission = (formId: number, submissionId: number) =>
  request<FormSubmission>(`/teacher/form/${formId}/submission/${submissionId}`);
