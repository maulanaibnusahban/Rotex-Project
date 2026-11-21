import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Role, type AppointmentStatus } from "@prisma/client";
import type { CSSProperties } from "react";
import { addDays, calendarViews, hourMs, type CalendarRange } from "./calendar";
import { appointmentLabels } from "./clinical-labels";
import { dayKey, formatDate, formatTime, longDate, pageLink, type Query } from "./core";

type CalendarAppointment = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  doctor: { user: { name: string } };
  patient: { user: { name: string } };
};

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" }).format;

export function intervalLabel(row: Pick<CalendarAppointment, "startAt" | "endAt">) {
  const endDate = dayKey(row.startAt) === dayKey(row.endAt) ? "" : formatDate(row.endAt) + " ";
  return formatTime(row.startAt) + "–" + endDate + formatTime(row.endAt) + " WIB";
}

export function appointmentHref(audience: Role, id: string) {
  return "/" + audience.toLowerCase() + "/appointments/" + id;
}

export function newAppointmentHref(audience: Role, date: string, time?: string, doctor?: string) {
  const params = new URLSearchParams({ date });
  if (time) params.set("time", time);
  if (doctor) params.set("doctor", doctor);
  return "/" + audience.toLowerCase() + "/appointments/new?" + params.toString();
}

function calendarEvent(row: CalendarAppointment, audience: Role) {
  const name = audience === Role.PATIENT ? row.doctor.user.name : row.patient.user.name;
  const label = [name, audience === Role.ADMIN ? row.doctor.user.name : "", intervalLabel(row), appointmentLabels[row.status]].filter(Boolean).join(" · ");
  return { name, label, href: appointmentHref(audience, row.id) };
}

function MonthGrid({ days, range, query, audience }: {
  days: { date: Date; rows: CalendarAppointment[] }[];
  range: CalendarRange;
  query: Query;
  audience: Role;
}) {
  const selected = dayKey(range.anchor);
  return <div className="calendar-month" aria-label="Kalender bulanan">
    {weekDays.map(label => <div className="calendar-weekday" key={label}>{label}</div>)}
    {days.map(({ date, rows }) => {
      const key = dayKey(date);
      const selectHref = pageLink(query, { date: key, page: "1" });
      return <div className="calendar-month-cell" key={key} data-outside={key.slice(0, 7) !== selected.slice(0, 7)} data-selected={key === selected}>
        <Link className="calendar-date" href={selectHref} aria-current={key === range.today ? "date" : undefined}
          aria-label={longDate(date) + ", " + rows.length + " janji" + (key === selected ? ", dipilih" : "")}>
          {dateNumber(key)}
        </Link>
        {rows.length > 0 && <span className="calendar-month-count" aria-hidden="true">{rows.length}</span>}
        <div className="calendar-month-events">
          {rows.slice(0, 2).map(row => {
            const event = calendarEvent(row, audience);
            return <Link key={row.id} className="calendar-event" data-status={row.status} href={event.href} title={event.label} aria-label={event.label}>
              {row.startAt < date ? "00.00" : formatTime(row.startAt)} {event.name}
            </Link>;
          })}
          {rows.length > 2 && <Link className="calendar-more" href={selectHref}>+{rows.length - 2} janji</Link>}
        </div>
      </div>;
    })}
  </div>;
}

function dateNumber(key: string) {
  return Number(key.slice(8));
}

function placeEvents(rows: CalendarAppointment[], date: Date) {
  const startOfDay = date.getTime();
  const nextDay = addDays(date, 1).getTime();
  const groups: { tracks: number[]; end: number; events: { row: CalendarAppointment; start: number; end: number; track: number }[] }[] = [];
  for (const row of rows) {
    const start = Math.max(row.startAt.getTime(), startOfDay);
    const end = Math.min(row.endAt.getTime(), nextDay);
    if (!groups.length || start >= groups.at(-1)!.end) groups.push({ tracks: [], end, events: [] });
    const group = groups.at(-1)!;
    let track = group.tracks.findIndex(trackEnd => trackEnd <= start);
    if (track < 0) track = group.tracks.length;
    group.tracks[track] = end;
    group.end = Math.max(group.end, end);
    group.events.push({ row, start: (start - startOfDay) / hourMs, end: (end - startOfDay) / hourMs, track });
  }
  return groups.flatMap(group => group.events.map(event => ({ ...event, width: 100 / group.tracks.length })));
}

function Timeline({ days, range, query, audience, doctor }: {
  days: { date: Date; rows: CalendarAppointment[] }[];
  range: CalendarRange;
  query: Query;
  audience: Role;
  doctor?: string;
}) {
  const selected = dayKey(range.anchor);
  const columns = days.map(day => ({ ...day, events: placeEvents(day.rows, day.date) }));
  const allEvents = columns.flatMap(column => column.events);
  const firstHour = allEvents.reduce((hour, event) => Math.min(hour, Math.floor(event.start)), 7);
  const lastHour = allEvents.reduce((hour, event) => Math.max(hour, Math.ceil(event.end)), 19);
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const hourLabel = (hour: number) => String(hour).padStart(2, "0") + ":00";
  return <div className="calendar-timeline" data-week={range.view === "week"} style={{ "--calendar-days": days.length } as CSSProperties}>
    <div className="calendar-timezone">WIB</div>
    {columns.map(({ date, rows }) => {
      const key = dayKey(date);
      return <Link className="calendar-day-heading calendar-date" key={key} href={pageLink(query, { date: key, page: "1" })}
        data-selected={key === selected} aria-current={key === range.today ? "date" : undefined}
        aria-label={longDate(date) + ", " + rows.length + " janji" + (key === selected ? ", dipilih" : "")}>
        <span>{weekday(date)}</span><strong>{dateNumber(key)}</strong><small>{rows.length ? rows.length + " janji" : "—"}</small>
      </Link>;
    })}
    <div className="calendar-time-labels" aria-hidden="true">{hours.map(hour => <div key={hour}>{hourLabel(hour)}</div>)}</div>
    {columns.map(({ date, events }) => {
      const key = dayKey(date);
      return <section className="calendar-hour-column" key={key} aria-label={longDate(date)}>
        {hours.map(hour => audience !== Role.PATIENT
          ? <Link key={hour} className="calendar-hour" href={newAppointmentHref(audience, key, hourLabel(hour), doctor)}
            prefetch={false} aria-label={"Buat jadwal " + longDate(date) + " pukul " + hourLabel(hour) + " WIB"}><span aria-hidden="true">+</span></Link>
          : <div key={hour} className="calendar-hour" />)}
        {events.map(({ row, start, end, width, track }) => {
          const event = calendarEvent(row, audience);
          return <Link key={row.id} className="calendar-event calendar-timed-event" data-status={row.status} href={event.href}
            title={event.label} aria-label={event.label} style={{
              insetBlockStart: ((start - firstHour) / hours.length * 100) + "%",
              blockSize: ((end - start) / hours.length * 100) + "%",
              insetInlineStart: (track * width) + "%", inlineSize: width + "%",
            }}>
            {formatTime(row.startAt)} · {event.name}
          </Link>;
        })}
      </section>;
    })}
  </div>;
}

export function AppointmentCalendar({ rows, range, query, audience, doctor }: {
  rows: CalendarAppointment[];
  range: CalendarRange;
  query: Query;
  audience: Role;
  doctor?: string;
}) {
  const period = range.view === "day" ? longDate(range.anchor) : range.view === "month" ? range.month
    : formatDate(range.start) + " – " + formatDate(range.days.at(-1)!);
  const days = range.days.map(date => ({
    date, rows: rows.filter(row => row.startAt < addDays(date, 1) && row.endAt > date),
  }));
  return <div className="calendar">
    <div className="calendar-toolbar">
      <div className="calendar-period">
        <Link className="calendar-icon" aria-label="Periode sebelumnya" href={pageLink(query, { date: dayKey(range.previous), page: "1" })}><ChevronLeft size={20} aria-hidden="true" /></Link>
        <Link className="calendar-icon" aria-label="Periode berikutnya" href={pageLink(query, { date: dayKey(range.next), page: "1" })}><ChevronRight size={20} aria-hidden="true" /></Link>
        <Link className="button button-secondary" href={pageLink(query, { date: range.today, page: "1" })}>Hari ini</Link>
        <p>{period}</p>
      </div>
      <nav className="calendar-switch" aria-label="Tampilan kalender">
        {Object.entries(calendarViews).map(([view, label]) =>
          <Link key={view} href={pageLink(query, { view, date: dayKey(range.anchor), page: "1" })}
            aria-current={view === range.view ? "true" : undefined}>{label}</Link>)}
      </nav>
    </div>
    {range.view === "month" ? <MonthGrid days={days} range={range} query={query} audience={audience} />
      : <Timeline days={days} range={range} query={query} audience={audience} doctor={doctor} />}
  </div>;
}
