import { useEffect, useState } from "react";
import { validateProfileAvatarFile } from "@fsd/entities/user";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { fetchUserProfile, uploadProfileImage } from "../api/profile.ts";
import type { UserProfileData } from "./buildUserProfileData.ts";

export const useProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchUserProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setProfileAvatar(data.avatarUrl || null);
      })
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "프로필을 불러오지 못했습니다.",
          );
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
    setProfile((current) =>
      current
        ? {
            ...current,
            reservations: current.reservations.filter((item) => item.id !== id),
          }
        : current,
    );
  };

  const handleAvatarChange = (file: File) => {
    const validationError = validateProfileAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }
    if (!profile) {
      setAvatarError("프로필을 불러온 뒤 이미지를 변경해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setAvatarError("프로필 이미지를 읽지 못했습니다.");
        return;
      }

      try {
        void uploadProfileImage(file)
          .then((imageUrl) => setProfileAvatar(imageUrl || URL.createObjectURL(file)))
          .catch(() => setAvatarError("프로필 이미지를 저장하지 못했습니다."));
        setAvatarError("");
      } catch {
        setAvatarError("프로필 이미지를 저장하지 못했습니다.");
      }
    };
    reader.onerror = () => setAvatarError("프로필 이미지를 읽지 못했습니다.");
    reader.readAsDataURL(file);
  };

  return {
    profile,
    profileAvatar,
    avatarError,
    loading,
    error,
    handleCancel,
    handleAvatarChange,
  };
};
