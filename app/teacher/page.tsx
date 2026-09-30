import type { Metadata } from "next";
import { TeacherPage } from "@fsd/pages/teacher";

export const metadata: Metadata = { title: "상담 일정" };

export default function Page() {
  return <TeacherPage />;
}
