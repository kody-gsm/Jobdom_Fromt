import { useEffect, useState } from "react";
import { createConsultationApi } from "@fsd/entities/consultation";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
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

    void Promise.all([
      consultationApi.getUpcoming("course"),
      consultationApi.getUpcoming("common"),
      recruitApi.getAll(),
    ])
      .then(([course, common, recruits]) => {
        if (!active) return;
        setOverview(buildHomeOverview({ course, common, recruits }));
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

  return { overview, loading, error };
};
