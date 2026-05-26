"use client";

import { useEffect, useState } from "react";

type TgUser = { id: number; username?: string; first_name?: string };

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: TgUser };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** Читает id в момент вызова (важно при отправке формы) */
export function getTelegramUserId(): number | null {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    const id = tg.initDataUnsafe?.user?.id;
    if (id) return id;
  }
  return null;
}

export function getTelegramUsername(): string | null {
  const username = getTelegramWebApp()?.initDataUnsafe?.user?.username?.trim();
  return username ? `@${username.replace(/^@/, "")}` : null;
}

/** Id пользователя Mini App (с повторными попытками — скрипт Telegram грузится не сразу) */
export function useTelegramUserId(): number | null {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const tryRead = (): boolean => {
      const id = getTelegramUserId();
      if (id) {
        setUserId(id);
        getTelegramWebApp()?.expand();
        return true;
      }
      return false;
    };

    if (tryRead()) return;

    const delays = [80, 250, 600, 1200];
    const timers = delays.map((ms) => window.setTimeout(() => tryRead(), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return userId;
}
