import { useEffect, useRef, useState } from "react";
import {
  getProfileAvatarUserKey,
  PROFILE_AVATAR_CHANGED_EVENT,
  readProfileAvatar,
} from "./profileAvatar.ts";
import { getSession } from "./lifecycle.ts";
import { getUserProfile, resolveProfileImageUrl } from "../api/profile.ts";

const getCurrentUserKey = () => {
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

export const useProfileAvatar = () => {
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const requestVersion = useRef(0);

  useEffect(() => {
    let active = true;

    const syncAvatar = (event?: Event) => {
      const { session, userKey } = getCurrentUserKey();
      const detail = event instanceof CustomEvent ? event.detail as { userKey?: string } | undefined : undefined;
      if (detail?.userKey && detail.userKey !== userKey) return;
      const version = ++requestVersion.current;
      const cachedAvatar = session ? readProfileAvatar(userKey) : null;
      setProfileAvatar(cachedAvatar);
      if (detail?.userKey) return;
      if (!session) return;

      void getUserProfile()
        .then((profile) => {
          const latest = getCurrentUserKey();
          if (!active || version !== requestVersion.current || latest.userKey !== userKey) return;
          setProfileAvatar(
            profile.profileImageUrl
              ? resolveProfileImageUrl(profile.profileImageUrl)
              : cachedAvatar,
          );
        })
        .catch(() => {
          // The cached avatar, if present, remains usable when the profile request fails.
        });
    };

    syncAvatar();
    window.addEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    window.addEventListener("jobdam-session", syncAvatar);
    return () => {
      active = false;
      requestVersion.current += 1;
      window.removeEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
      window.removeEventListener("jobdam-session", syncAvatar);
    };
  }, []);

  return profileAvatar;
};
