import type { HomeConsultationItem } from "./overview.ts";

export const getCancelTargetInvalidationNotice = (
  targetId: number | null,
  consultations: Pick<HomeConsultationItem, "id">[],
) => {
  if (targetId === null || consultations.some((item) => item.id === targetId)) {
    return "";
  }

  return "상담 상태가 변경되어 취소 창을 닫았습니다.";
};
