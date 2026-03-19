"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";
import { Modal } from "../Modal";

interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  data: Record<string, string>;
}

export function SnapshotsModal({ onClose }: { onClose: () => void }) {
  const { projectId, setProject } = useProjectStore();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const loadSnapshots = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await apiFetch(`/projects/${projectId}/snapshots`);
      if (res.ok) setSnapshots(await res.json());
    } catch {
      console.error("Failed to load snapshots");
    }
  }, [projectId]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  async function save() {
    if (!projectId) return;
    const snapshotName = name.trim() || `Snapshot ${snapshots.length + 1}`;
    setSaving(true);
    try {
      const res = await apiFetch(`/projects/${projectId}/snapshots`, {
        method: "POST",
        body: JSON.stringify({ name: snapshotName }),
      });
      if (res.ok) {
        setName("");
        await loadSnapshots();
      }
    } catch {
      alert("Failed to save snapshot.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} aria-label="Snapshots">
      <div className="max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold">Snapshots</h2>
          <button onClick={onClose} aria-label="Close snapshots" className="text-content-subtle hover:text-content text-lg">\u2715</button>
        </div>
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Snapshot name (optional)"
              className="flex-1 py-2 px-3 rounded-lg bg-surface text-content border border-border text-sm focus:border-brand focus:outline-none" />
            <button onClick={save} disabled={saving || !projectId}
              className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50">
              Save
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {restoreError && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-xs p-2.5 rounded-lg">{restoreError}</div>
          )}
          {snapshots.length === 0 && (
            <div className="text-xs text-content-subtle text-center mt-4">No snapshots yet. Save one to create a checkpoint.</div>
          )}
          {snapshots.map((s) => (
            <div key={s.id} className="bg-surface-2 border border-border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold">{s.name}</div>
                <div className="text-[10px] text-content-subtle">{new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <button
                onClick={async () => {
                  if (confirmId === s.id) {
                    setRestoreError(null);
                    try {
                      const res = await apiFetch(`/projects/${projectId}/snapshots/${s.id}/restore`, { method: "POST" });
                      if (res.ok) {
                        const project = await res.json();
                        setProject({ id: project.id, data: project.data || {}, stageIdx: project.stageIdx ?? 0, version: project.version ?? 0 });
                        onClose();
                      } else {
                        setRestoreError("Failed to restore snapshot. Please try again.");
                        setConfirmId(null);
                      }
                    } catch {
                      setRestoreError("Network error. Could not restore snapshot.");
                      setConfirmId(null);
                    }
                  }
                  else setConfirmId(s.id);
                }}
                className={`text-[11px] font-bold ${confirmId === s.id ? "text-danger" : "text-brand hover:underline"}`}>
                {confirmId === s.id ? "Confirm?" : "Restore"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
