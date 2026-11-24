export const MAX_TEXT_LENGTH = 500;
export const MAX_PANTRY_ITEMS = 100;
export const MAX_INGREDIENT_LENGTH = 100;

export function hasControlChars(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function cleanText(value: unknown, maxLength = MAX_TEXT_LENGTH): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (cleaned.length === 0 || cleaned.length > maxLength || hasControlChars(cleaned)) {
    return null;
  }
  return cleaned;
}

export function optionalText(
  value: unknown,
  maxLength = MAX_TEXT_LENGTH,
): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  if (cleaned.length === 0) return null;
  if (cleaned.length > maxLength || hasControlChars(cleaned)) return undefined;
  return cleaned;
}

export function isValidEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    value.length <= 256 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9\s]/.test(value) &&
    !hasControlChars(value)
  );
}
