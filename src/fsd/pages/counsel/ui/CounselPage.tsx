import type { ConsultationType } from "@fsd/entities/consultation";
import { ConsultationForm } from "@fsd/features/submit-consultation";
import { StudentHeader } from "@fsd/widgets/student-header";

export const CounselPage = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => (
  <div
    className="min-h-dvh bg-[#F4F6F8] text-[#13233A]"
    style={{ fontFamily: '"Pretendard Variable", sans-serif' }}
  >
    <StudentHeader />
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
      <section className="rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10 lg:px-12">
        <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">CONSULTATION</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          상담 신청을 차근차근 진행해보세요
        </h1>
        <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#C8D4E2] sm:text-base">
          상담 유형과 내용을 작성한 뒤 선생님과 가능한 일정을 선택하면 신청이 완료됩니다.
        </p>
      </section>
      <div className="mt-6">
        <ConsultationForm initialType={initialType} />
      </div>
    </main>
  </div>
);
