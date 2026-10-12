export type HomeBanner = {
  id: number;
  title: string | null;
  content: string | null;
  link: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type HomeBannerInput = {
  title?: string;
  content?: string;
  link?: string;
};

export const resolveBannerImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  const basePath = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
  const baseUrl = new URL(basePath, "https://jobdam.local");
  const prefix = baseUrl.pathname.replace(/\/$/, "");
  if (prefix && imageUrl.startsWith(`${prefix}/`)) return `${basePath}${imageUrl.slice(prefix.length)}`;
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};
