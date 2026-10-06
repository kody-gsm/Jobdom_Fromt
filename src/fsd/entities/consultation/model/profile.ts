import type {
  ConsultationKind,
  StudentReservation,
} from "./types.ts";
import type { ConsultationDetailItem } from "./detail.ts";
import { toConsultationDetailItem } from "./detail.ts";

export interface ProfileConsultation extends ConsultationDetailItem {
  slot: string;
}

export const toProfileConsultation = (
  kind: ConsultationKind,
  item: StudentReservation,
): ProfileConsultation => ({
  ...toConsultationDetailItem(kind, item),
  date: item.date.replaceAll("-", "."),
  slot: item.period,
});

export const decodeProfileConsultationId = (profileId: number) => ({
  kind: profileId % 2 === 1 ? ("common" as const) : ("course" as const),
  reservationId: Math.floor(profileId / 2),
});
