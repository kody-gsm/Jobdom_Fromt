import Link from "next/link";
import { SubmitForm } from "@fsd/features/submit-form";
import { StudentHeader } from "@fsd/widgets/student-header";

export const FormDetailPage = ({ formId }: { formId: number }) => (
  <div className="min-h-dvh bg-surface text-ink">
    <StudentHeader />
    <main className="mx-auto w-full max-w-[980px] px-6 py-10 lg:px-10 lg:py-12">
      <Link href="/forms" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-[#607089] transition-colors hover:bg-[#EEF3F8] hover:text-ink">
        ← 폼 목록
      </Link>
      <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">신청 폼 작성</h1>
      <div className="mt-6">
        <SubmitForm formId={formId} />
      </div>
    </main>
  </div>
);