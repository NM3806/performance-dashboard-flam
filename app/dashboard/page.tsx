'use client';

import { DashboardHeader } from '@/components/ui/DashboardHeader';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import FilterPanel from '@/components/controls/FilterPanel';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      {/* Primary chart — line */}
      <section className="dashboard-section">
        <div className="section-label">Time Series</div>
        <LineChart />
      </section>

      {/* Time controls */}
      <section className="dashboard-section">
        <TimeRangeSelector />
      </section>

      {/* Secondary charts */}
      <section className="dashboard-section">
        <div className="section-label">Analysis</div>
        <div className="secondary-charts">
          <div className="chart-area">
            <div className="chart-title">Scatter Plot</div>
            <ScatterPlot />
          </div>
          <div className="chart-area">
            <div className="chart-title">Bar Chart</div>
            <BarChart />
          </div>
        </div>
      </section>

      {/* Heatmap */}
      <section className="dashboard-section">
        <div className="section-label">Density</div>
        <div className="chart-area full-width-chart">
          <div className="chart-title">Heatmap</div>
          <Heatmap />
        </div>
      </section>

      <hr className="section-divider" />

      {/* Data controls */}
      <section className="dashboard-section">
        <div className="section-label">Data Controls</div>
        <div className="controls-bar">
          <div className="control-group">
            <span className="control-label">Categories</span>
            <FilterPanel />
          </div>
        </div>
      </section>

      {/* Data table */}
      <section className="dashboard-section">
        <div className="section-label">Data Table</div>
        <DataTable />
      </section>

      <hr className="section-divider" />

      <PerformanceMonitor />
    </>
  );
}
