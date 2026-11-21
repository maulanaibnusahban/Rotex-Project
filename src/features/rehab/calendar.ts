import { dayKey, dayMs, first, parseLocal, type Query } from "./core";

const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format;
export const calendarViews = { day: "Hari", week: "Minggu", month: "Bulan" } as const;
export type CalendarView = keyof typeof calendarViews;
export const hourMs = 3_600_000;

export function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * dayMs);
}

function monday(date: Date) {
  const weekday = new Date(dayKey(date) + "T00:00:00Z").getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

function moveMonth(date: Date, amount: number) {
  const utc = new Date(dayKey(date) + "T00:00:00Z");
  const day = utc.getUTCDate();
  utc.setUTCDate(1);
  utc.setUTCMonth(utc.getUTCMonth() + amount);
  const lastDay = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth() + 1, 0)).getUTCDate();
  return addDays(new Date(utc.getTime() - 7 * hourMs), Math.min(day, lastDay) - 1);
}

export function calendarRange(query: Query) {
  const requested = first(query.view);
  const view: CalendarView = requested === "day" || requested === "month" ? requested : "week";
  const today = dayKey(new Date());
  const anchor = parseLocal(first(query.date) + "T00:00") ?? parseLocal(today + "T00:00")!;
  const monthStart = addDays(anchor, 1 - Number(dayKey(anchor).slice(8)));
  const start = view === "day" ? anchor : monday(view === "week" ? anchor : monthStart);
  const end = view === "month" ? addDays(monday(addDays(moveMonth(monthStart, 1), -1)), 7)
    : addDays(start, view === "day" ? 1 : 7);
  const days = Array.from({ length: (end.getTime() - start.getTime()) / dayMs }, (_, index) => addDays(start, index));
  const move = (amount: number) => view === "month" ? moveMonth(anchor, amount) : addDays(anchor, amount * (view === "week" ? 7 : 1));
  return { view, today, anchor, start, end, days, month: monthLabel(anchor), previous: move(-1), next: move(1) };
}

export type CalendarRange = ReturnType<typeof calendarRange>;
