import type { HomeBanner, HomeBannerInput } from "../model/homeBanner.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

const readBanner = async (request: RequestFn, path: string) =>
  (await request<HomeBanner | undefined>(path)) ?? null;

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
    });
  },
});
