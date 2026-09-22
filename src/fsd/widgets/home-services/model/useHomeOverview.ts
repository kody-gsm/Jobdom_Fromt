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
  replaceHomeConsultations,
  type HomeOverview,
} from "./overview.ts";

const consultationApi = createConsultationApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

const EMPTY_OVERVIEW: HomeOverview = {
  upcomingConsultations: [],
  recentRecruits: [],
};

export const useHomeOverview = () => {
  const [overview, setOverview] = useState<HomeOverview>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const courseReservations = useRef<StudentReservation[]>([]);
  const commonReservations = useRef<StudentReservation[]>([]);
  const consultationRequests = useRef(createRequestVersionGuard());
  const recruitRequests = useRef(createRequestVersionGuard());

  useEffect(() => {
    let active = true;

    const refreshConsultations = async () => {
      const requestVersion = consultationRequests.current.next();
      const [courseResult, commonResult] = await Promise.allSettled([
        consultationApi.getUpcoming("course"),
        consultationApi.getUpcoming("common"),
      ]);
      if (!active || !consultationRequests.current.isLatest(requestVersion)) return;
      if (courseResult.status === "fulfilled") courseReservations.current = courseResult.value;
      if (commonResult.status === "fulfilled") commonReservations.current = commonResult.value;
      setOverview((current) => replaceHomeConsultations(
        current,
        courseReservations.current,
        commonReservations.current,
      ));
      if (courseResult.status === "rejected" || commonResult.status === "rejected") {
        setError("상담 일정을 불러오지 못했습니다.");
      }
    };

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
      } catch {
        if (active && recruitRequests.current.isLatest(requestVersion)) {
          setError("취업 공고를 불러오지 못했습니다.");
        }
      }
    };

    const load = async () => {
      setError("");
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
    consultationRequests.current.next();
    await cancelProfileConsultation(id);
    setOverview((current) => ({
      ...current,
      upcomingConsultations: current.upcomingConsultations.filter((item) => item.id !== id),
    }));
  };

  return { overview, loading, error, handleCancel };
};
