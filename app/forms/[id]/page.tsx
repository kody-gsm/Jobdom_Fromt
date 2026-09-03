import { FormDetailPage } from "@fsd/pages/form-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormDetailPage formId={Number(id)} />;
}
