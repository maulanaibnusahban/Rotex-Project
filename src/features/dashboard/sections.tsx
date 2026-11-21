import type { ReactNode } from "react";
import type { AppointmentStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { formatDate, formatTime } from "./overview";
import { appointmentLabels } from "@/src/features/rehab/clinical-labels";

export function DashboardHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="dashboard-heading">
      <div className="dashboard-heading-content">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="dashboard-heading-actions">{action}</div>}
    </header>
  );
}

export interface MetricItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
}

const numberFormat = new Intl.NumberFormat("id-ID");

export function DashboardMetrics({ items }: { items: MetricItem[] }) {
  return (
    <dl className="dashboard-metrics">
      {items.map(({ icon: Icon, label, value, hint }) => (
        <div className="dashboard-metric-card" key={label}>
          <div className="metric-card-top">
            <span className="metric-icon-tile">
              <Icon size={16} aria-hidden="true" />
            </span>
            {hint && <span className="metric-hint-pill">{hint}</span>}
          </div>
          <div className="metric-card-data">
            <dd className={typeof value === "number" ? "metric-number" : "metric-text"}>
              {typeof value === "number" ? numberFormat.format(value) : value}
            </dd>
            <dt>{label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function DashboardPanel({
  id,
  title,
  badge,
  action,
  children,
}: {
  id: string;
  title: string;
  badge?: string | number;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="dashboard-panel" aria-labelledby={`${id}-heading`} tabIndex={-1}>
      <header className="dashboard-panel-header">
        <div className="panel-title-wrapper">
          <h2 id={`${id}-heading`}>{title}</h2>
          {badge !== undefined && <span className="panel-badge">{badge}</span>}
        </div>
        {action && <div className="panel-actions">{action}</div>}
      </header>
      <div className="dashboard-panel-body">{children}</div>
    </section>
  );
}

export function DashboardEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-empty-state">
      <p>{children}</p>
    </div>
  );
}

export type AppointmentRow = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  name: string;
  secondaryName?: string;
};

export function AppointmentPreview({
  rows,
  nameLabel,
  empty,
}: {
  rows: AppointmentRow[];
  nameLabel: string;
  empty: string;
}) {
  if (rows.length === 0) return <DashboardEmpty>{empty}</DashboardEmpty>;

  return (
    <div className="dashboard-table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th scope="col">Waktu Terapi (WIB)</th>
            <th scope="col">{nameLabel}</th>
            <th scope="col">Status Sesi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, startAt, endAt, status, name, secondaryName }) => (
            <tr key={id}>
              <td>
                <time dateTime={startAt.toISOString()} className="table-time-primary">
                  {formatDate(startAt)}
                </time>
                <span className="dashboard-meta">
                  {formatTime(startAt)} – {formatTime(endAt)}
                  {formatDate(startAt) !== formatDate(endAt) ? `, ${formatDate(endAt)}` : ""}
                </span>
              </td>
              <td>
                <strong className="table-person-name">{name}</strong>
                {secondaryName && <span className="dashboard-meta">{secondaryName}</span>}
              </td>
              <td>
                <span className="status-pill" data-status={status}>
                  <span className="status-dot" />
                  {appointmentLabels[status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
