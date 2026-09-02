import {
  backfillRememberLoginEmail,
  clearStoredSession,
  isRememberedSession,
  persistSession,
  readAccessToken,
  readRememberedSession,
  readSession,
} from "./authSession.ts";

export type ConsultationKind = "course" | "common";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  student_number: string;
  emailVerified: boolean;
}

export interface StudentSyncResult {
  syncedCount: number;
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

export interface RecruitDashboardRow {
  recruit: Recruit;
  form: FormSummary | null;
  applicants: FormSubmissionSummary[];
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

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
    if (role === "ADMIN") return "ADMIN";
    return role === "TEACHER" ? "TEACHER" : "STUDENT";
  } catch {
    return "STUDENT";
  }
};

export const saveSession = (response: Omit<AuthSession, "role">, rememberLogin = false) => {
  const session: AuthSession = { ...response, role: decodeRole(response.accessToken) };
  persistSession(session, rememberLogin);
  window.dispatchEvent(new Event("jobdam-session"));
  return session;
};

export const getSession = (): AuthSession | null => readSession();

export const clearSession = () => {
  const session = getSession();
  if (session) backfillRememberLoginEmail(session.email);
  clearStoredSession();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("jobdam-session"));
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

const reissueSession = async (refreshToken: string, rememberLogin: boolean) => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/reissue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", 0);
  }
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  const data = await response.json() as Omit<AuthSession, "role">;
  return saveSession(data, rememberLogin);
};

export const restoreRememberedSession = async () => {
  const remembered = readRememberedSession();
  if (!remembered?.refreshToken) return null;
  return remembered;
};

let reissuePromise: Promise<AuthSession | null> | null = null;

const reissueCurrentSession = async () => {
  if (reissuePromise) return reissuePromise;
  const session = getSession();
  if (!session?.refreshToken) return null;
  reissuePromise = reissueSession(session.refreshToken, isRememberedSession());
  try {
    return await reissuePromise;
  } finally {
    reissuePromise = null;
  }
};

const request = async <T>(path: string, init: RequestInit = {}, retryAuth = true): Promise<T> => {
  const token = readAccessToken();
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
    if (response.status === 401 && retryAuth && getSession()?.refreshToken) {
      try {
        await reissueCurrentSession();
        return request<T>(path, init, false);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) throw error;
      }
    }
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

export const login = async (email: string, password: string, rememberLogin = false) => {
  const response = await request<Omit<AuthSession, "role">>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return saveSession(response, rememberLogin);
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

export const syncStudents = () =>
  request<StudentSyncResult>("/admin/students/sync", { method: "POST" });

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

const normalizeName = (value: string) =>
  value.toLowerCase().replace(/주식회사|㈜|\(주\)/g, "").replace(/[\s()[\]{}.,·ㆍ_-]/g, "");

export const findRecruitForm = (recruit: Recruit, forms: FormSummary[]) => {
  const company = normalizeName(recruit.companyName || "");
  if (!company) return null;

  // ponytail: 백엔드에 recruitId 연결이 생기면 제목 기반 임시 매칭을 그 ID 비교로 교체한다.
  return forms.find((form) => normalizeName(form.title).includes(company)) || null;
};

export const getRecruitDashboard = async (): Promise<RecruitDashboardRow[]> => {
  const [recruits, forms] = await Promise.all([getTeacherRecruits(), getTeacherForms()]);
  const matches = recruits.map((recruit) => ({ recruit, form: findRecruitForm(recruit, forms) }));
  const formIds = [...new Set(matches.flatMap(({ form }) => form ? [form.id] : []))];
  const submissions = new Map(await Promise.all(
    formIds.map(async (formId) => [formId, await getFormSubmissions(formId)] as const),
  ));

  return matches.map(({ recruit, form }) => ({
    recruit,
    form,
    applicants: form ? submissions.get(form.id) || [] : [],
  }));
};
