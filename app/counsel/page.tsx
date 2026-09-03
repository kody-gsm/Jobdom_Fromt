import { CounselPage } from "@fsd/pages/counsel";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <CounselPage initialType={type === "general" ? "general" : "career"} />;
}
