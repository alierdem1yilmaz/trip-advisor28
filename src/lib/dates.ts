// Open-Meteo's forecast API covers a maximum 16-day horizon — the real,
// documented ceiling on how far out weather (and therefore weather-aware
// replanning) can be trusted. Trip dates are capped to this window so the
// app never promises weather-adaptive planning it can't back up.
export const WEATHER_FORECAST_HORIZON_DAYS = 16;
export const MAX_TRIP_LENGTH_DAYS = 7;

// Builds YYYY-MM-DD from the date's LOCAL components. Deliberately not
// `date.toISOString().slice(0, 10)` — that converts to UTC first, which
// silently shifts the calendar day by one in any timezone ahead of UTC
// (e.g. Turkey, UTC+3): local midnight becomes the previous UTC day.
function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIso(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

export function diffInDaysIso(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function formatFriendlyIso(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}
