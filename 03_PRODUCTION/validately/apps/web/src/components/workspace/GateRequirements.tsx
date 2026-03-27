"use client";
import {
  GATE_CRITERIA,
  checkGateCriterion,
} from "@validately/shared";

interface GateRequirementsProps {
  stageIdx: number;
  data: Record<string, string>;
}

export function GateRequirements({ stageIdx, data }: GateRequirementsProps) {
  const criteria = (
    GATE_CRITERIA[stageIdx as keyof typeof GATE_CRITERIA] || []
  ).map((c) => ({
    ...c,
    pass: checkGateCriterion(c, data),
  }));

  const passed = criteria.filter((c) => c.pass).length;
  const total = criteria.length;
  const allPassed = passed === total && total > 0;

  if (total === 0) return null;

  return (
    <div className="mt-6 p-4 bg-surface-2 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-content">Gate Requirements</div>
        <div
          className={`text-[11px] font-bold ${
            allPassed ? "text-success" : "text-content-muted"
          }`}
          role="status"
        >
          {passed}/{total} passed
        </div>
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allPassed ? "bg-success" : "bg-brand"
          }`}
          style={{ width: `${(passed / total) * 100}%` }}
        />
      </div>
      {criteria.map((c, idx) => (
        <div key={idx} className="flex gap-2 items-center mb-1.5">
          <span
            className={`text-xs font-bold ${
              c.pass ? "text-success" : "text-danger"
            }`}
            aria-hidden="true"
          >
            {c.pass ? "\u2713" : "\u2717"}
          </span>
          <span
            className={`text-[11px] ${
              c.pass ? "text-content-muted" : "text-content"
            }`}
          >
            {c.msg}
          </span>
        </div>
      ))}
      {allPassed && (
        <div
          className="mt-3 text-[11px] text-success font-semibold"
          role="status"
        >
          All gates passed \u2014 ready to assess
        </div>
      )}
    </div>
  );
}
