// Server component — static dashboard structure
// Charts and controls are client components rendered within this shell

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <h1>Performance Dashboard</h1>
        <div className="header-meta">
          <span className="live-indicator">
            <span className="live-dot active" />
            <span>LIVE</span>
          </span>
        </div>
      </header>

      {/* Primary chart area */}
      <section className="dashboard-section">
        <div className="section-label">Time Series</div>
        <div className="chart-area primary-chart">
          <div className="chart-title">Line Chart</div>
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Chart renders here — Phase 4
          </div>
        </div>
      </section>

      {/* Time controls placeholder */}
      <section className="dashboard-section">
        <div className="controls-bar">
          <div className="control-group">
            <span className="control-label">Time range</span>
            <button className="control-button active">1h</button>
            <button className="control-button">6h</button>
            <button className="control-button">24h</button>
          </div>
          <div className="control-group">
            <span className="control-label">Aggregation</span>
            <button className="control-button active">1min</button>
            <button className="control-button">5min</button>
            <button className="control-button">1hour</button>
          </div>
        </div>
      </section>

      {/* Secondary charts */}
      <section className="dashboard-section">
        <div className="section-label">Analysis</div>
        <div className="secondary-charts">
          <div className="chart-area">
            <div className="chart-title">Scatter Plot</div>
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Phase 5
            </div>
          </div>
          <div className="chart-area">
            <div className="chart-title">Bar Chart</div>
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Phase 5
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap */}
      <section className="dashboard-section">
        <div className="section-label">Density</div>
        <div className="chart-area full-width-chart">
          <div className="chart-title">Heatmap</div>
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Phase 5
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Data controls placeholder */}
      <section className="dashboard-section">
        <div className="section-label">Data Controls</div>
        <div className="controls-bar">
          <div className="control-group">
            <span className="control-label">Categories</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Phase 6</span>
          </div>
        </div>
      </section>

      {/* Data table placeholder */}
      <section className="dashboard-section">
        <div className="section-label">Data Table</div>
        <div className="data-table-container">
          <div className="data-table-header">
            <span>Timestamp</span>
            <span>Value</span>
            <span>Category</span>
          </div>
          <div className="data-table-viewport" style={{ height: '200px' }}>
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              Virtual table — Phase 7
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Performance footer */}
      <footer className="perf-footer">
        <div className="perf-metric">
          <span className="perf-metric-label">FPS</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Memory</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Render</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Processing</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Points</span>
          <span className="perf-metric-value mono">—</span>
        </div>
      </footer>
    </>
  );
}
