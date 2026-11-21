"use client";

export default function PortalError({ reset }: { reset: () => void }) {
  return (
    <section className="dashboard-panel dashboard-unavailable" aria-labelledby="dashboard-error-title">
      <h1 id="dashboard-error-title">Dashboard belum dapat dimuat</h1>
      <p>Coba muat dashboard kembali.</p>
      <button className="button button-primary" type="button" onClick={reset}>Coba lagi</button>
    </section>
  );
}
