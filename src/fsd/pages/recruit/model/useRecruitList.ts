import { useEffect, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import { ApiError } from "@fsd/shared/api";
import { getRecruits } from "../api/recruit.ts";

export const useRecruitList = () => {
  const [items, setItems] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getRecruits()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((caught) => {
        if (!active) return;
        setError(
          caught instanceof ApiError && caught.status === 401
            ? "로그인 후 취업 공고를 확인할 수 있습니다."
            : caught instanceof Error
              ? caught.message
              : "공고를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { items, loading, error };
};
