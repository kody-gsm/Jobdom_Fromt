import {
  getAvailablePeriods,
  type ConsultationKind,
} from "../../../entities/consultation/index.ts";
import type { UserRole } from "../../../entities/user/index.ts";

export const getTeacherConsultationKinds = (
  role: UserRole | null,
): ConsultationKind[] => {
  if (role === "TEACHER") return ["course"];
  if (role === "WEE_TEACHER") return ["common"];
  return [];
};

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
    const periods = getAvailablePeriods("general", null);
    if (periods.includes("4교시")) return periods;

    const lunchIndex = periods.indexOf("점심시간");
    if (lunchIndex === -1) return [...periods, "4교시"];
    return [...periods.slice(0, lunchIndex), "4교시", ...periods.slice(lunchIndex)];
  }
  return getAvailablePeriods("career", `${normalizeTeacherName(name)} 선생님`);
};
