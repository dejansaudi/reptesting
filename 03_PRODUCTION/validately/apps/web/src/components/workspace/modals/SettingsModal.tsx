"use client";
import { useState, useEffect, useId } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { Modal } from "../Modal";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKeyId = useId();

  useEffect(() => {
    if (user?.hasApiKey) setApiKey("sk-ant-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
  }, [user]);

  async function saveKey() {
    if (!apiKey.trim() || apiKey.startsWith("sk-ant-\u2022")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/users/me/api-key", { method: "PUT", body: JSON.stringify({ apiKey }) });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      else setError("Failed to save API key.");
    } catch { setError("Failed to save API key. Please try again."); }
    finally { setSaving(false); }
  }

  return (
    <Modal onClose={onClose} aria-label="Settings">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="text-content-subtle hover:text-content text-lg">\u2715</button>
        </div>
        {error && <div className="bg-danger/10 border border-danger/30 text-danger text-xs p-2.5 rounded-lg mb-4">{error}</div>}
        <div className="mb-5">
          <label htmlFor={apiKeyId} className="text-[11px] font-bold text-content block mb-1.5">Anthropic API Key</label>
          <p className="text-[10px] text-content-subtle mb-2">Required for AI coaching. Your key is encrypted at rest.</p>
          <input id={apiKeyId} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..." className="w-full py-2.5 px-4 rounded-lg bg-surface text-content border border-border text-sm mb-2 focus:border-brand focus:outline-none" />
          <button onClick={saveKey} disabled={saving}
            className="px-5 py-2 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50">
            {saved ? "Saved!" : saving ? "Saving..." : "Save Key"}
          </button>
        </div>
        <div className="border-t border-border pt-4">
          <label className="text-[11px] font-bold text-content block mb-1.5">Account</label>
          <div className="text-[12px] text-content-muted">{user?.email || "Not logged in"}</div>
          <div className="text-[10px] text-content-subtle mt-1">
            Plan: <span className="font-bold text-brand">{user?.plan?.toUpperCase() || "FREE"}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
