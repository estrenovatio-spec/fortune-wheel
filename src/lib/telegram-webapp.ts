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

export function getTelegramUserId(): number | null {
  const user = getTelegramWebApp()?.initDataUnsafe?.user;
  return user?.id ?? null;
}

/** Id пользователя Mini App + инициализация WebApp */
export function useTelegramUserId(): number | null {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    tg.ready();
    tg.expand();
    const id = tg.initDataUnsafe?.user?.id;
    if (id) setUserId(id);
  }, []);

  return userId;
}
