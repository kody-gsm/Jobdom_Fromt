import { RecruitDetailPage } from "@fsd/pages/recruit-detail";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recruitId = Number(id);
  if (!Number.isSafeInteger(recruitId) || recruitId <= 0) notFound();
  return <RecruitDetailPage recruitId={recruitId} />;
}
