import { useEffect, useRef, useState } from "react";
import {
  getProfileAvatarUserKey,
  getSession,
  saveProfileAvatar,
  validateProfileAvatarFile,
} from "@fsd/entities/user";
import { uploadProfileAvatar } from "../api/uploadProfileAvatar.ts";

const getSessionUserKey = () => {
  const session = getSession();
  return {
    session,
    userKey: getProfileAvatarUserKey({
      email: session?.email,
      studentId: session?.userId?.toString(),
      name: session?.name,
    }),
  };
};

export const useChangeProfileAvatar = (onChanged: (imageUrl: string) => void) => {
  const [avatarError, setAvatarError] = useState("");
  const uploadRequestVersion = useRef(0);

  useEffect(() => {
    const invalidateUpload = () => {
      uploadRequestVersion.current += 1;
    };
    window.addEventListener("jobdam-session", invalidateUpload);
    return () => window.removeEventListener("jobdam-session", invalidateUpload);
  }, []);

  const handleAvatarChange = (file: File) => {
    const validationError = validateProfileAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    const { session, userKey } = getSessionUserKey();
    if (!session) {
      setAvatarError("로그인 후 프로필 이미지를 변경할 수 있습니다.");
      return;
    }
    const requestVersion = ++uploadRequestVersion.current;

    void uploadProfileAvatar(file)
      .then((imageUrl) => {
        const latest = getSessionUserKey();
        if (
          requestVersion !== uploadRequestVersion.current ||
          latest.userKey !== userKey ||
          !latest.session
        ) return;
        const nextAvatar = imageUrl || URL.createObjectURL(file);
        onChanged(nextAvatar);
        saveProfileAvatar(userKey, nextAvatar);
        setAvatarError("");
      })
      .catch(() => {
        if (requestVersion === uploadRequestVersion.current) {
          setAvatarError("프로필 이미지를 저장하지 못했습니다.");
        }
      });
  };

  return { avatarError, handleAvatarChange };
};
