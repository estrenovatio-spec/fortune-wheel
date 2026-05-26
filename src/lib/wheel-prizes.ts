export type WheelPrizeType = "content" | "access" | "service" | "discount" | "retry";

export type WheelPrize = {
  id: string;
  /** Подпись на барабане (широкие секторы) */
  label: string;
  /** Узкий сектор (~< 24°) */
  shortLabel?: string;
  /** Очень узкий сектор (~< 12°) */
  tinyLabel?: string;
  title: string;
  description: string;
  weight: number;
  color: string;
  type: WheelPrizeType;
  promoCode?: string;
  /** Ссылка «написать в личку» в Telegram */
  telegramDmUrl?: string;
  /** Ссылка на файл/страницу сразу после заявки */
  claimHref?: string;
  isRetry?: boolean;
};

/** Порядок секторов на колесе (по часовой стрелке от верха) */
export const WHEEL_PRIZES: WheelPrize[] = [
  {
    id: "checklist",
    label: "Чек-лист",
    title: "Чек-лист «5 вопросов перед инвестированием»",
    description:
      "Короткий PDF: 5 вопросов, которые важно задать себе до первых вложений — чтобы не терять деньги на эмоциях и спешке.\n\n📥 Скачайте сразу после ввода контактов — кнопка ниже.",
    weight: 25,
    color: "#3d5c6e",
    type: "content",
    claimHref: "https://disk.yandex.ru/i/oR3ul86Sh5vVrw",
  },
  {
    id: "roadmap",
    label: "Конструктор",
    shortLabel: "🧩",
    title: "🧩 Конструктор целей",
    description:
      "Преврати мечту в план за 5 минут.\n\nЧто внутри:\n• Пошаговый шаблон в Notion (без сложных таблиц)\n• Видеоинструкция: как заполнить без стресса (5 мин)\n• Примеры: подушка, техника, путешествие\n• Формула: Мечта → Цифра → Срок → Шаг\n\n⏱ Формат: самообучение, одна цель за раз.\n🔗 Ссылка придёт сразу после выигрыша.",
    weight: 20,
    color: "#6e4a3d",
    type: "content",
    claimHref:
      "https://steep-enthusiasm-b41.notion.site/8c05abe6a9364549a890d73f497216f9",
  },
  {
    id: "voicebudget",
    label: "Голос",
    title: "VoiceBudget (beta)",
    description:
      "Ранний доступ к приложению для ведения бюджета голосом.\n\n🎁 Бесплатный пробный период — 30 дней.\n📲 Доступ придёт в Telegram в течение 5 минут.\n\nПриложение в стадии тестирования — ваши отзывы помогут сделать его лучше!",
    weight: 10,
    color: "#2d5a4a",
    type: "access",
  },
  {
    id: "club",
    label: "Клуб 7 дней",
    title: "Клуб капитала — 7 дней",
    description:
      "Тестовый доступ в закрытый Клуб капитала на 7 дней: материалы, эфиры, окружение.\n\n🔐 Ссылка в Telegram-группу — сразу после ввода контактов.\n📅 Вступите в течение 7 дней с момента выигрыша.",
    weight: 10,
    color: "#5c3d6e",
    type: "access",
  },
  {
    id: "diagnostics",
    label: "Диагностика",
    shortLabel: "Диагн.",
    title: "Финансовый разбор",
    description:
      "Полная финансовая диагностика + рекомендация следующего шага.\n\n📊 Формат: онлайн, ~30 минут.\n📌 Запись — по ссылке после ввода контактов.",
    weight: 9,
    color: "#4a3728",
    type: "service",
  },
  {
    id: "discount30",
    label: "−30%",
    title: "Сопровождение со скидкой",
    description:
      "Программа финансового сопровождения — скидка 30% на первый месяц.\n\n🕒 Действует при заключении договора на 3+ месяца.\n💬 После заявки — напишите в личку СРАЗУ (кнопка ниже), код SPIN30.",
    weight: 9,
    color: "#c9a227",
    type: "discount",
    promoCode: "SPIN30",
    telegramDmUrl: "https://t.me/m/60JBjgwmMDky",
  },
  {
    id: "discount50",
    label: "−50%",
    title: "Стратегическая сессия со скидкой 50%",
    description:
      "Персональная стратегическая сессия (4 часа) с финансовым советником по специальной цене.\n\nПосле диагностики вы обсудите ваш план и следующие шаги в формате расширенной сессии.\n\n🕒 Действует 14 дней с момента выигрыша.\n💬 После заявки — напишите в личку СРАЗУ (кнопка ниже), код SPIN50.",
    weight: 8,
    color: "#1e3a5f",
    type: "discount",
    promoCode: "SPIN50",
    telegramDmUrl: "https://t.me/m/MlOHzqtkZjRi",
  },
  {
    id: "question",
    label: "Вопрос",
    shortLabel: "?",
    title: "Разбор в Telegram",
    description:
      "Один финансовый вопрос — персональный ответ советника.\n\n⏱️ Ответ в течение 48 часов в рабочее время.\n💬 Напишите вопрос в личку СРАЗУ — кнопка ниже.",
    weight: 5,
    color: "#2a4a6e",
    type: "service",
    telegramDmUrl: "https://t.me/m/cD2M9jU0MTMy",
  },
  {
    id: "discount20_year",
    label: "−20%",
    shortLabel: "−20%",
    tinyLabel: "20%",
    title: "Годовая программа",
    description:
      "Персональная скидка 20% на годовое сопровождение в SG Capital.\n\n🕒 Действует 30 дней с момента выигрыша.\n💬 После заявки — напишите в личку СРАЗУ (кнопка ниже), код SPIN20.",
    weight: 2,
    color: "#8b6914",
    type: "discount",
    promoCode: "SPIN20",
    telegramDmUrl: "https://t.me/m/2UeP2FsPOTli",
  },
  {
    id: "retry",
    label: "Ещё раз",
    shortLabel: "Ещё",
    tinyLabel: "↻",
    title: "Ещё раз — книга и доп. спин",
    description:
      "Это не пустой сектор: вы получаете и подарок, и ещё одну попытку.\n\n📚 Книга «Самый богатый человек в Вавилоне» — ссылка после контактов.\n🔄 После заявки можно крутить колесо ещё раз на основной приз.\n\n📥 Оставьте контакты ниже.",
    weight: 2,
    color: "#6b7280",
    type: "content",
    claimHref: "https://disk.yandex.ru/i/RkxPqAAAJfXeDA",
  },
];

export function getPrizeById(id: string): WheelPrize | undefined {
  return WHEEL_PRIZES.find((p) => p.id === id);
}

/** Сектор «Ещё раз»: книга + одна дополнительная попытка крутить */
export const BONUS_PRIZE_ID = "retry";

export function isBonusPrize(prize: WheelPrize): boolean {
  return prize.id === BONUS_PRIZE_ID;
}

/** Подпись на барабане с учётом ширины сектора */
export function labelForSegment(prize: WheelPrize, sectorDeg: number): string {
  if (sectorDeg < 12 && prize.tinyLabel) return prize.tinyLabel;
  if (sectorDeg < 24 && prize.shortLabel) return prize.shortLabel;
  return prize.label;
}
