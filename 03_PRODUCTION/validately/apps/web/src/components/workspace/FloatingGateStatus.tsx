"use client";
import {
  GATE_CRITERIA,
  checkGateCriterion,
} from "@validately/shared";

interface FloatingGateStatusProps {
  stageIdx: number;
  data: Record<string, string>;
}

/**
 * FIX P1: Floating/sticky gate status indicator at the top of the form.
 * Previously gate requirements were only shown at the BOTTOM of long forms.
 */
export function FloatingGateStatus({
  stageIdx,
  data,
}: FloatingGateStatusProps) {
  const criteria =
    GATE_CRITERIA[stageIdx as keyof typeof GATE_CRITERIA] || [];
  if (criteria.length === 0) return null;

  const passed = criteria.filter((c) => checkGateCriterion(c, data)).length;
  const total = criteria.length;
  const allPassed = passed === total;
  const pct = Math.round((passed / total) * 100);

  return (
    <div
      className="sticky top-0 z-10 mb-4 p-2.5 bg-surface-1/95 backdrop-blur-sm border border-border rounded-lg flex items-center gap-3"
      role="status"
      aria-label={`${passed} of ${total} gate requirements passed`}
    >
      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allPassed ? "bg-success" : "bg-brand"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold whitespace-nowrap ${
          allPassed ? "text-success" : "text-content-muted"
        }`}
      >
        {allPassed ? "\u2713 Ready" : `${passed}/${total} gates`}
      </span>
    </div>
  );
}
