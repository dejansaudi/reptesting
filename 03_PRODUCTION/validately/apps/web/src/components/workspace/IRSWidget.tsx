"use client";
import { calcIRS } from "@validately/shared";

interface IRSWidgetProps {
  data: Record<string, string>;
}

/**
 * FIX P1: Persistent IRS score widget visible in the sidebar.
 * Previously IRS was only visible on a separate /scoreboard page.
 */
export function IRSWidget({ data }: IRSWidgetProps) {
  const irs = calcIRS(data);

  return (
    <div className="mt-4 p-3 bg-surface-2 rounded-lg border border-border">
      <div className="text-[10px] font-bold text-content-subtle uppercase tracking-wide mb-2">
        Investor Readiness
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span
          className="text-2xl font-bold"
          style={{ color: irs.bandColor }}
        >
          {irs.score}
        </span>
        <span className="text-[10px] text-content-subtle mb-1">
          / {irs.maxScore}
        </span>
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${irs.pct}%`,
            backgroundColor: irs.bandColor,
          }}
        />
      </div>
      <div
        className="text-[10px] font-semibold"
        style={{ color: irs.bandColor }}
      >
        {irs.band}
      </div>
    </div>
  );
}
