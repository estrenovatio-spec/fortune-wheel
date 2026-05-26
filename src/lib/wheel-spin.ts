import { WHEEL_PRIZES, type WheelPrize } from "@/lib/wheel-prizes";

export type WheelSegment = {
  prize: WheelPrize;
  index: number;
  startDeg: number;
  sizeDeg: number;
  centerDeg: number;
};

export function buildWheelSegments(): WheelSegment[] {
  const totalWeight = WHEEL_PRIZES.reduce((s, p) => s + p.weight, 0);
  let cursor = 0;
  return WHEEL_PRIZES.map((prize, index) => {
    const sizeDeg = (prize.weight / totalWeight) * 360;
    const startDeg = cursor;
    const centerDeg = startDeg + sizeDeg / 2;
    cursor += sizeDeg;
    return { prize, index, startDeg, sizeDeg, centerDeg };
  });
}

export function pickWeightedPrize(forcePrizeId?: string | null): { prize: WheelPrize; index: number } {
  if (forcePrizeId) {
    const index = WHEEL_PRIZES.findIndex((p) => p.id === forcePrizeId);
    if (index >= 0) return { prize: WHEEL_PRIZES[index], index };
  }

  const total = WHEEL_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WHEEL_PRIZES.length; i++) {
    r -= WHEEL_PRIZES[i].weight;
    if (r <= 0) return { prize: WHEEL_PRIZES[i], index: i };
  }
  const last = WHEEL_PRIZES.length - 1;
  return { prize: WHEEL_PRIZES[last], index: last };
}

/** Остановка не строго по центру сектора — выглядит естественнее */
export function rotationForSegment(index: number, extraSpins = 5): number {
  const segments = buildWheelSegments();
  const seg = segments[index];
  const inset = Math.min(seg.sizeDeg * 0.12, 4);
  const maxOffset = Math.max(0, seg.sizeDeg / 2 - inset);
  const offset = (Math.random() * 2 - 1) * maxOffset;
  const landDeg = seg.centerDeg + offset;
  return extraSpins * 360 + (360 - landDeg);
}
