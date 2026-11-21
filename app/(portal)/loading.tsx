export default function PortalLoading() {
  return (
    <div className="dashboard-overview dashboard-loading" role="status">
      <p>Memuat dashboard…</p>
      <div className="dashboard-loading-metrics" aria-hidden="true"><span /><span /><span /></div>
      <div className="dashboard-loading-panel" aria-hidden="true" />
    </div>
  );
}
