"use client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface text-content font-sans">
      {children}
    </div>
  );
}
