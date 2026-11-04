import type { InterceptedRequest, InterceptedResponse } from "@fsd/shared/api";
import type { TutorialRole } from "./progress.ts";

// 튜토리얼 동안만 쓰는 연습용 서버. 모든 데이터는 메모리에만 있고 안내가 끝나면 사라진다.
// 실제 서버로는 아무 요청도 보내지 않는다. (토큰 재발급·로그아웃·알림처럼 계정 자체에 필요한 요청만 통과)

type Kind = "course" | "common";
type Reservation = {
  id: number; kind: Kind; studentId: number; studentName: string; studentNumber: string;
  teacherId: number; teacherName: string; title: string; content: string; category: string;
  date: string; period: string; status: "WAITING" | "RESERVED" | "CANCELED";
};
type Question = { id: number; orderIndex: number; type: string; title: string; description: string | null; required: boolean; options: { id: number; orderIndex: number; label: string }[] };
type Form = { id: number; title: string; description: string | null; deadline: string | null; status: "DRAFT" | "PUBLISHED" | "CLOSED"; questions: Question[]; createdAt: string; updatedAt: string };
type Answer = { questionId: number; textValue?: string; optionIds?: number[]; fileId?: number };
type Submission = { id: number; formId: number; userId: number; userName: string; studentNumber: string; submittedAt: string; answers: Answer[] };
type Recruit = { id: number; companyName: string | null; interviewDate: string | null; deadline: string | null; summary: string | null; fields: string[]; imageUrl: string | null; formId: number | null; status: "DRAFT" | "PUBLISHED" | "CLOSED"; createdAt: string; updatedAt: string };

export type PracticeIdentity = { userId: number; name: string; role: TutorialRole };

const PASSTHROUGH: RegExp[] = [/^\/auth\/(reissue|logout|tutorial)/, /^\/api\/notifications/];
const ok = (data?: unknown, status = 200): InterceptedResponse => ({ handled: true, status, data });
const fail = (status: number, message: string): InterceptedResponse => ({ handled: true, status, message });

const pad = (value: number) => String(value).padStart(2, "0");
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 오늘 이후 n번째 평일
export const nextWeekday = (from: Date, n: number) => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let count = 0;
  while (count < n) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) count += 1;
  }
  return toDateKey(date);
};

const parseJson = (body: InterceptedRequest["body"]): Record<string, unknown> => {
  if (typeof body !== "string") return {};
  try {
    const value = JSON.parse(body) as unknown;
    return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;

export const PRACTICE_FORM_TITLE = "[연습] 잡담 체험 회사 지원서";
export const PRACTICE_COMPANY = "잡담 체험 회사";
export const PRACTICE_STUDENT = "체험학생";
export const PRACTICE_TEACHER = "체험 선생님";

export const createPracticeServer = (identity: PracticeIdentity, now = new Date()) => {
  const stamp = now.toISOString();
  const isStudent = identity.role === "STUDENT";
  const teacherId = isStudent ? 901 : identity.userId;
  const teacherName = isStudent ? PRACTICE_TEACHER : identity.name || PRACTICE_TEACHER;
  const studentId = isStudent ? identity.userId : 801;
  const studentName = isStudent ? identity.name || PRACTICE_STUDENT : PRACTICE_STUDENT;
  const homeKind: Kind = identity.role === "WEE_TEACHER" ? "common" : "course";
  let nextId = 5000;
  const id = () => (nextId += 1);

  const reservations: Reservation[] = [
    { id: id(), kind: homeKind, studentId, studentName, studentNumber: "2101", teacherId, teacherName, title: "진로에 대해 이야기하고 싶어요", content: "관심 있는 직무를 찾고 포트폴리오를 준비하는 방법이 궁금해요.", category: "취업", date: nextWeekday(now, 1), period: "3교시", status: "WAITING" },
    { id: id(), kind: homeKind, studentId: 802, studentName: "연습학생", studentNumber: "2102", teacherId, teacherName, title: "면접 준비 상담", content: "모의 면접을 해보고 싶어요.", category: "취업", date: nextWeekday(now, 2), period: "5교시", status: "RESERVED" },
  ];
  const locks = new Set<string>([`${homeKind}|${nextWeekday(now, 1)}|1교시`]);
  const students = [
    { id: 801, name: PRACTICE_STUDENT, student_number: "2101" },
    { id: 802, name: "연습학생", student_number: "2102" },
    { id: 803, name: "따라하기", student_number: "2103" },
  ];

  const question = (orderIndex: number, type: string, title: string, required: boolean, labels: string[] = []): Question => {
    const questionId = id();
    return { id: questionId, orderIndex, type, title, description: null, required, options: labels.map((label, index) => ({ id: id(), orderIndex: index, label })) };
  };
  const forms: Form[] = [{
    id: 9001, title: PRACTICE_FORM_TITLE, description: "튜토리얼에서만 쓰는 연습용 지원서예요. 제출해도 실제로 지원되지 않아요.",
    deadline: `${nextWeekday(now, 10)}T23:59:00`, status: "PUBLISHED", createdAt: stamp, updatedAt: stamp,
    questions: [
      question(0, "SHORT_TEXT", "이름", true),
      question(1, "SINGLE_CHOICE", "관심 직무", true, ["프론트엔드", "백엔드", "디자인"]),
      question(2, "LONG_TEXT", "지원 동기", false),
    ],
  }];
  const submissions: Submission[] = isStudent ? [] : [{
    id: id(), formId: 9001, userId: 802, userName: "연습학생", studentNumber: "2102", submittedAt: stamp,
    answers: [
      { questionId: forms[0].questions[0].id, textValue: "연습학생" },
      { questionId: forms[0].questions[1].id, optionIds: [forms[0].questions[1].options[0].id] },
      { questionId: forms[0].questions[2].id, textValue: "사용하기 편한 서비스를 만들고 싶어요." },
    ],
  }];
  // 학생이 필터를 바꿔 봐도 항상 결과가 보이도록, 직무 필터마다 하나씩 + 마감된 공고 하나를 둔다.
  const practiceRecruit = (recruitId: number, companyName: string, fields: string[], summary: string, deadline = nextWeekday(now, 10)): Recruit => ({
    id: recruitId, companyName, interviewDate: nextWeekday(now, 12), deadline, summary,
    fields, imageUrl: null, formId: 9001, status: "PUBLISHED", createdAt: stamp, updatedAt: stamp,
  });
  const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
  const recruits: Recruit[] = [
    practiceRecruit(7001, PRACTICE_COMPANY, ["FRONTEND", "BACKEND"], "학교에서 쌓은 경험으로 새로운 서비스를 함께 만들 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7002, "연습 풀스택 스튜디오", ["FULLSTACK"], "화면부터 서버까지 함께 만들어 볼 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7003, "연습 모바일 랩", ["MOBILE"], "학생들이 매일 쓰는 앱을 함께 만들 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7004, "연습 임베디드 공방", ["IOT"], "센서와 기기를 다루는 프로젝트를 함께할 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7005, "연습 데이터 연구소", ["AI"], "데이터를 모으고 모델을 만들어 볼 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7006, "연습 보안 센터", ["SECURITY"], "서비스를 안전하게 지키는 일을 함께할 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    practiceRecruit(7007, "연습 디자인 컴퍼니", ["ETC"], "기획·디자인 등 다양한 직무를 함께할 학생을 찾습니다. 튜토리얼 연습용 공고예요."),
    // 마감 공고는 모든 직무로 둬서 '마감된 공고' + 어떤 직무 필터를 함께 골라도 보인다.
    practiceRecruit(7008, "연습 마감 회사", ["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "IOT", "AI", "SECURITY", "ETC"], "지원 기간이 끝난 연습용 공고예요. ‘마감된 공고’ 필터에서 볼 수 있어요.", toDateKey(pastDate)),
  ];
  let banner: Record<string, unknown> | null = null;

  const formSummary = (form: Form) => ({
    id: form.id, title: form.title, description: form.description, deadline: form.deadline, status: form.status,
    questionCount: form.questions.length, createdAt: form.createdAt,
    submitted: submissions.some((item) => item.formId === form.id && item.userId === identity.userId),
  });
  const toSubmission = (item: Submission) => {
    const form = forms.find((candidate) => candidate.id === item.formId);
    return {
      id: item.id, formId: item.formId, formTitle: form?.title ?? "", userId: item.userId, userName: item.userName, studentNumber: item.studentNumber, submittedAt: item.submittedAt,
      answers: (form?.questions ?? []).map((q) => {
        const answer = item.answers.find((candidate) => candidate.questionId === q.id);
        const selected = q.options.filter((option) => answer?.optionIds?.includes(option.id));
        return { questionId: q.id, questionTitle: q.title, type: q.type, textValue: answer?.textValue ?? null, selectedOptionIds: selected.map((option) => option.id), selectedOptionLabels: selected.map((option) => option.label), fileId: null, fileName: null, fileSize: null, fileDownloadUrl: null };
      }),
    };
  };
  const toQuestions = (input: unknown): Question[] => (Array.isArray(input) ? input : []).map((raw, index) => {
    const value = typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : {};
    return question(index, text(value.type, "SHORT_TEXT"), text(value.title, `질문 ${index + 1}`), value.required === true, Array.isArray(value.options) ? value.options.filter((item): item is string => typeof item === "string") : []);
  });
  const studentView = (item: Reservation) => ({ id: item.id, name: item.studentName, teacherId: item.teacherId, teacherName: item.teacherName, title: item.title, content: item.content, category: item.category, date: item.date, period: item.period, status: item.status });
  const teacherView = (item: Reservation) => ({ reservation_id: item.id, name: item.studentName, student_number: item.studentNumber, title: item.title, content: item.content, category: item.category, date: item.date, period: item.period });
  const reservationInput = (kind: Kind, body: Record<string, unknown>, overrides: Partial<Reservation> = {}): Reservation => ({
    id: id(), kind, studentId, studentName, studentNumber: "2101", teacherId, teacherName,
    title: text(body.title), content: text(body.content), category: text(body.category, "기타"),
    date: text(body.date), period: text(body.period), status: "WAITING", ...overrides,
  });

  const handle = ({ method, path, body }: InterceptedRequest): InterceptedResponse => {
    if (PASSTHROUGH.some((pattern) => pattern.test(path))) return { handled: false };
    const [pathname, search = ""] = path.split("?");
    const query = new URLSearchParams(search);
    const json = parseJson(body);
    let match: RegExpMatchArray | null;

    // ── 공통 ──
    if (pathname === "/activity/events") return ok(undefined, 204);
    if (pathname === "/auth/profile" && method === "GET") return ok({ name: identity.name || (isStudent ? PRACTICE_STUDENT : PRACTICE_TEACHER), email: "practice@gsm.hs.kr", student_number: isStudent ? "2101" : "" });
    if (pathname === "/schedules" || pathname === "/student/timetable") return ok([]);

    // ── 학생 상담 ──
    if ((match = pathname.match(/^\/student\/(course|common)\/teachers$/))) {
      return ok(match[1] === "course" ? [{ id: 901, name: PRACTICE_TEACHER }] : [{ id: 902, name: "체험 wee 선생님" }]);
    }
    if ((match = pathname.match(/^\/student\/(course|common)\/status$/))) {
      const date = query.get("date") ?? "";
      const kind = match[1] as Kind;
      const taken = reservations.filter((item) => item.kind === kind && item.date === date && item.status !== "CANCELED");
      return ok(taken.map((item) => ({ teacherId: item.teacherId, date, period: item.period, state: item.status, available: false })));
    }
    if ((match = pathname.match(/^\/student\/(course|common)$/))) {
      const kind = match[1] as Kind;
      if (method === "GET") return ok(reservations.filter((item) => item.kind === kind && item.studentId === studentId).map(studentView));
      if (method === "POST") {
        const teacher = Number(json.teacherId);
        const created = reservationInput(kind, json, { teacherId: Number.isFinite(teacher) ? teacher : teacherId, teacherName: kind === "course" ? PRACTICE_TEACHER : "체험 wee 선생님" });
        reservations.push(created);
        return ok("상담 신청이 완료되었습니다.");
      }
    }
    if ((match = pathname.match(/^\/student\/(course|common)\/cancel\/(\d+)$/))) {
      const target = reservations.find((item) => item.id === Number(match?.[2]));
      if (target) target.status = "CANCELED";
      return ok("상담이 취소되었습니다.");
    }
    if ((match = pathname.match(/^\/student\/(course|common)\/(\d+)$/)) && method === "PATCH") {
      const target = reservations.find((item) => item.id === Number(match?.[2]));
      if (target) Object.assign(target, { title: text(json.title, target.title), content: text(json.content, target.content), category: text(json.category, target.category), date: text(json.date, target.date), period: text(json.period, target.period) });
      return ok({});
    }

    // ── 교사 상담 ──
    if ((match = pathname.match(/^\/teacher\/(course|common)\/pending$/))) {
      return ok(reservations.filter((item) => item.kind === match?.[1] && item.status === "WAITING").map(teacherView));
    }
    if ((match = pathname.match(/^\/teacher\/(course|common)\/status$/))) {
      const kind = match[1] as Kind;
      const date = query.get("date") ?? "";
      const items = [
        ...[...locks].filter((key) => key.startsWith(`${kind}|${date}|`)).map((key) => ({ teacherId, date, period: key.split("|")[2], state: "LOCKED", available: false })),
        ...reservations.filter((item) => item.kind === kind && item.date === date && item.status !== "CANCELED").map((item) => ({ teacherId, date, period: item.period, state: item.status, available: false })),
      ];
      return ok(items);
    }
    if ((match = pathname.match(/^\/teacher\/(course|common)\/(allow|reject)\/(\d+)$/))) {
      const target = reservations.find((item) => item.id === Number(match?.[3]));
      if (target) target.status = match[2] === "allow" ? "RESERVED" : "CANCELED";
      return ok(match[2] === "allow" ? "상담을 수락했습니다." : "상담을 취소했습니다.");
    }
    if ((match = pathname.match(/^\/teacher\/(course|common)\/(lock|unlock)$/))) {
      const key = `${match[1]}|${text(json.date)}|${text(json.period)}`;
      if (match[2] === "lock") locks.add(key); else locks.delete(key);
      return ok("변경되었습니다.");
    }
    if ((match = pathname.match(/^\/teacher\/(course|common)\/force$/))) {
      const student = students.find((item) => item.id === Number(json.studentId)) ?? students[0];
      reservations.push(reservationInput(match[1] as Kind, json, { studentId: student.id, studentName: student.name, studentNumber: student.student_number, status: "RESERVED" }));
      return ok("상담을 추가했습니다.");
    }
    if ((match = pathname.match(/^\/teacher\/(course|common)$/))) {
      return ok(reservations.filter((item) => item.kind === match?.[1] && item.status === "RESERVED").map(teacherView));
    }
    if (pathname === "/teacher/students") return ok(students);

    // ── 배너 ──
    if (pathname === "/student/banner" || (pathname === "/teacher/banner" && method === "GET")) return banner ? ok(banner) : ok(undefined, 204);
    if (pathname === "/teacher/banner" && method === "POST") {
      const form = body instanceof FormData ? body : null;
      const image = form?.get("image");
      banner = {
        id: id(), title: text(form?.get("title")) || null, content: text(form?.get("content")) || null, link: text(form?.get("link")) || null,
        imageUrl: image instanceof Blob ? URL.createObjectURL(image) : `${typeof window === "undefined" ? "" : window.location.origin}/JobdamIcon.svg`,
        createdAt: stamp, updatedAt: stamp,
      };
      return ok(banner);
    }

    // ── 취업 공고 ──
    if (pathname === "/recruit" || (pathname === "/teacher/recruit" && method === "GET")) {
      return ok(pathname === "/recruit" ? recruits.filter((item) => item.status === "PUBLISHED") : recruits);
    }
    if ((match = pathname.match(/^\/recruit\/(\d+)$/))) {
      const recruit = recruits.find((item) => item.id === Number(match?.[1]));
      return recruit ? ok(recruit) : fail(404, "공고를 찾을 수 없습니다.");
    }
    if (pathname === "/teacher/recruit/analyze") {
      const draft: Recruit = { id: id(), companyName: "AI가 채운 연습 회사", interviewDate: null, deadline: nextWeekday(now, 15), summary: "이미지에서 읽어 온 내용이 여기에 채워져요. 실제 이용 시 내용을 꼭 검토해 주세요.", fields: ["ETC"], imageUrl: null, formId: null, status: "DRAFT", createdAt: stamp, updatedAt: stamp };
      recruits.unshift(draft);
      return ok(draft);
    }
    if (pathname === "/teacher/recruit" && method === "POST") {
      const created: Recruit = { id: id(), companyName: text(json.companyName) || null, interviewDate: text(json.interviewDate) || null, deadline: text(json.deadline) || null, summary: text(json.summary) || null, fields: Array.isArray(json.fields) ? json.fields.filter((item): item is string => typeof item === "string") : [], imageUrl: null, formId: null, status: "DRAFT", createdAt: stamp, updatedAt: stamp };
      recruits.unshift(created);
      return ok(created);
    }
    if ((match = pathname.match(/^\/teacher\/recruit\/(\d+)(\/publish)?$/))) {
      const index = recruits.findIndex((item) => item.id === Number(match?.[1]));
      if (index < 0) return fail(404, "공고를 찾을 수 없습니다.");
      if (method === "DELETE") { recruits.splice(index, 1); return ok(undefined, 204); }
      if (match[2]) recruits[index] = { ...recruits[index], status: "PUBLISHED" };
      else if (method === "PATCH") recruits[index] = { ...recruits[index], ...json, id: recruits[index].id } as Recruit;
      return ok(recruits[index]);
    }
    if (pathname === "/api/notices/channels") return ok([]);
    if (pathname === "/api/notices/send") return ok("0");

    // ── 신청 폼 (학생) ──
    if (pathname === "/form") return ok(forms.filter((form) => form.status !== "DRAFT").map(formSummary));
    if ((match = pathname.match(/^\/form\/(\d+)$/))) {
      const form = forms.find((item) => item.id === Number(match?.[1]));
      return form ? ok(form) : fail(404, "폼을 찾을 수 없습니다.");
    }
    if ((match = pathname.match(/^\/student\/form\/(\d+)\/submission$/))) {
      const formId = Number(match[1]);
      const existing = submissions.find((item) => item.formId === formId && item.userId === identity.userId);
      if (method === "GET") return existing ? ok(toSubmission(existing)) : fail(404, "제출한 응답이 없습니다.");
      const answers = Array.isArray(json.answers) ? json.answers as Answer[] : [];
      if (existing) { existing.answers = answers; return ok(toSubmission(existing)); }
      const created: Submission = { id: id(), formId, userId: identity.userId, userName: studentName, studentNumber: "2101", submittedAt: new Date().toISOString(), answers };
      submissions.push(created);
      return ok(toSubmission(created));
    }
    if ((match = pathname.match(/^\/student\/form\/(\d+)\/file$/))) {
      const form = body instanceof FormData ? body.get("file") : null;
      const name = form instanceof File ? form.name : "연습파일";
      return ok({ id: id(), originalName: name, contentType: "application/octet-stream", size: form instanceof Blob ? form.size : 0, downloadUrl: "", uploadedAt: stamp });
    }

    // ── 신청 폼 (교사) ──
    if (pathname === "/teacher/form") {
      if (method === "GET") return ok(forms.map(formSummary));
      const created: Form = { id: id(), title: text(json.title, "새 폼"), description: text(json.description) || null, deadline: null, status: "DRAFT", questions: toQuestions(json.questions), createdAt: stamp, updatedAt: stamp };
      forms.push(created);
      return ok(created);
    }
    if ((match = pathname.match(/^\/teacher\/form\/(\d+)\/submission\/excel$/))) {
      return ok(new Blob(["이름,학번\n연습학생,2102\n"], { type: "text/csv" }));
    }
    if ((match = pathname.match(/^\/teacher\/form\/(\d+)\/submission\/(\d+)$/))) {
      const item = submissions.find((candidate) => candidate.id === Number(match?.[2]));
      return item ? ok(toSubmission(item)) : fail(404, "응답을 찾을 수 없습니다.");
    }
    if ((match = pathname.match(/^\/teacher\/form\/(\d+)\/submission$/))) {
      return ok(submissions.filter((item) => item.formId === Number(match?.[1])).map((item) => toSubmission(item)));
    }
    if ((match = pathname.match(/^\/teacher\/form\/(\d+)(?:\/(publish|close))?$/))) {
      const form = forms.find((item) => item.id === Number(match?.[1]));
      if (!form) return fail(404, "폼을 찾을 수 없습니다.");
      if (match[2] === "publish") form.status = "PUBLISHED";
      else if (match[2] === "close") form.status = "CLOSED";
      else if (method === "PATCH") {
        form.title = text(json.title, form.title);
        form.description = text(json.description, form.description ?? "") || null;
        if (Array.isArray(json.questions)) form.questions = toQuestions(json.questions);
      }
      form.updatedAt = new Date().toISOString();
      return ok(form);
    }
    if (pathname.startsWith("/form/file/")) return ok(new Blob(["연습용 파일"], { type: "text/plain" }));

    // 연습 중에는 어떤 요청도 실제 서버로 보내지 않는다. 모르는 조회는 빈 값, 변경은 성공한 것처럼 답한다.
    return method === "GET" ? ok([]) : ok({});
  };

  return { handle };
};
