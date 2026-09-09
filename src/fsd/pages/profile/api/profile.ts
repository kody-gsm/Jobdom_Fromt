import { createConsultationApi } from "@fsd/entities/consultation";
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

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await requestWithSession<ProfileImageUploadResponse>(
    "/auth/profile/image",
    { method: "PATCH", body: formData },
  );
  return response.profileImageUrl;
};

export const fetchUserProfile = async () => {
  const [upcomingCourse, upcomingCommon, identity] = await Promise.all([
    consultationApi.getUpcoming("course"),
    consultationApi.getUpcoming("common"),
    requestWithSession<UserProfileResponse>("/auth/profile"),
  ]);

  return buildUserProfileData({
    upcomingCourse,
    upcomingCommon,
    session: getSession(),
    profile: identity,
  });
};
