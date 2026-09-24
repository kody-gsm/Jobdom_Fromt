import { decodeProfileConsultationId } from "@fsd/entities/consultation";
import type { ConsultationKind } from "@fsd/entities/consultation";

interface CancelReservation {
  (kind: ConsultationKind, id: number): Promise<unknown>;
}

export const createCancelProfileConsultation = (cancel: CancelReservation) =>
  async (profileId: number) => {
    const { kind, reservationId } = decodeProfileConsultationId(profileId);
    await cancel(kind, reservationId);
  };
