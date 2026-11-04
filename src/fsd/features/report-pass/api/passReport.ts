import { requestWithSession } from "@fsd/entities/user";

// 학생이 취업 합격을 선생님에게 알린다. 회사명만 보낸다.
export const submitPassReport = (companyName: string) =>
  requestWithSession<unknown>("/student/pass-report", {
    method: "POST",
    body: JSON.stringify({ companyName }),
  });
