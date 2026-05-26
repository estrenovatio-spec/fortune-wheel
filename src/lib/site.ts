/** Кнопка «Заполнить анкету на диагностику» */
export function diagnosticUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DIAGNOSTIC_URL?.trim();
  if (fromEnv) return fromEnv;
  return "https://forms.yandex.ru/u/69f6ffac493639605fd288cd";
}
