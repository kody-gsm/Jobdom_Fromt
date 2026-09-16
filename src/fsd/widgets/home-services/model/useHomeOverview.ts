import { useEffect, useState } from "react";
import { createConsultationApi } from "@fsd/entities/consultation";
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

    void Promise.allSettled([
      consultationApi.getUpcoming("course"),
      consultationApi.getUpcoming("common"),
      recruitApi.getAll(),
    ])
      .then(([courseResult, commonResult, recruitsResult]) => {
        if (!active) return;
        setOverview(buildHomeOverview({
          course: courseResult.status === "fulfilled" ? courseResult.value : [],
          common: commonResult.status === "fulfilled" ? commonResult.value : [],
          recruits: recruitsResult.status === "fulfilled" ? recruitsResult.value : [],
        }));
      })
      .catch(() => {
        if (active) setError("대시보드 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
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
