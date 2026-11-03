"use client";

import { useSyncExternalStore } from "react";
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

// 헤더는 페이지마다 새로 그려진다. 사진 상태를 탭 하나에서 공유해서
// 페이지를 옮길 때 기본 아이콘이 깜빡이거나 /auth/profile을 다시 받지 않게 한다.
type AvatarState = { userKey: string | null; avatar: string | null };
let state: AvatarState | null = null;
let fetchedUserKey: string | null = null;
let requestVersion = 0;
const listeners = new Set<() => void>();

const setState = (next: AvatarState) => {
  if (state?.userKey === next.userKey && state.avatar === next.avatar) return;
  state = next;
  listeners.forEach((listener) => listener());
};

const readLocalState = (): AvatarState => {
  const { session, userKey } = getCurrentUserKey();
  if (!session) return { userKey: null, avatar: null };
  return { userKey, avatar: readProfileAvatar(userKey) };
};

const syncAvatar = (event?: Event) => {
  const { session, userKey } = getCurrentUserKey();
  const detail = event instanceof CustomEvent ? event.detail as { userKey?: string } | undefined : undefined;
  if (detail?.userKey && detail.userKey !== userKey) return;
  const currentKey = session ? userKey : null;
  const cachedAvatar = currentKey ? readProfileAvatar(currentKey) : null;
  // 프로필 화면에서 사진을 바꾸면 저장된 사진만 다시 읽는다.
  if (detail?.userKey) {
    setState({ userKey: currentKey, avatar: cachedAvatar });
    return;
  }
  // 토큰만 바뀐 세션 이벤트(재발급)는 같은 사용자이므로 다시 받지 않는다.
  if (currentKey !== null && currentKey === state?.userKey && fetchedUserKey === currentKey) return;
  const version = ++requestVersion;
  setState({ userKey: currentKey, avatar: cachedAvatar });
  fetchedUserKey = currentKey;
  if (currentKey === null) return;

  void getUserProfile()
    .then((profile) => {
      if (version !== requestVersion || getCurrentUserKey().userKey !== currentKey) return;
      setState({
        userKey: currentKey,
        avatar: profile.profileImageUrl ? resolveProfileImageUrl(profile.profileImageUrl) : cachedAvatar,
      });
    })
    .catch(() => {
      // The cached avatar, if present, remains usable when the profile request fails.
      if (version === requestVersion) fetchedUserKey = null;
    });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    window.addEventListener("jobdam-session", syncAvatar);
    syncAvatar();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    window.removeEventListener("jobdam-session", syncAvatar);
  };
};

const getSnapshot = () => {
  // 첫 렌더부터 저장된 사진을 보여 준다.
  if (state === null) state = readLocalState();
  return state.avatar;
};

export const useProfileAvatar = () => useSyncExternalStore(subscribe, getSnapshot, () => null);
