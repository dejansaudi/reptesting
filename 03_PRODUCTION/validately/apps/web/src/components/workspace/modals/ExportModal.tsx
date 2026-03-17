"use client";
import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";
import { Modal } from "../Modal";

type ExportStatus = "idle" | "queued" | "processing" | "completed" | "failed";

export function ExportModal({ onClose }: { onClose: () => void }) {
  const projectId = useProjectStore((s) => s.projectId);
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({ pdf: "idle", "pitch-deck": "idle" });
  const [error, setError] = useState<string | null>(null);

  const startExport = useCallback(async (type: string) => {
    if (!projectId) return;
    setError(null);
    setStatuses((s) => ({ ...s, [type]: "queued" }));
    try {
      const res = await apiFetch(type === "pdf" ? "/export/pdf" : "/export/pitch-deck", {
        method: "POST", body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error();
      const { jobId } = await res.json();
      // Poll for completion
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const poll = await apiFetch(`/export/jobs/${jobId}`);
        if (!poll.ok) continue;
        const job = await poll.json();
        if (job.status === "completed") { setStatuses((s) => ({ ...s, [type]: "completed" })); return; }
        if (job.status === "failed") { setError(job.error || "Export failed"); setStatuses((s) => ({ ...s, [type]: "failed" })); return; }
        setStatuses((s) => ({ ...s, [type]: job.status }));
      }
      setError("Export timed out");
      setStatuses((s) => ({ ...s, [type]: "failed" }));
    } catch { setError(`Failed to generate ${type === "pdf" ? "PDF" : "pitch deck"}`); setStatuses((s) => ({ ...s, [type]: "failed" })); }
  }, [projectId]);

  const exports = [
    { type: "pdf", label: "Investor Report", desc: "Full PDF with IRS, stage progress, and all field data", icon: "\u{1F4C4}" },
    { type: "pitch-deck", label: "Pitch Deck", desc: "Landscape slides: problem, market, traction, model, vision", icon: "\u{1F4CA}" },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold">Export</h2>
          <button onClick={onClose} className="text-content-subtle hover:text-content text-lg">\u00d7</button>
        </div>
        {error && <div className="bg-danger/10 border border-danger/30 text-danger text-xs p-2.5 rounded-lg">{error}</div>}
        {exports.map(({ type, label, desc, icon }) => {
          const status = statuses[type];
          return (
            <div key={type} className="bg-surface-2 border border-border rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{label}</div>
                <div className="text-[11px] text-content-subtle mt-0.5">{desc}</div>
                {status !== "idle" && status !== "completed" && (
                  <div className="text-[10px] text-brand mt-1 animate-pulse capitalize">{status}...</div>
                )}
                {status === "completed" && <div className="text-[10px] text-success mt-1 font-bold">Ready for download</div>}
              </div>
              <button onClick={() => startExport(type)} disabled={status === "queued" || status === "processing"}
                className="px-3 py-2 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-hover disabled:opacity-50 shrink-0">
                {status === "completed" ? "Regenerate" : "Generate"}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
