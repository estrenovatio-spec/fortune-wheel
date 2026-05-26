/** Плавное замедление как у реального колеса (быстрый старт → долгое торможение) */
export function easeOutWheel(t: number): number {
  return 1 - Math.pow(1 - t, 4.2);
}

export function spinDurationMs(extraSpins: number): number {
  return 5800 + extraSpins * 420;
}

export function animateRotation(
  fromDeg: number,
  toDeg: number,
  durationMs: number,
  onFrame: (deg: number) => void,
  onComplete: () => void,
): () => void {
  const start = performance.now();
  let raf = 0;

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutWheel(t);
    onFrame(fromDeg + (toDeg - fromDeg) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onFrame(toDeg);
      onComplete();
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
