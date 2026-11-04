import type { Metadata } from "next";
import { PassReportPage } from "@fsd/pages/pass-report";

export const metadata: Metadata = { title: "면접 합격 보고" };

export default function Page() {
  return <PassReportPage />;
}
