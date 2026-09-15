import type { ConsultationSlotStatus } from "../api/consultation.ts";

export const getUnavailablePeriods = (
  items: readonly ConsultationSlotStatus[],
) => new Set(items.filter((item) => !item.available).map((item) => item.period));
