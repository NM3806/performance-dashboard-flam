# Performance Data Visualization Dashboard

A real-time time-series visualization dashboard built with Next.js App Router, TypeScript, and the HTML5 Canvas API. Designed to render and stream 10,000+ data points at 60 FPS without external charting libraries.

## Setup & Running

### Requirements
- Node.js 18.18+ (Node 20+ recommended)
- npm

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## Architecture

1. **State vs. Data Separation**:
   - High-frequency data points (100ms interval) are stored directly in a `React.MutableRefObject<DataPoint[]>`.
   - Incoming points are appended to the ref without triggering React reconciliation for each point.
   - A `dataVersion` integer counter notifies components to redraw at throttled intervals (~500ms normal, ~32ms in stress mode).

2. **Canvas Rendering Engine**:
   - Charts are rendered directly with the 2D Canvas API using device pixel ratio (DPR) scaling for crisp lines.
   - All render passes are scheduled using `requestAnimationFrame` to avoid redundant draws.
   - Horizontal pixel downsampling skips drawing redundant vertices when multiple points map to the same screen pixel.

3. **Memory Management**:
   - A sliding window trims the oldest entries when point counts exceed the target (e.g. 10,000), keeping memory consumption stable over long sessions.

4. **Table Virtualization**:
   - The raw data table renders only the visible rows (~10–20 rows) plus a small overscan buffer, keeping DOM node count low regardless of dataset size (10K to 50K rows).

---

## Features

- **Primary Chart (`Value over time`)**: Dominant canvas line chart supporting wheel zoom, pointer drag pan, view reset, and an interactive legend that toggles series visibility.
- **Secondary Views**:
  - `Distribution`: Scatter plot displaying value spreads across active series.
  - `Values by Time`: Aggregated bar chart showing bucketed averages.
  - `Density`: Compact 2D density heatmap.
- **Unified Filters**: Series toggles and time ranges apply synchronously across all charts and the data table.
- **Controls**:
  - **View**: Time range (`1h`, `6h`, `24h`, `All`) and aggregation bucket (`1min`, `5min`, `1hour`).
  - **Data**: Target point load (`10K`, `25K`, `50K`), stream toggle (`Pause`/`Resume`), stress test mode (`On`/`Off`), and fresh data regeneration.
- **Header Metrics**: Real-time header readout displaying dataset point count, live FPS counter, and streaming status.

---

## Performance Measurements

| Scenario | Point Count | Stream Interval | Target FPS | Measured FPS | Render Time |
|---|---|---|---|---|---|
| Default Load | 10,000 | 100 ms | 60 | 60 | ~1.2 ms |
| Stress Mode | 50,000 | 16 ms | 60 | 58–60 | ~3.8 ms |
| Interactive Pan / Zoom | 10,000–50,000 | Active | 60 | 60 | ~1.5–4.0 ms |
| Virtualized Table Scroll | 50,000 rows | Active | 60 | 60 | <1.0 ms |
