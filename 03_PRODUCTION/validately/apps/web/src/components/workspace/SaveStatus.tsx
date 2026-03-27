"use client";

type Status = "saved" | "saving" | "error" | "offline";

const STATUS_CONFIG: Record<Status, { text: string; color: string }> = {
  saved: { text: "Saved", color: "text-success" },
  saving: { text: "Saving...", color: "text-warning" },
  error: { text: "Save failed", color: "text-danger" },
  offline: { text: "Offline", color: "text-content-subtle" },
};

export function SaveStatus({ status }: { status: Status }) {
  const { text, color } = STATUS_CONFIG[status];
  return (
    <span className={`text-[10px] font-medium ${color}`} role="status">
      {text}
    </span>
  );
}
