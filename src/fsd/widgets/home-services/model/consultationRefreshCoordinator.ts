import { createRequestVersionGuard } from "../../../shared/lib/requestVersion.ts";

export const createConsultationRefreshCoordinator = () => {
  const requests = createRequestVersionGuard();
  const pendingCancellations = new Set<number>();
  let refreshQueued = false;

  return {
    startCancellation: (id: number) => {
      pendingCancellations.add(id);
      requests.next();
    },
    beginRefresh: () => {
      if (pendingCancellations.size > 0) {
        refreshQueued = true;
        return null;
      }
      return requests.next();
    },
    isLatest: requests.isLatest,
    finishCancellation: (id: number) => {
      pendingCancellations.delete(id);
      requests.next();
      const shouldRefresh = refreshQueued;
      refreshQueued = false;
      return shouldRefresh;
    },
  };
};
