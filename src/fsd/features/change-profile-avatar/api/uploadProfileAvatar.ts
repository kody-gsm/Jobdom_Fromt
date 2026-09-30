import { requestWithSession, resolveProfileImageUrl } from "@fsd/entities/user";

type ProfileImageUploadResponse = { profileImageUrl: string };

export const uploadProfileAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await requestWithSession<ProfileImageUploadResponse>(
    "/auth/profile/image",
    { method: "PATCH", body: formData },
  );
  return resolveProfileImageUrl(response.profileImageUrl);
};
