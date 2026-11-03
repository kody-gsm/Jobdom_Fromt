import { useEffect, useRef, useState } from "react";
import {
  getProfileAvatarUserKey,
  getSession,
  getSessionVersion,
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
  const isUploading = useRef(false);

  useEffect(() => {
    let sessionVersion = getSessionVersion();
    const invalidateUpload = () => {
      uploadRequestVersion.current += 1;
    };
    const onSessionChanged = () => {
      const latestVersion = getSessionVersion();
      if (latestVersion === sessionVersion) return;
      sessionVersion = latestVersion;
      invalidateUpload();
    };
    window.addEventListener("jobdam-session", onSessionChanged);
    window.addEventListener("storage", invalidateUpload);
    return () => {
      invalidateUpload();
      window.removeEventListener("jobdam-session", onSessionChanged);
      window.removeEventListener("storage", invalidateUpload);
    };
  }, []);

  const handleAvatarChange = (file: File) => {
    if (isUploading.current) {
      setAvatarError("프로필 이미지를 저장 중입니다. 완료 후 다시 선택해주세요.");
      return;
    }
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
    const sessionVersion = getSessionVersion();
    isUploading.current = true;
    const isCurrent = () => {
      const latest = getSessionUserKey();
      return requestVersion === uploadRequestVersion.current
        && sessionVersion === getSessionVersion()
        && latest.userKey === userKey
        && latest.session !== null;
    };

    void uploadProfileAvatar(file)
      .then((imageUrl) => {
        if (!isCurrent()) return;
        const nextAvatar = imageUrl || URL.createObjectURL(file);
        onChanged(nextAvatar);
        saveProfileAvatar(userKey, nextAvatar);
        setAvatarError("");
      })
      .catch(() => {
        if (isCurrent()) {
          setAvatarError("프로필 이미지를 저장하지 못했습니다.");
        }
      })
      .finally(() => {
        isUploading.current = false;
      });
  };

  return { avatarError, handleAvatarChange };
};
