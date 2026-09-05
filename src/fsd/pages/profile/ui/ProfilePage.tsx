"use client";

import Image from "next/image";
import { ContentCard } from "@fsd/shared/ui";
import { ProfileConsultations } from "@fsd/widgets/profile-consultations";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useProfilePage } from "../model/useProfilePage.ts";

export const ProfilePage = () => {
  const {
    profile,
    loading,
    error,
    handleCancel,
    handleSaveMemo,
  } = useProfilePage();

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1080px] px-6 py-10 lg:px-10 lg:py-12">
        <section className="rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10 lg:px-12">
          <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">PROFILE</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">나의 상담 현황</h1>
          <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#C8D4E2] sm:text-base">
            예약된 상담과 지난 상담 기록을 확인하고 필요한 메모를 한곳에서 관리할 수 있습니다.
          </p>
        </section>

        {loading ? (
          <ContentCard className="mt-6 py-24 text-center text-[#8A95A3]">프로필을 불러오는 중…</ContentCard>
        ) : error ? (
          <div role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-[#9A4F45]">
            {error}
          </div>
        ) : profile ? (
          <div className="mt-6 space-y-6">
            <ContentCard className="overflow-hidden p-0">
              <div className="h-24 bg-[#10243E]" />
              <div className="flex flex-col items-center px-6 pb-8">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF3F8] shadow-sm">
                  <Image src="/profileIcon.svg" alt="프로필" width={42} height={42} />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[#13233A]">
                  {profile.name || "사용자"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#8A95A3]">
                  학번 {profile.studentId || "정보 없음"}
                </p>
              </div>
            </ContentCard>

            <ProfileConsultations
              reservations={profile.reservations}
              history={profile.history}
              onCancel={handleCancel}
              onSaveMemo={handleSaveMemo}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
};
