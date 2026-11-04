"use client";

import { PassReportForm } from "@fsd/features/report-pass";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";

export const PassReportPage = () => (
  <div className="min-h-dvh bg-surface text-ink">
    <StudentHeader />
    <main className="mx-auto w-full max-w-[640px] px-6 py-10 lg:py-12">
      <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">합격 보고</h1>
      <p className="mt-3 break-keep text-sm leading-6 text-secondary-text">
        취업에 합격했다면 회사명을 적어 선생님께 알려 주세요.
      </p>
      <ContentCard className="mt-8 p-7">
        <PassReportForm />
      </ContentCard>
    </main>
  </div>
);
