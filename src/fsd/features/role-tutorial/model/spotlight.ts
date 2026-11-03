export type Rect = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };
export type CardPlacement = "below" | "above" | "right" | "left" | "corner" | "center";
export type CardPosition = { top: number; left: number; placement: CardPlacement };

export const SPOTLIGHT_PADDING = 8;
const GAP = 16;
const MARGIN = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

// 여러 요소가 같은 단계를 이루면 하나의 영역으로 묶어서 강조한다.
export const unionRects = (rects: readonly Rect[]): Rect | null => {
  const visible = rects.filter((rect) => rect.width > 0 || rect.height > 0);
  if (visible.length === 0) return null;
  const top = Math.min(...visible.map((rect) => rect.top));
  const left = Math.min(...visible.map((rect) => rect.left));
  const bottom = Math.max(...visible.map((rect) => rect.top + rect.height));
  const right = Math.max(...visible.map((rect) => rect.left + rect.width));
  return { top, left, width: right - left, height: bottom - top };
};

export const padRect = (rect: Rect, padding = SPOTLIGHT_PADDING): Rect => ({
  top: rect.top - padding,
  left: rect.left - padding,
  width: rect.width + padding * 2,
  height: rect.height + padding * 2,
});

export const isSameRect = (a: Rect | null, b: Rect | null) =>
  a === b || (a !== null && b !== null
    && Math.round(a.top) === Math.round(b.top)
    && Math.round(a.left) === Math.round(b.left)
    && Math.round(a.width) === Math.round(b.width)
    && Math.round(a.height) === Math.round(b.height));

// 설명 카드가 강조 영역을 가리지 않도록 아래 → 위 → 오른쪽 → 왼쪽 순서로 빈 공간을 찾는다.
export const getCardPosition = (target: Rect | null, card: Size, viewport: Size): CardPosition => {
  const maxLeft = viewport.width - MARGIN - card.width;
  const maxTop = viewport.height - MARGIN - card.height;
  if (!target) {
    return { top: clamp((viewport.height - card.height) / 2, MARGIN, maxTop), left: clamp((viewport.width - card.width) / 2, MARGIN, maxLeft), placement: "center" };
  }

  const alignedLeft = clamp(target.left, MARGIN, maxLeft);
  const alignedTop = clamp(target.top, MARGIN, maxTop);
  const below = target.top + target.height + GAP;
  if (below + card.height <= viewport.height - MARGIN) return { top: below, left: alignedLeft, placement: "below" };
  const above = target.top - GAP - card.height;
  if (above >= MARGIN) return { top: above, left: alignedLeft, placement: "above" };
  const right = target.left + target.width + GAP;
  if (right + card.width <= viewport.width - MARGIN) return { top: alignedTop, left: right, placement: "right" };
  const left = target.left - GAP - card.width;
  if (left >= MARGIN) return { top: alignedTop, left, placement: "left" };
  return { top: maxTop, left: maxLeft, placement: "corner" };
};
