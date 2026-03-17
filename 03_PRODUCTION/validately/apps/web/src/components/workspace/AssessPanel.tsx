"use client";
import {
  GATE_CRITERIA,
  STAGE_META,
  checkGateCriterion,
} from "@validately/shared";
import { useProjectStore } from "@/store/useProjectStore";

interface AssessPanelProps {
  stageIdx: number;
  data: Record<string, string>;
}

export function AssessPanel({ stageIdx, data }: AssessPanelProps) {
  const { advanceStage, setTab } = useProjectStore();
  const criteria = GATE_CRITERIA[stageIdx as keyof typeof GATE_CRITERIA] || [];
  const stage = STAGE_META[stageIdx];
  const nextStage = STAGE_META[stageIdx + 1];

  const failures = criteria.filter((c) => !checkGateCriterion(c, data));
  const allPassed = failures.length === 0 && criteria.length > 0;

  return (
    <div>
      <div className="text-base font-bold mb-3">
        {stage?.phase || `Stage ${stageIdx}`} Assessment
      </div>
      <div className="text-xs text-content-subtle mb-4">
        Review your validation checklist before advancing.
      </div>

      <div className="p-3.5 bg-surface-2 rounded-[10px] border border-border mb-4">
        <div className="text-xs font-bold text-content mb-2.5">
          Gate Requirements
        </div>
        {criteria.map((c, idx) => {
          const passed = checkGateCriterion(c, data);
          return (
            <div key={idx} className="flex gap-2 items-center mb-1.5">
              <span
                className={`text-sm font-bold ${
                  passed ? "text-success" : "text-danger"
                }`}
              >
                {passed ? "\u2713" : "\u2717"}
              </span>
              <span className="text-[11px] text-content-muted">{c.msg}</span>
            </div>
          );
        })}
      </div>

      {failures.length > 0 && (
        <div
          className="p-3.5 bg-danger/20 border border-danger rounded-[10px] mb-4"
          role="alert"
        >
          <div className="text-[11px] font-bold text-danger mb-2">
            Review These Issues ({failures.length} remaining)
          </div>
          {failures.map((c, idx) => (
            <div key={idx} className="text-[10px] text-content-muted mb-1">
              \u2022 {c.msg}
            </div>
          ))}
        </div>
      )}

      {nextStage && (
        <button
          onClick={() => allPassed && advanceStage()}
          disabled={!allPassed}
          className={`w-full p-3.5 rounded-lg text-sm font-bold border-none cursor-pointer min-h-[48px] mb-2 transition-all ${
            allPassed
              ? "bg-brand text-white hover:opacity-90"
              : "bg-surface-3 text-content-subtle cursor-not-allowed"
          }`}
        >
          {allPassed
            ? `Advance to ${nextStage.phase}`
            : "Complete all gates to advance"}
        </button>
      )}

      <button
        onClick={() => setTab("build")}
        className="w-full p-3 rounded-lg bg-surface-3 text-content text-xs font-semibold border-none cursor-pointer min-h-[44px] transition-colors hover:bg-surface-elevated"
      >
        Back to Build
      </button>
    </div>
  );
}
