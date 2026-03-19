"use client";

interface BenchmarkIndicatorProps {
  label: string;
  value: string;
  unit?: string;
  good?: string;
  ok?: string;
  bad?: string;
  lowerIsBetter?: boolean;
}

export function BenchmarkIndicator({
  label,
  value,
  unit = "",
  good,
  ok,
  bad,
  lowerIsBetter = false,
}: BenchmarkIndicatorProps) {
  let indicator = "\u26AA"; // white circle
  let indicatorLabel = "No data";
  if (value !== "") {
    const num = parseFloat(value);
    if (lowerIsBetter) {
      if (good && num <= parseFloat(good)) {
        indicator = "\u{1F7E2}";
        indicatorLabel = "Good";
      } else if (ok && num <= parseFloat(ok)) {
        indicator = "\u{1F7E1}";
        indicatorLabel = "OK";
      } else if (bad && num >= parseFloat(bad)) {
        indicator = "\u{1F534}";
        indicatorLabel = "Below target";
      } else {
        indicator = "\u{1F7E1}";
        indicatorLabel = "OK";
      }
    } else {
      if (bad && num < parseFloat(bad)) {
        indicator = "\u{1F534}";
        indicatorLabel = "Below target";
      } else if (good && num >= parseFloat(good)) {
        indicator = "\u{1F7E2}";
        indicatorLabel = "Good";
      } else if (ok && num >= parseFloat(ok)) {
        indicator = "\u{1F7E1}";
        indicatorLabel = "OK";
      } else if (bad) {
        indicator = "\u{1F7E1}";
        indicatorLabel = "OK";
      }
    }
  }

  return (
    <div className="p-2.5 bg-surface-2 rounded-md border border-border mb-2.5">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-[11px] font-bold text-content">
            <span aria-label={indicatorLabel}>{indicator}</span> {label}
          </div>
          <div className="text-[9px] text-content-subtle">
            {value}
            {unit}
          </div>
        </div>
        <div className="text-[9px] text-content-subtle text-right">
          {good && (
            <div>
              Good: {lowerIsBetter ? "\u2264" : "\u2265"}{good}
              {unit}
            </div>
          )}
          {ok && (
            <div>
              OK: {lowerIsBetter ? "\u2264" : "\u2265"}{ok}
              {unit}
            </div>
          )}
          {bad && (
            <div>
              Bad: {lowerIsBetter ? ">" : "<"}{bad}
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
