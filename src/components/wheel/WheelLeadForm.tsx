"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WheelPrize } from "@/lib/wheel-prizes";
import {
  formatRussianPhone,
  formatTelegram,
  phoneDigitsCount,
  telegramForSubmit,
} from "@/lib/input-format";
import { getTelegramUserId, getTelegramUsername } from "@/lib/telegram-webapp";
import { PrizeClaimSuccess } from "@/components/wheel/PrizeClaimSuccess";

type Props = {
  prize: WheelPrize;
  telegramUserId?: number | null;
  spinPeriod?: string;
  onSubmitted?: (prize: WheelPrize) => void;
};

export function WheelLeadForm({ prize, telegramUserId, spinPeriod, onSubmitted }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    const fromTg = getTelegramUsername();
    if (fromTg) setTelegram((prev) => (prev && prev !== "@" ? prev : fromTg));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phoneDigitsCount(phone) < 11) return;
    setStatus("loading");

    try {
      const resolvedUserId = telegramUserId ?? getTelegramUserId();
      const res = await fetch("/api/claim-prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prizeId: prize.id,
          prizeTitle: prize.title,
          fullName: name.trim(),
          phone: phone.trim(),
          telegram: telegramForSubmit(telegram) ?? getTelegramUsername() ?? undefined,
          ...(resolvedUserId ? { telegramUserId: resolvedUserId } : {}),
          ...(spinPeriod ? { spinPeriod } : {}),
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("ok");
      onSubmitted?.(prize);
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return <PrizeClaimSuccess prize={prize} />;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wheel-name">Имя</Label>
        <Input
          id="wheel-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как к вам обращаться"
          required
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wheel-phone">Телефон</Label>
        <Input
          id="wheel-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onFocus={() => {
            if (!phone) setPhone("+7");
          }}
          onChange={(e) => setPhone(formatRussianPhone(e.target.value))}
          placeholder="+7 (999) 123-45-67"
          required
          autoComplete="tel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wheel-tg">Telegram (необязательно)</Label>
        <Input
          id="wheel-tg"
          value={telegram}
          onFocus={() => {
            if (!telegram) setTelegram("@");
          }}
          onChange={(e) => setTelegram(formatTelegram(e.target.value))}
          placeholder="@username"
          autoComplete="username"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">
          Не удалось отправить. Попробуйте ещё раз или напишите в поддержку.
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "Отправляем…" : "Забрать приз"}
      </Button>
    </form>
  );
}
