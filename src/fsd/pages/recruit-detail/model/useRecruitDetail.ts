import { useEffect, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import { getRecruit } from "../api/recruit.ts";

export const useRecruitDetail = (recruitId: number) => {
  const [item, setItem] = useState<Recruit | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getRecruit(recruitId)
      .then((data) => {
        if (!active) return;
        setItem(data);
        document.title = `${data.companyName || "취업 공고"} | 잡담`;
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.");
        }
      });

    return () => {
      active = false;
    };
  }, [recruitId]);

  return { item, error };
};
