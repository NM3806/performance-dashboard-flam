import { DataProvider } from '@/components/providers/DataProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <DataProvider>
        {children}
      </DataProvider>
    </div>
  );
}
