import { useCallback, useEffect, useRef, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import { ApiError } from "@fsd/shared/api";
import { getRecruits } from "../api/recruit.ts";

export const useRecruitList = () => {
  const [items, setItems] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestVersion = useRef(0);

  const load = useCallback(() => {
    const version = requestVersion.current + 1;
    requestVersion.current = version;
    setLoading(true);
    setError("");
    void getRecruits()
      .then((data) => {
        if (requestVersion.current === version) setItems(data);
      })
      .catch((caught) => {
        if (requestVersion.current !== version) return;
        setError(
          caught instanceof ApiError && caught.status === 401
            ? "로그인 후 취업 공고를 확인할 수 있습니다."
            : caught instanceof Error
              ? caught.message
              : "공고를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (requestVersion.current === version) setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
      requestVersion.current += 1;
    };
  }, [load]);

  return { items, loading, error, retry: load };
};
