import { useEffect, useState } from "react";
import {
  getProfileAvatarUserKey,
  getSession,
  type UserRole,
  saveProfileAvatar,
  validateProfileAvatarFile,
} from "@fsd/entities/user";
import { RESERVATION_CHANGED_EVENT } from "@fsd/entities/consultation";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { fetchUserProfile, uploadProfileImage } from "../api/profile.ts";
import type { UserProfileData } from "./buildUserProfileData.ts";

export const useProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setUserRole(getSession()?.role ?? null);
    });

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        if (!active) return;
        setProfile(data);
        setProfileAvatar(data.avatarUrl || null);
        setError("");
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : "프로필을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfile();
    const handleReservationChange = () => void loadProfile();
    window.addEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);

    return () => {
      active = false;
      window.removeEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);
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

    void uploadProfileImage(file)
      .then((imageUrl) => {
        setProfileAvatar(imageUrl || URL.createObjectURL(file));
        const session = getSession();
        saveProfileAvatar(
          getProfileAvatarUserKey({ email: session?.email, name: session?.name }),
          imageUrl,
        );
        setAvatarError("");
      })
      .catch(() => setAvatarError("프로필 이미지를 저장하지 못했습니다."));
  };

  return {
    profile,
    profileAvatar,
    avatarError,
    loading,
    error,
    userRole,
    handleCancel,
    handleAvatarChange,
  };
};
