"use client";
import { useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface FieldSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  hint?: string;
  gate?: boolean;
  icon?: string;
}

export function FieldSelect({
  label,
  value = "",
  onChange,
  options = [],
  hint,
  gate,
  icon,
}: FieldSelectProps) {
  const fieldId = useId();
  const hintId = useId();

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {/* FIX P0: Proper label with htmlFor */}
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold text-content-subtle uppercase tracking-wide"
        >
          {label}
        </label>
        {gate && (
          <span
            className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded"
            title="Required to advance to the next stage"
          >
            GATE
          </span>
        )}
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <select
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? hintId : undefined}
        aria-required={gate || undefined}
        className="w-full text-xs p-2.5 bg-surface-1 text-content border border-border rounded-md font-mono cursor-pointer appearance-none bg-no-repeat bg-[right_10px_center] focus:border-brand focus:outline-none transition-colors"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23949ba4' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="">\u2014 Select \u2014</option>
        {options.map((opt, idx) => (
          <option
            key={idx}
            value={typeof opt === "string" ? opt : opt.value}
          >
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <div id={hintId} className="text-[11px] text-content-muted mt-1">
          {hint}
        </div>
      )}
    </div>
  );
}
