import assert from "node:assert/strict";
import {
  canEditConsultation,
  toConsultationDetailItem,
  toConsultationUpdateInput,
} from "../../src/fsd/entities/consultation/model/detail.ts";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";

assert.equal(canEditConsultation("WAITING"), true);
assert.equal(canEditConsultation("RESERVED"), false);
assert.equal(canEditConsultation("CANCELED"), false);

assert.deepEqual(
  toConsultationDetailItem("course", {
    id: 7,
    name: "학생",
    teacherId: 12,
    teacherName: "홍길동",
    title: "진로 상담",
    content: "상담 내용",
    category: "취업",
    date: "2026-10-05",
    period: "1교시",
    status: "WAITING",
  }),
  {
    id: 14,
    reservationId: 7,
    kind: "course",
    type: "진로상담",
    teacherId: 12,
    teacherName: "홍길동 선생님",
    title: "진로 상담",
    content: "상담 내용",
    category: "취업",
    date: "2026-10-05",
    period: "1교시",
    status: "WAITING",
  },
);

assert.deepEqual(
  toConsultationUpdateInput({
    title: "  상담 제목  ",
    content: "  상담 내용\n",
    category: "학업",
  }),
  {
    title: "상담 제목",
    content: "상담 내용",
    category: "학업",
  },
);

const requests: Array<{ path: string; init?: RequestInit }> = [];
const api = createConsultationApi(async <T>(path: string, init?: RequestInit) => {
  requests.push({ path, init });
  return {} as T;
});

await api.update("course", 42, {
  title: "수정한 제목",
  content: "수정한 내용",
  category: "진학",
});

assert.equal(requests[0]?.path, "/student/course/42");
assert.equal(requests[0]?.init?.method, "PATCH");
assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
  title: "수정한 제목",
  content: "수정한 내용",
  category: "진학",
});
