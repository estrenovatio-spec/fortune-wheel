"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FortuneWheel } from "@/components/wheel/FortuneWheel";
import { WheelLeadForm } from "@/components/wheel/WheelLeadForm";
import { BONUS_PRIZE_ID, isBonusPrize, type WheelPrize } from "@/lib/wheel-prizes";
import { diagnosticUrl } from "@/lib/site";

const diagnosticHref = diagnosticUrl();
const WHEEL_DONE_KEY = "sg-wheel-done";
const RESET_KEY = process.env.NEXT_PUBLIC_WHEEL_RESET_KEY?.trim() ?? "";

function clearWheelSession(): void {
  try {
    sessionStorage.removeItem(WHEEL_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export default function HomePage() {
  const [prize, setPrize] = useState<WheelPrize | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [formKey, setFormKey] = useState(0);
  const [bonusRespinUsed, setBonusRespinUsed] = useState(false);
  const [showRespinHint, setShowRespinHint] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const resetParam = params.get("reset")?.trim() ?? "";

    if (RESET_KEY && resetParam === RESET_KEY) {
      clearWheelSession();
      setCanSpin(true);
      setPrize(null);
      setBonusRespinUsed(false);
      setShowRespinHint(false);
      setFormKey((k) => k + 1);
      setResetNotice(true);

      params.delete("reset");
      const q = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
      return;
    }

    try {
      if (sessionStorage.getItem(WHEEL_DONE_KEY) === "1") setCanSpin(false);
    } catch {
      /* ignore */
    }
  }, []);

  const onResult = useCallback((p: WheelPrize) => {
    setPrize(p);
    setCanSpin(false);
    setShowRespinHint(false);
    setFormKey((k) => k + 1);
  }, []);

  const onClaimed = useCallback(
    (claimed: WheelPrize) => {
      if (isBonusPrize(claimed) && !bonusRespinUsed) {
        setBonusRespinUsed(true);
        setCanSpin(true);
        setShowRespinHint(true);
        return;
      }
      setCanSpin(false);
      setShowRespinHint(false);
      try {
        sessionStorage.setItem(WHEEL_DONE_KEY, "1");
      } catch {
        /* ignore */
      }
    },
    [bonusRespinUsed],
  );

  const devForcePrize = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const prize = params.get("prize")?.trim();
    if (!prize) return null;
    if (process.env.NODE_ENV === "development") return prize;
    const resetParam = params.get("reset")?.trim() ?? "";
    if (RESET_KEY && resetParam === RESET_KEY) return prize;
    return null;
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10 font-sans">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-primary">
        SG Capital
      </p>
      <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">Колесо фортуны</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Крутите один раз и получите подарок от финансового советника Алексея Шаргатова
      </p>

      {resetNotice && (
        <p className="mb-4 rounded-lg border border-emerald-300/50 bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-900">
          Сброс для проверки: можно крутить колесо снова.
        </p>
      )}

      {devForcePrize && (
        <p className="mb-4 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
          Режим проверки: всегда выпадет <strong>{devForcePrize}</strong>.
          {devForcePrize === BONUS_PRIZE_ID && " После заявки — ещё один спин."}
        </p>
      )}

      {showRespinHint && canSpin && (
        <p className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center text-sm text-primary">
          Книга ваша! Теперь крутите колесо ещё раз — за основным призом.
        </p>
      )}

      <FortuneWheel onResult={onResult} disabled={!canSpin} />

      {prize && (
        <Card className="mt-8 border-accent/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-[hsl(38_70%_40%)]">
              🎁 {prize.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {prize.description}
            </p>
            <WheelLeadForm key={formKey} prize={prize} onSubmitted={onClaimed} />
          </CardContent>
        </Card>
      )}

      {!prize && canSpin && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Один основной спин на человека. Сектор «Ещё раз» — книга в подарок и доп. попытка.
        </p>
      )}

      {!canSpin && !prize && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Вы уже участвовали. Спасибо!
        </p>
      )}

      <p className="mt-10 text-center">
        <Button asChild variant="outline" className="w-full max-w-sm">
          <a href={diagnosticHref} target="_blank" rel="noopener noreferrer">
            Заполнить анкету на диагностику
          </a>
        </Button>
      </p>
    </main>
  );
}
