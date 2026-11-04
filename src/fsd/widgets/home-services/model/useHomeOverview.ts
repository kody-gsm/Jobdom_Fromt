import { useEffect, useRef, useState } from "react";
import {
  createConsultationApi,
  createConsultationRefreshCoordinator,
  RESERVATION_CHANGED_EVENT,
} from "@fsd/entities/consultation";
import type { StudentReservation } from "@fsd/entities/consultation";
import { createRecruitApi, rememberRecruitFormLinks } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import {
  buildHomeOverview,
  removeHomeReservationFromCache,
  replaceHomeConsultations,
  type HomeOverview,
} from "./overview.ts";

const consultationApi = createConsultationApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

const RESERVATION_REFRESH_COALESCE_MS = 150;

const EMPTY_OVERVIEW: HomeOverview = {
  upcomingConsultations: [],
  recentRecruits: [],
};

export const useHomeOverview = () => {
  const [overview, setOverview] = useState<HomeOverview>(EMPTY_OVERVIEW);
  const [consultationLoading, setConsultationLoading] = useState(true);
  const [recruitLoading, setRecruitLoading] = useState(true);
  const [consultationError, setConsultationError] = useState("");
  const [recruitError, setRecruitError] = useState("");
  const courseReservations = useRef<StudentReservation[]>([]);
  const commonReservations = useRef<StudentReservation[]>([]);
  const consultationRefresh = useRef(createConsultationRefreshCoordinator());
  const consultationHasLoaded = useRef(false);
  const recruitRequests = useRef(createRequestVersionGuard());
  const refreshConsultationsRef = useRef<((fresh?: boolean) => Promise<void>) | null>(null);
  const refreshRecruitsRef = useRef<((fresh?: boolean) => Promise<void>) | null>(null);
  const scheduleConsultationRefreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;

    const refreshConsultations = async (fresh = false) => {
      const requestVersion = consultationRefresh.current.beginRefresh();
      if (requestVersion === null) return;
      if (!consultationHasLoaded.current) setConsultationLoading(true);
      setConsultationError("");
      const [courseResult, commonResult] = await Promise.allSettled([
        consultationApi.getUpcoming("course", fresh ? { cache: "no-store" } : undefined),
        consultationApi.getUpcoming("common", fresh ? { cache: "no-store" } : undefined),
      ]);
      if (!active || !consultationRefresh.current.isLatest(requestVersion)) return;
      if (courseResult.status === "fulfilled") courseReservations.current = courseResult.value;
      if (commonResult.status === "fulfilled") commonReservations.current = commonResult.value;
      setOverview((current) => replaceHomeConsultations(
        current,
        courseReservations.current,
        commonReservations.current,
      ));
      setConsultationError(
        courseResult.status === "rejected" || commonResult.status === "rejected"
          ? "상담 일정을 불러오지 못했습니다."
          : "",
      );
      consultationHasLoaded.current = true;
      setConsultationLoading(false);
    };
    refreshConsultationsRef.current = refreshConsultations;

    const refreshRecruits = async (fresh = false) => {
      const requestVersion = recruitRequests.current.next();
      setRecruitLoading(true);
      setRecruitError("");
      try {
        const result = rememberRecruitFormLinks(await recruitApi.getAll(fresh ? { cache: "no-store" } : undefined));
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
        setRecruitLoading(false);
      } catch {
        if (active && recruitRequests.current.isLatest(requestVersion)) {
          setRecruitError("취업 공고를 불러오지 못했습니다.");
          setRecruitLoading(false);
        }
      }
    };
    refreshRecruitsRef.current = refreshRecruits;

    const load = async () => {
      await Promise.all([refreshConsultations(), refreshRecruits()]);
    };

    void load();
    // 수정 저장 직후의 새로고침과 서버 실시간 알림이 거의 동시에 오므로 짧게 모아서 한 번만 다시 받는다.
    let scheduledRefresh: ReturnType<typeof setTimeout> | undefined;
    const scheduleConsultationRefresh = () => {
      if (scheduledRefresh !== undefined) clearTimeout(scheduledRefresh);
      scheduledRefresh = setTimeout(() => {
        scheduledRefresh = undefined;
        if (active) void refreshConsultations(true);
      }, RESERVATION_REFRESH_COALESCE_MS);
    };
    scheduleConsultationRefreshRef.current = scheduleConsultationRefresh;
    const handleReservationChange = () => scheduleConsultationRefresh();
    window.addEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);

    return () => {
      active = false;
      if (scheduledRefresh !== undefined) clearTimeout(scheduledRefresh);
      scheduleConsultationRefreshRef.current = null;
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
        await refreshConsultationsRef.current?.(true);
      }
    }
  };

  return {
    overview,
    loading: consultationLoading || recruitLoading,
    consultationLoading,
    recruitLoading,
    consultationError,
    recruitError,
    retryConsultations: () => refreshConsultationsRef.current?.(true),
    refreshConsultationsSoon: () => scheduleConsultationRefreshRef.current?.(),
    retryRecruits: () => refreshRecruitsRef.current?.(true),
    error: consultationError || recruitError,
    handleCancel,
  };
};
