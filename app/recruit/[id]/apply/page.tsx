import { redirect } from "next/navigation";

export default async function RecruitApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/recruit/${id}`);
}
