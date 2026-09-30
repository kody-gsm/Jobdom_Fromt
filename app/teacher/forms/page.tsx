import type { Metadata } from "next";
import { TeacherFormsPage } from "@fsd/pages/teacher-forms";

export const metadata: Metadata = { title: "폼 관리" };

export default function Page() {
  return <TeacherFormsPage />;
}
