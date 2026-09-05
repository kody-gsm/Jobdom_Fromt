import { useEffect, useState } from "react";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { fetchUserProfile } from "../api/profile.ts";
import type { UserProfileData } from "./buildUserProfileData.ts";

export const useProfilePage = () => {
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

  return {
    profile,
    loading,
    error,
    handleCancel,
    handleSaveMemo,
  };
};
