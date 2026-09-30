import type { Metadata } from "next";
import { TeacherRecruitPage } from "@fsd/pages/teacher-recruit";

export const metadata: Metadata = { title: "취업 공고 관리" };

export default function Page() {
  return <TeacherRecruitPage />;
}
