import { FormDetailPage } from "@fsd/pages/form-detail";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formId = Number(id);
  if (!Number.isSafeInteger(formId) || formId <= 0) notFound();
  return <FormDetailPage formId={formId} />;
}
