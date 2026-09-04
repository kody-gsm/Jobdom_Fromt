import { createConsultationApi } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";
import { buildUserProfileData } from "../model/buildUserProfileData.ts";

const consultationApi = createConsultationApi(requestWithSession);

export const fetchUserProfile = async () => {
  const [course, common, upcomingCourse, upcomingCommon] = await Promise.all([
    consultationApi.getAll("course"),
    consultationApi.getAll("common"),
    consultationApi.getUpcoming("course"),
    consultationApi.getUpcoming("common"),
  ]);

  return buildUserProfileData({
    course,
    common,
    upcomingCourse,
    upcomingCommon,
    session: getSession(),
  });
};
