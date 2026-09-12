import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Performance Dashboard",
  description: "High-performance real-time data visualization dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
