export type HomeBanner = {
  message: string;
  updatedBy: string;
};

const HOME_BANNER_KEY = "jobdam.home-banner.v1";
export const HOME_BANNER_CHANGED_EVENT = "jobdam-home-banner";

// ponytail: 브라우저 로컬 배너다. 여러 기기 공유가 필요해지면 권한이 적용된 서버 저장 API로 교체한다.
export const readHomeBanner = (): HomeBanner | null => {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HOME_BANNER_KEY) || "null");
    if (
      typeof value !== "object" ||
      value === null ||
      !("message" in value) ||
      !("updatedBy" in value) ||
      typeof value.message !== "string" ||
      typeof value.updatedBy !== "string"
    ) return null;
    return { message: value.message, updatedBy: value.updatedBy };
  } catch {
    return null;
  }
};

export const saveHomeBanner = (banner: HomeBanner) => {
  localStorage.setItem(HOME_BANNER_KEY, JSON.stringify(banner));
  window.dispatchEvent(new Event(HOME_BANNER_CHANGED_EVENT));
};
