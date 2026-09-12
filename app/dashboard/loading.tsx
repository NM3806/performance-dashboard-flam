export default function DashboardLoading() {
  return (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
          Loading dashboard…
        </div>
        <div className="loading-bar">
          <div className="loading-bar-inner" />
        </div>
      </div>
    </div>
  );
}
