import type { Metadata } from "next";
import { RecruitPage } from "@fsd/pages/recruit";

export const metadata: Metadata = { title: "취업 공고" };

export default function Page() {
  return <RecruitPage />;
}
