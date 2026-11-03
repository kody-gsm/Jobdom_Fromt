"use client";

import { useEffect, useState, type RefObject } from "react";
import { clipRect, getCardPosition, getDimPath, getHolesPath, mergeNearbyRects, padRect, unionRects, type Rect } from "./spotlight.ts";
import type { TutorialTarget } from "./steps.ts";

export type SpotlightStatus = "searching" | "found" | "missing";

type SpotlightRefs = {
  dim: RefObject<SVGPathElement | null>;
  outline: RefObject<SVGPathElement | null>;
  card: RefObject<HTMLElement | null>;
};

// 실제 화면은 데이터를 불러오며 늦게 그려질 수 있어 잠시 기다린 뒤에만 '없음'으로 본다.
const TARGET_TIMEOUT_MS = 4000;
// 요소 목록은 가끔만 다시 찾고, 위치는 매 프레임 읽는다.
const REQUERY_EVERY_FRAMES = 15;
const HEADER_OFFSET = 96;
const COMPACT_HEADER_OFFSET = 128;

const findTargetElements = (targets: readonly TutorialTarget[]) =>
  Array.from(document.querySelectorAll<HTMLElement>(targets.map((target) => `[data-tutorial-target~="${target}"]`).join(",")))
    .filter((element) => element.getClientRects().length > 0);

const toRect = (rect: DOMRect): Rect => ({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });

const scrollTargetIntoView = (elements: HTMLElement[], isCompact: boolean) => {
  const rect = unionRects(elements.map((element) => toRect(element.getBoundingClientRect())));
  if (!rect) return;
  const headerOffset = isCompact ? COMPACT_HEADER_OFFSET : HEADER_OFFSET;
  // 모바일은 설명 카드가 아래를 차지하므로 강조 영역을 화면 위쪽에 둔다.
  const visibleBottom = window.innerHeight * (isCompact ? 0.5 : 1);
  if (rect.top >= headerOffset && rect.top + rect.height <= visibleBottom) return;
  const centered = (window.innerHeight - rect.height) / 2;
  const desiredTop = isCompact || rect.height > window.innerHeight - headerOffset * 2 ? headerOffset : Math.max(headerOffset, centered);
  window.scrollTo({ top: window.scrollY + rect.top - desiredTop, behavior: "smooth" });
};

// 강조 위치와 카드 위치는 React 상태를 거치지 않고 애니메이션 프레임에서 DOM에 바로 쓴다.
// 스크롤할 때마다 다시 렌더링하지 않으므로 끊기지 않고, 값이 바뀔 때만 다시 그린다.
export const useSpotlight = (targets: readonly TutorialTarget[], enabled: boolean, isCompact: boolean, refs: SpotlightRefs) => {
  // 같은 단계인지 문자열로 비교해서 배열이 새로 만들어져도 다시 시작하지 않는다.
  const target = targets.join(" ");
  const [state, setState] = useState<{ target: string | null; status: SpotlightStatus }>({ target: null, status: "searching" });
  const { dim, outline, card } = refs;

  useEffect(() => {
    let frame = 0;
    let count = 0;
    let elements: HTMLElement[] = [];
    let primary: HTMLElement[] = [];
    const primaryTarget = target.split(" ")[0];
    let hasScrolled = false;
    let lastKey = "";
    let status: SpotlightStatus | null = null;
    const startedAt = Date.now();

    const report = (next: SpotlightStatus) => {
      if (next === status) return;
      status = next;
      setState({ target, status: next });
    };

    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      if (enabled && (count % REQUERY_EVERY_FRAMES === 0 || elements.some((element) => !element.isConnected))) {
        elements = findTargetElements(target.split(" ") as TutorialTarget[]);
        primary = elements.filter((element) => element.dataset.tutorialTarget?.split(" ").includes(primaryTarget));
      }
      count += 1;
      // 함께 열어 둔 영역이 있어도 스크롤과 설명 카드 위치는 이 단계의 주 대상 기준으로 잡는다.
      if (enabled && primary.length > 0 && !hasScrolled) {
        hasScrolled = true;
        scrollTargetIntoView(primary, isCompact);
      }
      if (enabled) report(primary.length > 0 ? "found" : Date.now() - startedAt >= TARGET_TIMEOUT_MS ? "missing" : "searching");

      // 읽기를 모두 끝낸 뒤에 쓰기를 해서 레이아웃을 한 번만 계산하게 한다.
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const rects = enabled
        ? mergeNearbyRects(elements.map((element) => clipRect(padRect(toRect(element.getBoundingClientRect())), viewport)).filter((rect): rect is Rect => rect !== null))
        : [];
      const cardElement = card.current;
      const cardSize = cardElement ? { width: cardElement.offsetWidth, height: cardElement.offsetHeight } : { width: 0, height: 0 };
      // 페이지의 모달 창(<dialog>)은 항상 가장 위에 뜬다. 창이 열려 있는 동안은 설명 카드를 숨긴다.
      const dialogOpen = document.querySelector("dialog[open]") !== null;
      const key = `${dialogOpen}|${viewport.width}x${viewport.height}|${cardSize.width}x${cardSize.height}|${isCompact}|${rects.map((rect) => `${Math.round(rect.top)},${Math.round(rect.left)},${Math.round(rect.width)},${Math.round(rect.height)}`).join(";")}`;
      if (key === lastKey) return;
      lastKey = key;

      dim.current?.setAttribute("d", getDimPath(rects, viewport));
      outline.current?.setAttribute("d", getHolesPath(rects));
      if (cardElement) {
        if (isCompact) {
          cardElement.style.transform = "";
        } else {
          const primaryRect = unionRects(primary.map((element) => clipRect(padRect(toRect(element.getBoundingClientRect())), viewport)).filter((rect): rect is Rect => rect !== null));
          const position = getCardPosition(primaryRect, cardSize, viewport);
          cardElement.style.transform = `translate3d(${Math.round(position.left)}px, ${Math.round(position.top)}px, 0)`;
        }
        cardElement.style.visibility = dialogOpen ? "hidden" : "visible";
      }
    };

    tick();
    return () => window.cancelAnimationFrame(frame);
  }, [target, enabled, isCompact, dim, outline, card]);

  // 이전 단계의 상태가 새 단계에 잠깐이라도 보이지 않게 한다.
  return !enabled || state.target !== target ? "searching" : state.status;
};
