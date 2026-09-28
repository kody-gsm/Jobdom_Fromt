import { createBannerApi } from "@fsd/entities/banner";
import { requestWithSession } from "@fsd/entities/user";

export const getStudentBanner = createBannerApi(requestWithSession).getStudent;
