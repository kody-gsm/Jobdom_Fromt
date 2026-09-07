import type { ConsultationType } from "@fsd/entities/consultation";
import { ConsultationForm } from "@fsd/features/submit-consultation";
import { StudentHeader } from "@fsd/widgets/student-header";

export const CounselPage = ({ initialType }: { initialType: ConsultationType }) => (
  <div
    className="min-h-dvh bg-surface text-ink"

  >
    <StudentHeader />
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
      <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">상담 신청</h1>
      <div className="mt-6">
        <ConsultationForm initialType={initialType} />
      </div>
    </main>
  </div>
);