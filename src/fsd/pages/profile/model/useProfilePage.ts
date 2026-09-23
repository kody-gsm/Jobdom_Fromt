import { useEffect, useRef, useState } from "react";
import {
  getProfileAvatarUserKey,
  getSession,
  type UserRole,
  saveProfileAvatar,
  validateProfileAvatarFile,
} from "@fsd/entities/user";
import {
  createConsultationRefreshCoordinator,
  RESERVATION_CHANGED_EVENT,
} from "@fsd/entities/consultation";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import {
  fetchProfileReservations,
  fetchUserProfile,
  uploadProfileImage,
} from "../api/profile.ts";
import type { UserProfileData } from "./buildUserProfileData.ts";

export const useProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [reservations, setReservations] = useState<UserProfileData["reservations"]>([]);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationLoading, setReservationLoading] = useState(true);
  const [reservationError, setReservationError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const profileRequests = useRef(createRequestVersionGuard());
  const reservationRefresh = useRef(createConsultationRefreshCoordinator());
  const refreshReservationsRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setUserRole(getSession()?.role ?? null);
    });

    const refreshReservations = async () => {
      const requestVersion = reservationRefresh.current.beginRefresh();
      if (requestVersion === null) return;
      setReservationLoading(true);
      setReservationError("");
      try {
        const reservations = await fetchProfileReservations();
        if (!active || !reservationRefresh.current.isLatest(requestVersion)) return;
        setReservations(reservations);
        setReservationError("");
        setReservationLoading(false);
      } catch (caught) {
        if (active && reservationRefresh.current.isLatest(requestVersion)) {
          setReservationError(
            caught instanceof Error ? caught.message : "예약을 불러오지 못했습니다.",
          );
          setReservationLoading(false);
        }
      }
    };
    refreshReservationsRef.current = refreshReservations;

    const loadProfile = async () => {
      const requestVersion = profileRequests.current.next();
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        if (!active || !profileRequests.current.isLatest(requestVersion)) return;
        setProfile(data);
        setProfileAvatar(data.avatarUrl || null);
        setError("");
        setLoading(false);
      } catch (caught) {
        if (active && profileRequests.current.isLatest(requestVersion)) {
          setError(
            caught instanceof Error ? caught.message : "프로필을 불러오지 못했습니다.",
          );
          setLoading(false);
        }
      }
    };

    void loadProfile();
    void refreshReservations();
    const handleReservationChange = () => void refreshReservations();
    window.addEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);

    return () => {
      active = false;
      window.removeEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);
    };
  }, []);

  const handleCancel = async (id: number) => {
    reservationRefresh.current.startCancellation(id);
    profileRequests.current.next();
    let canceled = false;

    try {
      await cancelProfileConsultation(id);
      setReservations((current) => current.filter((item) => item.id !== id));
      canceled = true;
    } finally {
      const shouldRefresh = reservationRefresh.current.finishCancellation(id);
      if (canceled || shouldRefresh) {
        await refreshReservationsRef.current?.();
      }
    }
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

  const profileWithReservations = profile
    ? { ...profile, reservations }
    : null;

  return {
    profile: profileWithReservations,
    profileAvatar,
    avatarError,
    loading,
    error,
    reservationLoading,
    reservationError,
    retryReservations: () => refreshReservationsRef.current?.(),
    userRole,
    handleCancel,
    handleAvatarChange,
  };
};
