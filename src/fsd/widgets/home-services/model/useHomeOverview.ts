import { useEffect, useRef, useState } from "react";
import {
  createConsultationApi,
  RESERVATION_CHANGED_EVENT,
} from "@fsd/entities/consultation";
import type { StudentReservation } from "@fsd/entities/consultation";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import {
  buildHomeOverview,
  removeHomeReservationFromCache,
  replaceHomeConsultations,
  type HomeOverview,
} from "./overview.ts";
import { createConsultationRefreshCoordinator } from "./consultationRefreshCoordinator.ts";

const consultationApi = createConsultationApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

const EMPTY_OVERVIEW: HomeOverview = {
  upcomingConsultations: [],
  recentRecruits: [],
};

export const useHomeOverview = () => {
  const [overview, setOverview] = useState<HomeOverview>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [consultationError, setConsultationError] = useState("");
  const [recruitError, setRecruitError] = useState("");
  const courseReservations = useRef<StudentReservation[]>([]);
  const commonReservations = useRef<StudentReservation[]>([]);
  const consultationRefresh = useRef(createConsultationRefreshCoordinator());
  const recruitRequests = useRef(createRequestVersionGuard());
  const refreshConsultationsRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let active = true;

    const refreshConsultations = async () => {
      const requestVersion = consultationRefresh.current.beginRefresh();
      if (requestVersion === null) return;
      const [courseResult, commonResult] = await Promise.allSettled([
        consultationApi.getUpcoming("course"),
        consultationApi.getUpcoming("common"),
      ]);
      if (!active || !consultationRefresh.current.isLatest(requestVersion)) return;
      if (courseResult.status === "rejected" || commonResult.status === "rejected") {
        setConsultationError("상담 일정을 불러오지 못했습니다.");
        return;
      }
      courseReservations.current = courseResult.value;
      commonReservations.current = commonResult.value;
      setOverview((current) => replaceHomeConsultations(
        current,
        courseReservations.current,
        commonReservations.current,
      ));
      setConsultationError("");
    };
    refreshConsultationsRef.current = refreshConsultations;

    const refreshRecruits = async () => {
      const requestVersion = recruitRequests.current.next();
      try {
        const result = await recruitApi.getAll();
        if (!active || !recruitRequests.current.isLatest(requestVersion)) return;
        setOverview((current) => ({
          ...current,
          recentRecruits: buildHomeOverview({
            course: [],
            common: [],
            recruits: result,
          }).recentRecruits,
        }));
        setRecruitError("");
      } catch {
        if (active && recruitRequests.current.isLatest(requestVersion)) {
          setRecruitError("취업 공고를 불러오지 못했습니다.");
        }
      }
    };

    const load = async () => {
      setConsultationError("");
      setRecruitError("");
      await Promise.all([refreshConsultations(), refreshRecruits()]);
      if (active) setLoading(false);
    };

    void load();
    const handleReservationChange = () => void refreshConsultations();
    window.addEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);

    return () => {
      active = false;
      window.removeEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);
    };
  }, []);

  const handleCancel = async (id: number) => {
    consultationRefresh.current.startCancellation(id);
    let canceled = false;

    try {
      await cancelProfileConsultation(id);
      const nextCache = removeHomeReservationFromCache(
        {
          course: courseReservations.current,
          common: commonReservations.current,
        },
        id,
      );
      courseReservations.current = nextCache.course;
      commonReservations.current = nextCache.common;
      setOverview((current) => ({
        ...current,
        upcomingConsultations: current.upcomingConsultations.filter((item) => item.id !== id),
      }));
      canceled = true;
    } finally {
      const shouldRefresh = consultationRefresh.current.finishCancellation(id);
      if (canceled || shouldRefresh) {
        await refreshConsultationsRef.current?.();
      }
    }
  };

  return {
    overview,
    loading,
    error: consultationError || recruitError,
    handleCancel,
  };
};
