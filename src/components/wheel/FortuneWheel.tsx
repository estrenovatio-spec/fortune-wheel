"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildWheelSegments, pickWeightedPrize, rotationForSegment } from "@/lib/wheel-spin";
import { animateRotation, spinDurationMs } from "@/lib/wheel-animation";
import { shadeHex } from "@/lib/wheel-graphics";
import { labelForSegment, type WheelPrize } from "@/lib/wheel-prizes";
import { cn } from "@/lib/utils";

const SIZE = 380;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 22;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Подпись вдоль сектора (+90°), на нижней половине — переворот для читаемости */
function labelRotationDeg(mid: number): number {
  let angle = mid + 90;
  if (mid > 90 && mid < 270) angle += 180;
  return angle;
}

function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

type Props = {
  onResult: (prize: WheelPrize) => void;
  disabled?: boolean;
};

function getDevForcePrizeId(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("prize");
}

export function FortuneWheel({ onResult, disabled }: Props) {
  const segments = useMemo(() => buildWheelSegments(), []);
  const forcePrizeId = useMemo(() => getDevForcePrizeId(), []);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const rotationRef = useRef(0);
  const cancelAnimRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => cancelAnimRef.current?.();
  }, []);

  const spin = useCallback(() => {
    if (spinning || disabled) return;
    const { prize, index } = pickWeightedPrize(forcePrizeId);
    const extra = 5 + Math.floor(Math.random() * 3);
    const from = rotationRef.current;
    const target = from + rotationForSegment(index, extra);
    const duration = spinDurationMs(extra);

    rotationRef.current = target;
    setSpinning(true);
    setLanded(false);
    cancelAnimRef.current?.();

    cancelAnimRef.current = animateRotation(
      from,
      target,
      duration,
      (deg) => setRotation(deg),
      () => {
        setSpinning(false);
        setLanded(true);
        window.setTimeout(() => setLanded(false), 700);
        onResult(prize);
      },
    );
  }, [spinning, disabled, onResult, forcePrizeId]);

  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      {/* Рамка + свечение */}
      <div
        className={cn(
          "relative rounded-full p-3 transition-shadow duration-500",
          spinning
            ? "shadow-[0_0_40px_rgba(201,162,39,0.35),0_8px_32px_rgba(30,58,95,0.25)]"
            : "shadow-[0_8px_28px_rgba(30,58,95,0.2)]",
        )}
      >
        {/* Указатель: остриё на золотом ободе (низ svg = точка привязки) */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 z-30",
            landed && "animate-pointer-tick",
          )}
          style={{
            top: "0.75rem",
            transform: "translateX(-50%) translateY(calc(-100% + 22px))",
          }}
          aria-hidden
        >
          <svg width="36" height="46" viewBox="0 0 36 46" className="drop-shadow-lg">
            <defs>
              <linearGradient id="pointer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b6914" />
                <stop offset="55%" stopColor="#d4a84b" />
                <stop offset="100%" stopColor="#f5e6a8" />
              </linearGradient>
            </defs>
            <path
              d="M18 44 L33 10 Q18 16 3 10 Z"
              fill="url(#pointer-grad)"
              stroke="hsl(222 47% 18%)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4a84b] via-[#f0e6c8] to-[#8b6914] p-[5px]"
          aria-hidden
        >
          <div className="h-full w-full rounded-full bg-[hsl(222,47%,14%)]" />
        </div>

        <div
          className="relative will-change-transform"
          style={{
            transform: `rotate(${rotation}deg) translateZ(0)`,
          }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="mx-auto block w-full"
            aria-label="Колесо фортуны"
          >
            <defs>
              <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
              </filter>
              <radialGradient id="hub-grad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fff8e0" />
                <stop offset="55%" stopColor="#d4a84b" />
                <stop offset="100%" stopColor="#6b5210" />
              </radialGradient>
              {segments.map((seg) => (
                <linearGradient
                  key={`g-${seg.prize.id}`}
                  id={`seg-${seg.prize.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={shadeHex(seg.prize.color, 0.12)} />
                  <stop offset="100%" stopColor={shadeHex(seg.prize.color, -0.18)} />
                </linearGradient>
              ))}
            </defs>

            <g filter="url(#wheel-shadow)">
              <circle cx={CX} cy={CY} r={R + 10} fill="hsl(222 47% 12%)" />
              {segments.map((seg) => {
                const end = seg.startDeg + seg.sizeDeg;
                const mid = seg.centerDeg;
                const labelRadius = seg.sizeDeg < 12 ? R * 0.78 : R * 0.72;
                const labelPos = polarToCartesian(CX, CY, labelRadius, mid);
                const segmentLabel = labelForSegment(seg.prize, seg.sizeDeg);
                const fontSize =
                  seg.sizeDeg < 12 ? 7 : seg.sizeDeg < 18 ? 8 : seg.sizeDeg < 24 ? 9 : seg.sizeDeg < 32 ? 10 : 11;
                return (
                  <g key={seg.prize.id}>
                    <path
                      d={sectorPath(CX, CY, R, seg.startDeg, end)}
                      fill={`url(#seg-${seg.prize.id})`}
                      stroke="rgba(255,248,231,0.35)"
                      strokeWidth={1.2}
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#fffef8"
                      fontSize={fontSize}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${labelRotationDeg(mid)}, ${labelPos.x}, ${labelPos.y})`}
                      style={{
                        paintOrder: "stroke fill",
                        stroke: "rgba(0,0,0,0.4)",
                        strokeWidth: seg.sizeDeg < 12 ? 1.5 : 2,
                      }}
                    >
                      {segmentLabel}
                    </text>
                  </g>
                );
              })}
              {/* Внутреннее кольцо */}
              <circle
                cx={CX}
                cy={CY}
                r={R - 2}
                fill="none"
                stroke="rgba(255,248,231,0.15)"
                strokeWidth={1}
              />
              <circle cx={CX} cy={CY} r={36} fill="url(#hub-grad)" stroke="hsl(222 47% 18%)" strokeWidth={3} />
              <circle cx={CX} cy={CY} r={30} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
              <text
                x={CX}
                y={CY}
                fill="hsl(222 47% 14%)"
                fontSize={13}
                fontWeight={800}
                letterSpacing={1}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                SG
              </text>
            </g>
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || disabled}
        className={cn(
          "mt-8 w-full rounded-xl px-6 py-4 text-base font-semibold shadow-lg transition-all",
          "bg-gradient-to-r from-[hsl(222,47%,18%)] to-[hsl(222,47%,28%)] text-primary-foreground",
          "hover:shadow-xl hover:brightness-110 active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          spinning && "opacity-90",
        )}
      >
        {spinning ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Крутим…
          </span>
        ) : (
          "Крутить колесо"
        )}
      </button>
    </div>
  );
}
