import { requestWithSession } from "./sessionRequest.ts";

export type UserProfileResponse = {
  name: string;
  email: string;
  student_number: string;
  profileImageUrl?: string;
};

export const getUserProfile = () =>
  requestWithSession<UserProfileResponse>("/auth/profile");

export const resolveProfileImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  const basePath = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};
