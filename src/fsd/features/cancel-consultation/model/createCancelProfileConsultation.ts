import { decodeProfileConsultationId } from "../../../entities/consultation/index.ts";
import type { ConsultationKind } from "../../../entities/consultation/index.ts";

interface CancelReservation {
  (kind: ConsultationKind, id: number): Promise<unknown>;
}

export const createCancelProfileConsultation = (cancel: CancelReservation) =>
  async (profileId: number) => {
    const { kind, reservationId } = decodeProfileConsultationId(profileId);
    await cancel(kind, reservationId);
  };
