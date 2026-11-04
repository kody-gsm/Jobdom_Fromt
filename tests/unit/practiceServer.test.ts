import assert from "node:assert/strict";
import { createPracticeServer, nextWeekday } from "../../src/fsd/features/role-tutorial/model/practiceServer.ts";
import { RECRUIT_FIELD_OPTIONS } from "../../src/fsd/entities/recruit/model/fields.ts";
import { filterRecruits } from "../../src/fsd/pages/recruit/model/recruitFilters.ts";
import { matchesRoute } from "../../src/fsd/features/role-tutorial/model/steps.ts";

const now = new Date(2026, 10, 6, 9, 0); // 금요일
assert.equal(nextWeekday(now, 1), "2026-11-09"); // 주말을 건너뛴 다음 평일

type Handled = { handled: true; status: number; data?: unknown; message?: string };
const call = (server: ReturnType<typeof createPracticeServer>, method: string, path: string, body?: unknown) => {
  const result = server.handle({ method, path, body: body === undefined ? undefined : JSON.stringify(body) });
  assert.equal(result.handled, true, `${method} ${path} must stay inside the practice server`);
  return result as Handled;
};

// 계정 자체에 필요한 요청만 실제 서버로 통과시킨다.
const student = createPracticeServer({ userId: 1, name: "김학생", role: "STUDENT" }, now);
for (const path of ["/auth/reissue", "/auth/logout", "/auth/tutorial", "/auth/tutorial/complete", "/api/notifications/subscribe-ticket"]) {
  assert.equal(student.handle({ method: "POST", path, body: undefined }).handled, false, path);
}
// 알림은 연습용 1건을 직접 열어 읽어 본다. 읽으면 개수가 0이 된다.
assert.deepEqual(call(student, "GET", "/api/notifications/unread-count").data, { unreadCount: 1 });
const practiceNotifications = call(student, "GET", "/api/notifications?page=0&size=20").data as { content: { id: number; targetUrl: string; isRead: boolean }[] };
assert.equal(practiceNotifications.content.length, 1);
assert.equal(practiceNotifications.content[0].targetUrl, "/form/9001"); // 학생 알림 단계 화면(/forms/9001)으로 이어진다.
call(student, "PATCH", `/api/notifications/${practiceNotifications.content[0].id}/read`);
assert.deepEqual(call(student, "GET", "/api/notifications/unread-count").data, { unreadCount: 0 });
const teacherNotifications = call(createPracticeServer({ userId: 77, name: "박선생", role: "TEACHER" }, now), "GET", "/api/notifications").data as { content: { targetUrl: string }[] };
assert.match(teacherNotifications.content[0].targetUrl, /^\/teacher\/course\/\d+$/); // 교사 알림은 상담 일정(/teacher)으로 이어진다.

// 모르는 변경 요청도 실제 서버로 보내지 않는다.
assert.equal(call(student, "DELETE", "/teacher/anything/123").status, 200);

// 학생: 상담 신청 → 목록에 대기 상태로 보인다.
const before = call(student, "GET", "/student/course").data as { status: string }[];
assert.equal(before.length, 1);
call(student, "POST", "/student/course", { teacherId: 901, title: "연습 상담", content: "내용", category: "취업", date: "2026-11-13", period: "2교시" });
const after = call(student, "GET", "/student/course").data as { title: string; status: string; teacherName: string }[];
assert.equal(after.length, 2);
assert.deepEqual([after[1].title, after[1].status, after[1].teacherName], ["연습 상담", "WAITING", "체험 선생님"]);
// 신청한 교시는 그 날짜에 다시 고를 수 없다.
const slots = call(student, "GET", "/student/course/status?teacherId=901&date=2026-11-13").data as { period: string; available: boolean }[];
assert.deepEqual(slots.map((slot) => [slot.period, slot.available]), [["2교시", false]]);

// 학생: 공고 → 폼 → 제출하면 내 응답과 제출 여부가 보인다.
assert.equal((call(student, "GET", "/recruit").data as { formId: number }[])[0].formId, 9001);
assert.equal(call(student, "GET", "/student/form/9001/submission").status, 404);
const form = call(student, "GET", "/form/9001").data as { questions: { id: number; options: { id: number }[] }[] };
const submitted = call(student, "POST", "/student/form/9001/submission", { answers: [
  { questionId: form.questions[0].id, textValue: "김학생" },
  { questionId: form.questions[1].id, optionIds: [form.questions[1].options[1].id] },
] }).data as { answers: { selectedOptionLabels: string[] }[] };
assert.deepEqual(submitted.answers[1].selectedOptionLabels, ["백엔드"]);
assert.equal(call(student, "GET", "/student/form/9001/submission").status, 200);
assert.equal((call(student, "GET", "/form").data as { submitted: boolean }[])[0].submitted, true);

// 교사: 대기 요청 수락 → 확정 목록으로 이동, 예약 금지 토글, 학생 추가
const teacher = createPracticeServer({ userId: 77, name: "박선생", role: "TEACHER" }, now);
const pending = call(teacher, "GET", "/teacher/course/pending").data as { reservation_id: number; name: string }[];
assert.equal(pending.length, 1);
call(teacher, "PATCH", `/teacher/course/allow/${pending[0].reservation_id}`);
assert.equal((call(teacher, "GET", "/teacher/course/pending").data as unknown[]).length, 0);
assert.equal((call(teacher, "GET", "/teacher/course").data as unknown[]).length, 2);
call(teacher, "POST", "/teacher/course/lock", { date: "2026-11-11", period: "4교시" });
const locked = call(teacher, "GET", "/teacher/course/status?teacherId=77&date=2026-11-11").data as { state: string }[];
assert.deepEqual(locked.map((slot) => slot.state), ["LOCKED"]);
call(teacher, "POST", "/teacher/course/unlock", { date: "2026-11-11", period: "4교시" });
assert.equal((call(teacher, "GET", "/teacher/course/status?teacherId=77&date=2026-11-11").data as unknown[]).length, 0);
call(teacher, "POST", "/teacher/course/force", { studentId: 803, title: "추가", content: "", category: "기타", date: "2026-11-12", period: "1교시" });
assert.ok((call(teacher, "GET", "/teacher/course").data as { name: string }[]).some((item) => item.name === "따라하기"));

// 교사: 폼 응답 시트와 폼 공개
assert.equal((call(teacher, "GET", "/teacher/form/9001/submission").data as unknown[]).length, 1);
const created = call(teacher, "POST", "/teacher/form", { title: "새 연습 폼", description: "", questions: [{ type: "SHORT_TEXT", title: "이름", description: "", required: true, options: [] }] }).data as { id: number; status: string };
assert.equal(created.status, "DRAFT");
assert.equal((call(teacher, "POST", `/teacher/form/${created.id}/publish`).data as { status: string }).status, "PUBLISHED");

// 연습 서버마다 데이터가 따로라서, 다시 시작하면 처음 상태로 돌아간다.
const fresh = createPracticeServer({ userId: 1, name: "김학생", role: "STUDENT" }, now);
assert.equal((call(fresh, "GET", "/student/course").data as unknown[]).length, 1);

// 튜토리얼에서 어떤 필터를 골라도 연습용 공고가 하나 이상 보인다.
{
  const list = call(createPracticeServer({ userId: 1, name: "김학생", role: "STUDENT" }, now), "GET", "/recruit").data as Parameters<typeof filterRecruits>[0];
  for (const filter of ["ALL", "OPEN", "CLOSED"] as const) {
    assert.ok(filterRecruits(list, filter, "", now).length > 0, filter);
    for (const option of RECRUIT_FIELD_OPTIONS) assert.ok(filterRecruits(list, filter, "", now, [option.value]).length > 0, `${filter} ${option.value}`);
  }
  // 필터로 고른 다른 연습 공고 상세 화면에서도 안내가 이어진다.
  for (const item of list) assert.ok(matchesRoute("/recruit/7001", `/recruit/${item.id}`), String(item.id));
  assert.equal(matchesRoute("/recruit/7001", "/recruit/123"), false);
}

console.log("practice server tests passed");
