import type { Metadata } from "next";
import { FormsPage } from "@fsd/pages/forms";

export const metadata: Metadata = { title: "신청 폼" };

export default function Page() {
  return <FormsPage />;
}
