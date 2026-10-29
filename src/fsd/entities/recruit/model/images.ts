export const MAX_RECRUIT_IMAGES = 10;
export const MAX_RECRUIT_IMAGE_BYTES = 10 * 1024 * 1024;
export const RECRUIT_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/heic,image/heif";

/** 서버의 공고당 최대 이미지 수와 이미지 형식 제한을 업로드 전에 먼저 확인한다. */
export const getRecruitImageError = (files: readonly Pick<File, "size" | "type">[], attachedCount = 0) => {
  if (files.length === 0) return "이미지를 선택해주세요.";
  if (attachedCount + files.length > MAX_RECRUIT_IMAGES) {
    return `공고 이미지는 최대 ${MAX_RECRUIT_IMAGES}장까지 올릴 수 있습니다. 지금 ${Math.max(0, MAX_RECRUIT_IMAGES - attachedCount)}장 더 올릴 수 있습니다.`;
  }
  if (files.some((file) => !file.type.startsWith("image/"))) return "이미지 파일만 업로드할 수 있습니다.";
  if (files.some((file) => file.size > MAX_RECRUIT_IMAGE_BYTES)) return "이미지는 한 장당 10MB 이하만 업로드할 수 있습니다.";
  return "";
};

export const resolveRecruitImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  const basePath = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
  const prefix = new URL(basePath, "https://jobdam.local").pathname.replace(/\/$/, "");
  if (prefix && imageUrl.startsWith(`${prefix}/`)) return `${basePath}${imageUrl.slice(prefix.length)}`;
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};
