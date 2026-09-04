import type { ConsultationType } from "@fsd/entities/consultation";
import { ConsultationForm } from "@fsd/features/submit-consultation";
import { SiteHeader } from "@fsd/widgets/site-header";

export const CounselPage = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => (
  <>
    <SiteHeader />
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6f8f7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-bold text-[#02a946]">CONSULTATION</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
          상담 신청
        </h1>
        <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-gray-500 sm:text-base">
          상담 주제와 원하는 일정을 선택하면 취업진로부 선생님과 상담을 신청할 수 있습니다.
        </p>
        <div className="mt-8">
          <ConsultationForm initialType={initialType} />
        </div>
      </div>
    </main>
  </>
);
