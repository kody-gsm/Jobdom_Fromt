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
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};
