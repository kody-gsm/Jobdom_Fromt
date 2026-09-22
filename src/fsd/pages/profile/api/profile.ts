import {
  createConsultationApi,
  toProfileConsultation,
} from "@fsd/entities/consultation";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";
import { buildUserProfileData } from "../model/buildUserProfileData.ts";

const consultationApi = createConsultationApi(requestWithSession);

type UserProfileResponse = {
  name: string;
  email: string;
  student_number: string;
  profileImageUrl?: string;
};

type ProfileImageUploadResponse = { profileImageUrl: string };

export const resolveProfileImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  const basePath = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await requestWithSession<ProfileImageUploadResponse>(
    "/auth/profile/image",
    { method: "PATCH", body: formData },
  );
  return resolveProfileImageUrl(response.profileImageUrl);
};

export const fetchUserProfile = async () => {
  const session = getSession();
  if (session?.role === "TEACHER" || session?.role === "WEE_TEACHER") {
    const identity = await requestWithSession<UserProfileResponse>("/auth/profile");
    return buildUserProfileData({
      upcomingCourse: [],
      upcomingCommon: [],
      session,
      profile: identity,
    });
  }

  const [upcomingCourse, upcomingCommon, identity] = await Promise.all([
    consultationApi.getUpcoming("course"),
    consultationApi.getUpcoming("common"),
    requestWithSession<UserProfileResponse>("/auth/profile"),
  ]);

  return buildUserProfileData({
    upcomingCourse,
    upcomingCommon,
    session: getSession(),
    profile: {
      ...identity,
      profileImageUrl: identity.profileImageUrl
        ? resolveProfileImageUrl(identity.profileImageUrl)
        : undefined,
    },
  });
};

export const fetchProfileReservations = async (): Promise<ProfileConsultation[]> => {
  const session = getSession();
  if (session?.role === "TEACHER" || session?.role === "WEE_TEACHER") return [];

  const [upcomingCourse, upcomingCommon] = await Promise.all([
    consultationApi.getUpcoming("course"),
    consultationApi.getUpcoming("common"),
  ]);

  return [
    ...upcomingCourse.map((item) => toProfileConsultation("course", item)),
    ...upcomingCommon.map((item) => toProfileConsultation("common", item)),
  ];
};
