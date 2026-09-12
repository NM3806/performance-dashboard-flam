'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <div className="error-message">
        Something went wrong loading the dashboard.
        <br />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {error.message}
        </span>
      </div>
      <button className="error-retry" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
