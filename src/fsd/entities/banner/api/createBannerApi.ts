import type { ApiRequestInit } from "@fsd/shared/api";
import type { HomeBanner, HomeBannerInput } from "../model/homeBanner.ts";

interface RequestFn {
  <T>(path: string, init?: ApiRequestInit): Promise<T>;
}

const readBanner = async (request: RequestFn, path: string) =>
  (await request<HomeBanner | undefined>(path, { cache: "no-store" })) ?? null;

export const createBannerApi = (request: RequestFn) => ({
  getTeacher: () => readBanner(request, "/teacher/banner"),
  getStudent: () => readBanner(request, "/student/banner"),
  saveTeacher: (image: File, input: HomeBannerInput) => {
    const body = new FormData();
    body.append("image", image);
    if (input.title?.trim()) body.append("title", input.title.trim());
    if (input.content?.trim()) body.append("content", input.content.trim());
    if (input.link?.trim()) body.append("link", input.link.trim());
    return request<HomeBanner>("/teacher/banner", {
      method: "POST",
      body,
      // 배너 조회는 항상 no-store라 캐시에 없다. 다른 화면의 조회 캐시는 지우지 않는다.
      invalidateCache: ["/student/banner", "/teacher/banner"],
    });
  },
});
