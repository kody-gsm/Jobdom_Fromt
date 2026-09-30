import type { Metadata } from "next";
import { FormDetailPage } from "@fsd/pages/form-detail";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "신청 폼" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formId = Number(id);
  if (!Number.isSafeInteger(formId) || formId <= 0) notFound();
  return <FormDetailPage formId={formId} />;
}
