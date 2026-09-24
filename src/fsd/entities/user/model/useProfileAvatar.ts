import { useEffect, useState } from "react";
import {
  getProfileAvatarUserKey,
  PROFILE_AVATAR_CHANGED_EVENT,
  readProfileAvatar,
} from "./profileAvatar.ts";
import { getSession } from "./lifecycle.ts";
import { getUserProfile, resolveProfileImageUrl } from "../api/profile.ts";

export const useProfileAvatar = () => {
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const session = getSession();
    const userKey = getProfileAvatarUserKey({
      email: session?.email,
      name: session?.name,
    });
    const syncAvatar = () => {
      const cachedAvatar = readProfileAvatar(userKey);
      if (cachedAvatar) setProfileAvatar(cachedAvatar);

      void getUserProfile()
        .then((profile) => {
          if (!active || !profile.profileImageUrl) return;
          setProfileAvatar(resolveProfileImageUrl(profile.profileImageUrl));
        })
        .catch(() => {
          // The cached avatar, if present, remains usable when the profile request fails.
        });
    };

    syncAvatar();
    window.addEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    return () => {
      active = false;
      window.removeEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    };
  }, []);

  return profileAvatar;
};
