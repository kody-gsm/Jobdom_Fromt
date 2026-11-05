import { requestWithSession } from "@fsd/entities/user";

// 학생이 면접 합격을 진로 선생님들에게 알린다. 학번·이름은 서버가 로그인 정보로 채우므로 기업 이름만 보낸다.
export const submitPassReport = (companyName: string) =>
  requestWithSession<unknown>("/student/pass-report", {
    method: "POST",
    body: JSON.stringify({ companyName }),
  });

export type PassReport = {
  id: number;
  studentNumber: string;
  studentName: string;
  companyName: string;
  submittedAt: string;
};

// 진로 선생님: 지금까지 들어온 면접 합격 보고 전체(학번순)
export const getPassReports = () => requestWithSession<PassReport[]>("/teacher/pass-report", { cache: "no-store" });
