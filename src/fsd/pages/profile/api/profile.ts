import {
  createConsultationApi,
  toProfileConsultation,
} from "@fsd/entities/consultation";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import {
  getSession,
  getUserProfile,
  requestWithSession,
  resolveProfileImageUrl,
} from "@fsd/entities/user";
import { buildUserProfileData } from "../model/buildUserProfileData.ts";

const consultationApi = createConsultationApi(requestWithSession);

type ProfileImageUploadResponse = { profileImageUrl: string };

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
    const identity = await getUserProfile();
    return buildUserProfileData({
      upcomingCourse: [],
      upcomingCommon: [],
      session,
      profile: identity,
    });
  }

  const identity = await getUserProfile();

  return buildUserProfileData({
    upcomingCourse: [],
    upcomingCommon: [],
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
