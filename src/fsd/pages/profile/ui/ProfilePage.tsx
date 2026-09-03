"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { ProfileConsultations } from "@fsd/widgets/profile-consultations";
import { SiteHeader } from "@fsd/widgets/site-header";
import { fetchUserProfile } from "../api/profile.ts";
import type { UserProfileData } from "../model/buildUserProfileData.ts";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchUserProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "프로필을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async (id: number) => {
    await cancelProfileConsultation(id);
    setProfile((current) => current ? {
      ...current,
      reservations: current.reservations.filter((item) => item.id !== id),
      history: current.history.filter((item) => item.id !== id),
    } : current);
  };

  const handleSaveMemo = (id: number, memo: string) => {
    setProfile((current) => current ? {
      ...current,
      history: current.history.map((item) =>
        item.id === id ? { ...item, myMemo: memo } : item,
      ),
    } : current);
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          {loading ? (
            <p className="py-24 text-center text-gray-400">프로필을 불러오는 중…</p>
          ) : error ? (
            <p role="alert" className="rounded-2xl bg-red-50 p-5 text-red-700">{error}</p>
          ) : profile ? (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="h-28 bg-green-500" />
                <div className="flex flex-col items-center pb-8">
                  <div className="-mt-14 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-green-50 shadow-md">
                    <Image src="/profileIcon.svg" alt="profile" width={45} height={45} />
                  </div>
                  <h1 className="mt-4 text-2xl font-bold text-gray-900">
                    {profile.name || "사용자"}
                  </h1>
                  <p className="mt-1 font-medium text-gray-400">
                    {profile.studentId}
                  </p>
                </div>
              </section>

              <ProfileConsultations
                reservations={profile.reservations}
                history={profile.history}
                onCancel={handleCancel}
                onSaveMemo={handleSaveMemo}
              />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
};
