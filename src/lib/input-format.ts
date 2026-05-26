export function formatRussianPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  else if (digits.length > 0 && !digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const rest = digits.startsWith("7") ? digits.slice(1) : digits;
  if (rest.length === 0) return "+7";

  let out = "+7";
  if (rest.length > 0) out += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) out += `) ${rest.slice(3, 6)}`;
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
  return out;
}

export function phoneDigitsCount(formatted: string): number {
  return formatted.replace(/\D/g, "").length;
}

export function formatTelegram(input: string): string {
  const cleaned = input.replace(/^@+/, "").replace(/[^\w]/g, "");
  if (!cleaned) return "@";
  return `@${cleaned}`;
}

export function telegramForSubmit(value: string): string | undefined {
  const v = value.trim();
  if (!v || v === "@") return undefined;
  return v.startsWith("@") ? v : `@${v}`;
}
