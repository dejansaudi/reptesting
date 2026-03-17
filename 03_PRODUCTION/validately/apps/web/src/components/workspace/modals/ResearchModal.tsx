"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";
import { Modal } from "../Modal";

interface ResearchResult {
  query: string;
  summary: string;
  sources: string[];
  timestamp: string;
}

export function ResearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { data } = useProjectStore();

  async function search() {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    try {
      const res = await apiFetch("/ai/research", {
        method: "POST",
        body: JSON.stringify({ query: q, context: { startupName: data.startup_name || "Unnamed", problem: data.problem_statement || "" } }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setResults((r) => [result, ...r]);
      setQuery("");
    } catch {
      setResults((r) => [{ query: q, summary: "Research failed. Check your API key and try again.", sources: [], timestamp: new Date().toISOString() }, ...r]);
    } finally { setLoading(false); }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl" aria-label="Market research">
      <div className="max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">Market Research</div>
            <div className="text-[10px] text-content-subtle">AI-powered market and competitor analysis</div>
          </div>
          <button onClick={onClose} aria-label="Close research panel" className="text-content-subtle hover:text-content text-lg">\u2715</button>
        </div>
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="e.g., Market size for AI-powered validation tools"
              className="flex-1 py-2.5 px-4 rounded-lg bg-surface text-content border border-border text-sm focus:border-brand focus:outline-none" />
            <button onClick={search} disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {results.length === 0 && !loading && (
            <div className="text-xs text-content-subtle text-center mt-8">Search for market data, competitors, or industry trends.</div>
          )}
          {results.map((r, idx) => (
            <div key={idx} className="bg-surface-2 border border-border rounded-lg p-4">
              <div className="text-[11px] text-brand font-bold mb-1">{r.query}</div>
              <div className="text-[12px] text-content leading-relaxed mb-2 whitespace-pre-wrap">{r.summary}</div>
              {r.sources.length > 0 && <div className="text-[10px] text-content-subtle">Sources: {r.sources.join(", ")}</div>}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
