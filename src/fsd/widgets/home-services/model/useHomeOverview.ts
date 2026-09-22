import { useEffect, useState } from "react";
import {
  createConsultationApi,
  RESERVATION_CHANGED_EVENT,
} from "@fsd/entities/consultation";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { cancelProfileConsultation } from "@fsd/features/cancel-consultation";
import { buildHomeOverview, type HomeOverview } from "./overview.ts";

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

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      const [courseResult, commonResult, recruitsResult] = await Promise.allSettled([
        consultationApi.getUpcoming("course"),
        consultationApi.getUpcoming("common"),
        recruitApi.getAll(),
      ]);
      if (!active) return;
      setOverview(buildHomeOverview({
        course: courseResult.status === "fulfilled" ? courseResult.value : [],
        common: commonResult.status === "fulfilled" ? commonResult.value : [],
        recruits: recruitsResult.status === "fulfilled" ? recruitsResult.value : [],
      }));
      if ([courseResult, commonResult, recruitsResult].some((result) => result.status === "rejected")) {
        setError("대시보드 일부 정보를 불러오지 못했습니다.");
      }
      setLoading(false);
    };

    void load();
    const handleReservationChange = () => void load();
    window.addEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);

    return () => {
      active = false;
      window.removeEventListener(RESERVATION_CHANGED_EVENT, handleReservationChange);
    };
  }, []);

  const handleCancel = async (id: number) => {
    await cancelProfileConsultation(id);
    setOverview((current) => ({
      ...current,
      upcomingConsultations: current.upcomingConsultations.filter((item) => item.id !== id),
    }));
  };

  return { overview, loading, error, handleCancel };
};
