import { createConsultationApi } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";
import { buildUserProfileData } from "../model/buildUserProfileData.ts";

const consultationApi = createConsultationApi(requestWithSession);

type UserProfileResponse = {
  name: string;
  email: string;
  student_number: string;
};

export const fetchUserProfile = async () => {
  const session = getSession();
  if (session?.role === "TEACHER") {
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
    session,
    profile: identity,
  });
};
