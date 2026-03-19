"use client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { calcIRS, STAGE_META, runXV } from "@validately/shared";
import { useRouter } from "next/navigation";

function ScoreRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

export default function ScoreboardPage() {
  const { data, projectId } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    if (!projectId) router.replace("/workspace");
  }, [projectId, router]);

  if (!projectId) {
    return <div className="flex items-center justify-center min-h-[50vh] text-sm text-content-subtle">Loading project...</div>;
  }

  const irs = calcIRS(data);
  const xv = runXV(data);

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Investor Readiness Score</h1>
        <button
          onClick={() => router.push("/workspace")}
          className="px-4 py-2 rounded-lg bg-surface-2 text-content text-sm font-semibold hover:bg-surface-3 transition-colors"
        >
          Back to Workspace
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-surface-1 border border-border rounded-xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-8">
        <div className="relative">
          <ScoreRing pct={irs.pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold"
              style={{ color: irs.bandColor }}
            >
              {irs.score}
            </span>
            <span className="text-[10px] text-content-subtle">
              / {irs.maxScore}
            </span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div
            className="text-lg font-bold mb-1"
            style={{ color: irs.bandColor }}
          >
            {irs.band}
          </div>
          <div className="text-xs text-content-subtle">
            {irs.pct}% complete across all 7 stages
          </div>
        </div>
      </div>

      {/* Per-stage breakdown */}
      <div className="grid gap-3 mb-8">
        {irs.stages.map((stage) => {
          const meta = STAGE_META[stage.stage];
          return (
            <div
              key={stage.stage}
              className="bg-surface-1 border border-border rounded-lg p-4 flex items-center gap-4"
            >
              <span className="text-xl">{meta?.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{meta?.phase}</span>
                  <span className="text-[10px] text-content-subtle">
                    {stage.passed}/{stage.total} gates \u2022{" "}
                    {stage.weighted}/{stage.maxWeight} pts
                  </span>
                </div>
                <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${stage.pct}%`,
                      backgroundColor:
                        stage.pct === 100 ? "#23a559" : meta?.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Validation Issues */}
      {xv.issues.length > 0 && (
        <div className="bg-surface-1 border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold mb-4">
            Cross-Validation Issues ({xv.errors} errors, {xv.warnings}{" "}
            warnings)
          </h2>
          <div className="space-y-2">
            {xv.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-start p-2.5 rounded-lg ${
                  issue.severity === "error"
                    ? "bg-danger/10 border border-danger/20"
                    : "bg-warning/10 border border-warning/20"
                }`}
              >
                <span
                  className={`text-sm font-bold mt-0.5 ${
                    issue.severity === "error"
                      ? "text-danger"
                      : "text-warning"
                  }`}
                >
                  {issue.severity === "error" ? "\u2717" : "\u26A0"}
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-content">
                    {issue.msg}
                  </div>
                  <div className="text-[10px] text-content-subtle mt-0.5">
                    Stage {issue.stage}: {STAGE_META[issue.stage]?.phase}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
