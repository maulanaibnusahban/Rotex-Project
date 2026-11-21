import type { ReactNode } from "react";
import type { AppointmentStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { formatDate, formatTime } from "./overview";
import { appointmentLabels } from "@/src/features/rehab/clinical-labels";

export function DashboardHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className="dashboard-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </header>
  );
}

type Metric = { label: string; value: number | string; icon: LucideIcon };
const numberFormat = new Intl.NumberFormat("id-ID");

export function DashboardMetrics({ items }: { items: Metric[] }) {
  return (
    <dl className="dashboard-metrics">
      {items.map(({ icon: Icon, label, value }) => (
        <div className="dashboard-metric" key={label}>
          <dt><span className="icon-tile"><Icon size={20} aria-hidden="true" /></span>{label}</dt>
          <dd className={typeof value === "number" ? "dashboard-number" : undefined}>
            {typeof value === "number" ? numberFormat.format(value) : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DashboardPanel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="dashboard-panel" aria-labelledby={`${id}-heading`} tabIndex={-1}>
      <header><h2 id={`${id}-heading`}>{title}</h2></header>
      {children}
    </section>
  );
}

export function DashboardEmpty({ children }: { children: ReactNode }) {
  return <p className="dashboard-empty">{children}</p>;
}

type AppointmentRow = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  name: string;
  secondaryName?: string;
};

export function AppointmentPreview({ rows, nameLabel, empty }: { rows: AppointmentRow[]; nameLabel: string; empty: string }) {
  if (rows.length === 0) return <DashboardEmpty>{empty}</DashboardEmpty>;

  return (
    <table className="dashboard-table">
      <thead><tr><th scope="col">Waktu (WIB)</th><th scope="col">{nameLabel}</th><th scope="col">Status</th></tr></thead>
      <tbody>
        {rows.map(({ id, startAt, endAt, status, name, secondaryName }) => (
          <tr key={id}>
            <td>
              <time dateTime={startAt.toISOString()}>{formatDate(startAt)}</time>
              <span className="dashboard-meta">{formatTime(startAt)}–{formatTime(endAt)}{formatDate(startAt) !== formatDate(endAt) ? `, ${formatDate(endAt)}` : ""}</span>
            </td>
            <td>{name}{secondaryName && <span className="dashboard-meta">{secondaryName}</span>}</td>
            <td><span className="dashboard-status" data-status={status}>{appointmentLabels[status]}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
