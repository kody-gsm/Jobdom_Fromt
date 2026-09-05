import Link from "next/link";
import { SubmitForm } from "@fsd/features/submit-form";
import { StudentHeader } from "@fsd/widgets/student-header";

export const FormDetailPage = ({ formId }: { formId: number }) => (
  <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
    <StudentHeader />
    <main className="mx-auto w-full max-w-[900px] px-6 py-10 lg:px-10 lg:py-12">
      <Link href="/forms" className="text-sm font-bold text-[#607089] hover:text-[#13233A]">
        ← 폼 목록
      </Link>
      <section className="mt-5 rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10">
        <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">FORM RESPONSE</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">신청 폼 작성</h1>
        <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#C8D4E2] sm:text-base">
          필수 항목을 확인한 뒤 내용을 작성하고 제출해주세요.
        </p>
      </section>
      <div className="mt-6">
        <SubmitForm formId={formId} />
      </div>
    </main>
  </div>
);
