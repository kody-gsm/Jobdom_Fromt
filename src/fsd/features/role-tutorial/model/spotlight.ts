export type Rect = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };
export type CardPlacement = "below" | "above" | "right" | "left" | "corner" | "center";
export type CardPosition = { top: number; left: number; placement: CardPlacement };

export const SPOTLIGHT_PADDING = 8;
export const SPOTLIGHT_RADIUS = 14;
const GAP = 16;
const MARGIN = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

export const unionRects = (rects: readonly Rect[]): Rect | null => {
  const visible = rects.filter((rect) => rect.width > 0 && rect.height > 0);
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

// 화면 밖으로 나간 부분은 잘라서, 큰 영역도 보이는 만큼만 강조하고 카드 위치를 계산한다.
export const clipRect = (rect: Rect, viewport: Size): Rect | null => {
  const top = Math.max(rect.top, 0);
  const left = Math.max(rect.left, 0);
  const bottom = Math.min(rect.top + rect.height, viewport.height);
  const right = Math.min(rect.left + rect.width, viewport.width);
  return bottom > top && right > left ? { top, left, width: right - left, height: bottom - top } : null;
};

// 강조 여백끼리 거의 맞닿는 요소만 하나로 합친다. 멀리 떨어진 요소는 각각 따로 강조한다.
const MERGE_GAP = 12;

const isNear = (a: Rect, b: Rect) =>
  a.left <= b.left + b.width + MERGE_GAP && b.left <= a.left + a.width + MERGE_GAP
  && a.top <= b.top + b.height + MERGE_GAP && b.top <= a.top + a.height + MERGE_GAP;

export const mergeNearbyRects = (rects: readonly Rect[]): Rect[] => {
  const merged = rects.filter((rect) => rect.width > 0 && rect.height > 0).map((rect) => ({ ...rect }));
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < merged.length; i += 1) {
      for (let j = i + 1; j < merged.length; j += 1) {
        if (!isNear(merged[i], merged[j])) continue;
        merged[i] = unionRects([merged[i], merged[j]]) ?? merged[i];
        merged.splice(j, 1);
        changed = true;
        break outer;
      }
    }
  }
  return merged;
};

const round = (value: number) => Math.round(value * 10) / 10;

const roundedRectPath = ({ top, left, width, height }: Rect, radius = SPOTLIGHT_RADIUS) => {
  const r = Math.min(radius, width / 2, height / 2);
  const x = round(left);
  const y = round(top);
  const w = round(width);
  const h = round(height);
  return `M${round(x + r)} ${y}H${round(x + w - r)}A${r} ${r} 0 0 1 ${round(x + w)} ${round(y + r)}V${round(y + h - r)}A${r} ${r} 0 0 1 ${round(x + w - r)} ${round(y + h)}H${round(x + r)}A${r} ${r} 0 0 1 ${x} ${round(y + h - r)}V${round(y + r)}A${r} ${r} 0 0 1 ${round(x + r)} ${y}Z`;
};

// 강조할 요소마다 구멍을 따로 뚫는다. 떨어진 요소를 하나의 큰 상자로 묶지 않는다.
export const getHolesPath = (rects: readonly Rect[]) => rects.map((rect) => roundedRectPath(rect)).join("");

// evenodd로 채우면 화면 전체 사각형에서 강조 영역만 빠진다.
export const getDimPath = (rects: readonly Rect[], viewport: Size) =>
  `M0 0H${viewport.width}V${viewport.height}H0Z${getHolesPath(rects)}`;

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
