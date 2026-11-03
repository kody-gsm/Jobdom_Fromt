"use client";

import { useEffect, useState } from "react";
import { isSameRect, unionRects, type Rect } from "./spotlight.ts";
import type { TutorialTarget } from "./steps.ts";

export type TutorialTargetState = { rect: Rect | null; status: "searching" | "found" | "missing" };

// 실제 화면은 데이터를 불러오며 늦게 그려질 수 있어 잠시 기다린 뒤에만 '없음'으로 본다.
const TARGET_TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 250;
const HEADER_OFFSET = 96;
// 모바일 헤더는 메뉴가 두 줄로 내려와 더 높다.
const COMPACT_HEADER_OFFSET = 128;

const findTargetElements = (target: TutorialTarget) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-tutorial-target~="${target}"]`))
    .filter((element) => element.getClientRects().length > 0);

const scrollTargetIntoView = (elements: HTMLElement[], isCompact: boolean) => {
  const rect = unionRects(elements.map((element) => element.getBoundingClientRect()));
  if (!rect) return;
  // 모바일은 설명 카드가 아래를 차지하므로 강조 영역을 화면 위쪽에 둔다.
  const headerOffset = isCompact ? COMPACT_HEADER_OFFSET : HEADER_OFFSET;
  const visibleBottom = window.innerHeight * (isCompact ? 0.5 : 1);
  const fitsInView = rect.top >= headerOffset && rect.top + rect.height <= visibleBottom;
  if (fitsInView) return;
  const centered = (window.innerHeight - rect.height) / 2;
  const desiredTop = isCompact || rect.height > window.innerHeight - headerOffset * 2
    ? headerOffset
    : Math.max(headerOffset, centered);
  elements[0].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  const afterNearest = unionRects(elements.map((element) => element.getBoundingClientRect()));
  if (afterNearest) window.scrollBy({ top: afterNearest.top - desiredTop, behavior: "instant" });
};

export const useTutorialTarget = (target: TutorialTarget, enabled: boolean, isCompact: boolean): TutorialTargetState => {
  const [state, setState] = useState<TutorialTargetState & { target: TutorialTarget | null }>({ target: null, rect: null, status: "searching" });

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let hasScrolled = false;
    const startedAt = Date.now();

    const measure = () => {
      frame = 0;
      const elements = findTargetElements(target);
      if (elements.length === 0) {
        const status = Date.now() - startedAt >= TARGET_TIMEOUT_MS ? "missing" : "searching";
        setState((current) => current.target === target && current.rect === null && current.status === status ? current : { target, rect: null, status });
        return;
      }
      if (!hasScrolled) {
        hasScrolled = true;
        scrollTargetIntoView(elements, isCompact);
      }
      const rect = unionRects(elements.map((element) => element.getBoundingClientRect()));
      setState((current) => current.target === target && current.status === "found" && isSameRect(current.rect, rect) ? current : { target, rect, status: "found" });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    // 데이터 로딩으로 레이아웃이 바뀌는 경우까지 따라가도록 짧게 다시 측정한다.
    const poll = window.setInterval(schedule, POLL_INTERVAL_MS);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearInterval(poll);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [target, enabled, isCompact]);

  // 이전 단계의 측정값이 새 단계에 잠깐이라도 보이지 않게 한다.
  if (!enabled || state.target !== target) return { rect: null, status: "searching" };
  return { rect: state.rect, status: state.status };
};
