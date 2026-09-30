import type { Metadata } from "next";
import { FormSubmissionsPage } from "@fsd/pages/teacher-form-submissions";

export const metadata: Metadata = { title: "폼 응답" };

export default function Page() {
  return <FormSubmissionsPage />;
}
