import { RecruitDetailPage } from "@fsd/pages/recruit-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecruitDetailPage recruitId={Number(id)} />;
}
