'use client';

import { DashboardHeader } from '@/components/ui/DashboardHeader';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import DashboardControls from '@/components/controls/DashboardControls';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      {/* Primary chart — Value over time */}
      <section className="dashboard-section">
        <LineChart />
      </section>

      {/* View, Data, and Load controls directly underneath primary chart */}
      <section className="dashboard-section">
        <DashboardControls />
      </section>

      {/* Secondary charts — Distribution and Volume */}
      <section className="dashboard-section">
        <div className="secondary-charts">
          <div className="chart-area">
            <div className="chart-title">Distribution</div>
            <ScatterPlot />
          </div>
          <div className="chart-area">
            <div className="chart-title">Values by Time</div>
            <BarChart />
          </div>
        </div>
      </section>

      {/* Density Heatmap */}
      <section className="dashboard-section">
        <div className="chart-area full-width-chart">
          <div className="chart-title">Density</div>
          <Heatmap />
        </div>
      </section>

      {/* Raw Data table */}
      <section className="dashboard-section">
        <div className="chart-area">
          <div className="chart-title">Data</div>
          <DataTable />
        </div>
      </section>

      <PerformanceMonitor />
    </>
  );
}
