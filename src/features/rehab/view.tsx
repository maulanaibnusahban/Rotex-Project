import Link from "next/link";
import type { ReactNode } from "react";
import { pageLink, type Query } from "./core";

export function Pagination({ page, size, total, query }: { page: number; size: number; total: number; query: Query }) {
  const last = Math.max(1, Math.ceil(total / size));
  if (last === 1 && page === 1) return null;
  return <nav aria-label="Halaman hasil" className="work-pagination">
    {page > 1 && <Link className="button button-secondary" href={pageLink(query, { page: String(page - 1) })}>Sebelumnya</Link>}
    <span>Halaman {page} dari {last}</span>
    {page < last && <Link className="button button-secondary" href={pageLink(query, { page: String(page + 1) })}>Berikutnya</Link>}
  </nav>;
}

export function WorkPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dashboard-panel work-panel">
      <header className="dashboard-panel-header">
        <div className="panel-title-wrapper">
          <h2>{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}
