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
 * Now includes a "jump to next incomplete" action that scrolls to the
 * first unfilled gate field.
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

  function scrollToNextIncomplete() {
    // Find the first gate-tagged field that's empty
    const gateLabels = document.querySelectorAll('span[title="Required to advance to the next stage"]');
    for (const badge of gateLabels) {
      const container = badge.closest(".mb-3");
      if (!container) continue;
      const input = container.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (input && !input.value?.trim()) {
        // Expand parent collapsible section if collapsed
        const section = input.closest('[class*="overflow-hidden"]');
        if (section) {
          const btn = section.previousElementSibling as HTMLButtonElement | null;
          if (btn?.getAttribute("aria-expanded") === "false") {
            btn.click();
            // Wait for animation then scroll
            setTimeout(() => input.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
            setTimeout(() => input.focus(), 400);
            return;
          }
        }
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input.focus(), 300);
        return;
      }
    }
  }

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
      {!allPassed && (
        <button
          onClick={scrollToNextIncomplete}
          className="text-[10px] font-bold text-brand hover:underline whitespace-nowrap"
          title="Jump to next incomplete gate field"
        >
          Next &darr;
        </button>
      )}
    </div>
  );
}
