import {
  getAvailablePeriods,
  type ConsultationKind,
} from "../../../entities/consultation/index.ts";

export type TeacherWorkspaceVariant =
  | "im-gyeongwon"
  | "kim-gwon-yeso"
  | "jeong-yungi"
  | "general";

const normalizeTeacherName = (name: string) => name.replace(/ 선생님$/, "").trim();

export const getTeacherWorkspaceVariant = (
  name: string,
): TeacherWorkspaceVariant => {
  const normalized = normalizeTeacherName(name);
  if (normalized === "임경원") return "im-gyeongwon";
  if (normalized === "김권예소") return "kim-gwon-yeso";
  if (normalized === "정윤기") return "jeong-yungi";
  return "general";
};

export const canManageHomeBanner = (name: string) =>
  getTeacherWorkspaceVariant(name) === "general";

export const getTeacherAvailablePeriods = (
  kind: ConsultationKind,
  name: string,
) => {
  if (kind === "common" || canManageHomeBanner(name)) {
    return getAvailablePeriods("general", null);
  }
  return getAvailablePeriods("career", `${normalizeTeacherName(name)} 선생님`);
};
