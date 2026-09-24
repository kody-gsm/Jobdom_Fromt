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

export type ProfileReservationResult = {
  reservations: ProfileConsultation[];
  errors: {
    course?: string;
    common?: string;
  };
};

const getReservationErrorMessage = (caught: unknown) =>
  caught instanceof Error ? caught.message : "상담 예약을 불러오지 못했습니다.";

export const fetchProfileReservations = async (): Promise<ProfileReservationResult> => {
  const session = getSession();
  if (session?.role === "TEACHER" || session?.role === "WEE_TEACHER") {
    return { reservations: [], errors: {} };
  }

  const [courseResult, commonResult] = await Promise.allSettled([
    consultationApi.getUpcoming("course"),
    consultationApi.getUpcoming("common"),
  ]);

  const errors: ProfileReservationResult["errors"] = {};
  const reservations: ProfileConsultation[] = [];
  if (courseResult.status === "fulfilled") {
    reservations.push(...courseResult.value.map((item) => toProfileConsultation("course", item)));
  } else {
    errors.course = getReservationErrorMessage(courseResult.reason);
  }
  if (commonResult.status === "fulfilled") {
    reservations.push(...commonResult.value.map((item) => toProfileConsultation("common", item)));
  } else {
    errors.common = getReservationErrorMessage(commonResult.reason);
  }
  return { reservations, errors };
};
