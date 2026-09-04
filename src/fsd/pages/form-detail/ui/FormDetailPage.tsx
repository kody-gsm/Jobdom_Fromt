import Link from "next/link";
import { SubmitForm } from "@fsd/features/submit-form";
import { SiteHeader } from "@fsd/widgets/site-header";

export const FormDetailPage = ({ formId }: { formId: number }) => (
  <>
    <SiteHeader />
    <main className="min-h-[calc(100vh-5rem)] bg-[#eef5f0] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/forms" className="text-sm font-semibold text-gray-500">
          ← 폼 목록
        </Link>
        <div className="mt-6">
          <SubmitForm formId={formId} />
        </div>
      </div>
    </main>
  </>
);
