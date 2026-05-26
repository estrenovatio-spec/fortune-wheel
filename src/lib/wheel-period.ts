/** Период спина YYYY-MM по календарю Москвы (сброс 1-го числа каждого месяца) */
const TZ = "Europe/Moscow";

export const WHEEL_PERIOD_KEY = "sg-wheel-period";
const LEGACY_DONE_KEY = "sg-wheel-done";

export function currentSpinPeriod(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

export function getStoredSpinPeriod(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const period = localStorage.getItem(WHEEL_PERIOD_KEY);
    if (period) return period;
    if (sessionStorage.getItem(LEGACY_DONE_KEY) === "1") {
      return currentSpinPeriod();
    }
    return null;
  } catch {
    return null;
  }
}

export function markSpunThisPeriod(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WHEEL_PERIOD_KEY, currentSpinPeriod());
    sessionStorage.removeItem(LEGACY_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearStoredSpinPeriod(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WHEEL_PERIOD_KEY);
    sessionStorage.removeItem(LEGACY_DONE_KEY);
  } catch {
    /* ignore */
  }
}

export type SpinAvailability = {
  canSpin: boolean;
  /** Прошлый месяц уже крутили — новый месяц открыт */
  newMonthAvailable: boolean;
  lastPeriod: string | null;
  currentPeriod: string;
};

export function getSpinAvailability(): SpinAvailability {
  const currentPeriod = currentSpinPeriod();
  const lastPeriod = getStoredSpinPeriod();

  if (!lastPeriod) {
    return { canSpin: true, newMonthAvailable: false, lastPeriod: null, currentPeriod };
  }
  if (lastPeriod < currentPeriod) {
    return { canSpin: true, newMonthAvailable: true, lastPeriod, currentPeriod };
  }
  if (lastPeriod === currentPeriod) {
    return { canSpin: false, newMonthAvailable: false, lastPeriod, currentPeriod };
  }
  return { canSpin: true, newMonthAvailable: false, lastPeriod, currentPeriod };
}
