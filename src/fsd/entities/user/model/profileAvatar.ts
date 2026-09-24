export const MAX_PROFILE_AVATAR_BYTES = 5 * 1024 * 1024;
export const PROFILE_AVATAR_CHANGED_EVENT = "jobdam:profile-avatar-changed";

export const getProfileAvatarUserKey = ({
  email,
  studentId,
  name,
}: { email?: string; studentId?: string; name?: string }) =>
  studentId?.trim() || email?.trim().toLowerCase() || name?.trim() || "student";

export const getProfileAvatarStorageKey = (userKey: string) =>
  `jobdam.profile-avatar.${userKey}`;

export const validateProfileAvatarFile = (file: { type: string; size: number }) => {
  if (!file.type.startsWith("image/")) return "이미지 파일만 선택할 수 있습니다.";
  if (file.size > MAX_PROFILE_AVATAR_BYTES) {
    return "프로필 이미지는 5MB 이하만 사용할 수 있습니다.";
  }
  return null;
};

export const readProfileAvatar = (userKey: string) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(getProfileAvatarStorageKey(userKey));
};

export const saveProfileAvatar = (userKey: string, dataUrl: string) => {
  if (typeof window === "undefined") return;
  if (dataUrl) window.localStorage.setItem(getProfileAvatarStorageKey(userKey), dataUrl);
  else window.localStorage.removeItem(getProfileAvatarStorageKey(userKey));
  window.dispatchEvent(new CustomEvent(PROFILE_AVATAR_CHANGED_EVENT, { detail: { userKey } }));
};
