import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: { absolute: "잡담 | 공고 지원" } };

export default async function RecruitApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/recruit/${id}`);
}
