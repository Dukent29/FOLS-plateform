export function formText(form: FormData, name: string, maxLength: number) {
  const raw = form.get(name);
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value.length <= maxLength ? value : null;
}

export function objectText(record: Record<string, unknown>, name: string, maxLength: number) {
  const raw = record[name];
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value.length <= maxLength ? value : null;
}

export function formNumber(
  form: FormData,
  name: string,
  options: { min: number; max: number; integer?: boolean },
) {
  const raw = form.get(name);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  if (
    !Number.isFinite(value) ||
    value < options.min ||
    value > options.max ||
    (options.integer && !Number.isInteger(value))
  ) {
    return null;
  }
  return value;
}

export function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
