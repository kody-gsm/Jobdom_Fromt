import { useState } from "react";
import {
  getProfileAvatarUserKey,
  getSession,
  saveProfileAvatar,
  validateProfileAvatarFile,
} from "@fsd/entities/user";
import { uploadProfileAvatar } from "../api/uploadProfileAvatar.ts";

export const useChangeProfileAvatar = (onChanged: (imageUrl: string) => void) => {
  const [avatarError, setAvatarError] = useState("");

  const handleAvatarChange = (file: File) => {
    const validationError = validateProfileAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    void uploadProfileAvatar(file)
      .then((imageUrl) => {
        onChanged(imageUrl || URL.createObjectURL(file));
        const session = getSession();
        saveProfileAvatar(
          getProfileAvatarUserKey({ email: session?.email, name: session?.name }),
          imageUrl,
        );
        setAvatarError("");
      })
      .catch(() => setAvatarError("프로필 이미지를 저장하지 못했습니다."));
  };

  return { avatarError, handleAvatarChange };
};
