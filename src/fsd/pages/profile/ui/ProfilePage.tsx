"use client";

import Image from "next/image";
import { ContentCard } from "@fsd/shared/ui";
import { ProfileConsultations } from "@fsd/widgets/profile-consultations";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useProfilePage } from "../model/useProfilePage.ts";

export const ProfilePage = () => {
  const {
    profile,
    profileAvatar,
    avatarError,
    loading,
    error,
    handleCancel,
    handleAvatarChange,
  } = useProfilePage();

  return (
    <div
      className="min-h-dvh bg-surface text-ink"

    >
      <StudentHeader />
      <main className="mx-auto w-full max-w-[840px] px-6 py-10 lg:px-10 lg:py-12">
        {loading ? (
          <ContentCard className="py-24 text-center text-muted">프로필을 불러오는 중…</ContentCard>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-[#9A4F45]">
            {error}
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <ContentCard className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-28 w-28 overflow-hidden rounded-full bg-[#EEF3F8] shadow-sm ring-4 ring-white">
                  <Image
                    src={profileAvatar || "/profileIcon.svg"}
                    alt="프로필 사진"
                    width={112}
                    height={112}
                    unoptimized={Boolean(profileAvatar)}
                    className={
                      profileAvatar
                        ? "h-full w-full object-cover"
                        : "h-full w-full object-contain p-7"
                    }
                  />
                </div>
                <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft">
                  사진 변경
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) handleAvatarChange(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {avatarError ? (
                  <p role="alert" className="mt-2 text-sm text-[#C9342B]">
                    {avatarError}
                  </p>
                ) : null}
                <h1 className="mt-3 text-2xl font-bold text-ink">
                  {profile.name || "사용자"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {profile.studentId || "정보 없음"}
                </p>
              </div>
            </ContentCard>

            <ProfileConsultations
              reservations={profile.reservations}
              onCancel={handleCancel}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
};
