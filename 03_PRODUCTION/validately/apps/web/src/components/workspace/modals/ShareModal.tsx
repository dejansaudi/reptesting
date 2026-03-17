"use client";
import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Modal } from "../Modal";

export function ShareModal({ onClose }: { onClose: () => void }) {
  const { data } = useProjectStore();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const slug = (data.startup_name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setUrl(`${window.location.origin}/p/${slug}`);
  }, [data.startup_name]);

  return (
    <Modal onClose={onClose} aria-label="Share project">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Share Project</h2>
          <button onClick={onClose} aria-label="Close share panel" className="text-content-subtle hover:text-content text-lg">\u2715</button>
        </div>
        <p className="text-xs text-content-subtle mb-4">Share a public read-only view of your project with investors or mentors.</p>
        <div className="flex gap-2 mb-4">
          <input type="text" readOnly value={url} className="flex-1 py-2.5 px-4 rounded-lg bg-surface text-content border border-border text-sm" />
          <button onClick={() => {
            navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
          }} className="px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="text-[10px] text-content-subtle">Only completed stages and passed gates will be visible.</div>
      </div>
    </Modal>
  );
}
