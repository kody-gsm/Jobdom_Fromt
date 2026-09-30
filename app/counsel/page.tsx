import type { Metadata } from "next";
import { CounselPage } from "@fsd/pages/counsel";

export const metadata: Metadata = { title: "상담 신청" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <CounselPage initialType={type === "general" ? "general" : "career"} />;
}
