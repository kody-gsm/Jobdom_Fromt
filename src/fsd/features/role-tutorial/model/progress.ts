export type TutorialRole = "STUDENT" | "TEACHER" | "WEE_TEACHER";

export const getTutorialRole = (role: string | undefined): TutorialRole | null => {
  if (role === "STUDENT" || role === "TEACHER" || role === "WEE_TEACHER") return role;
  return null;
};
