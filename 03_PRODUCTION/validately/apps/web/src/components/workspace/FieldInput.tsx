"use client";
import { useState, useMemo, useRef, useEffect, useId } from "react";
import { qScore } from "@validately/shared";

interface FieldInputProps {
  label: string;
  type?: "text" | "textarea" | "number" | "password";
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  disabled?: boolean;
  gate?: boolean;
  icon?: string;
  tips?: string;
  examples?: string[];
  /** FIX P0: When true, field receives autofocus on mount */
  autoFocus?: boolean;
  /** FIX P1: Min chars required for gate (shown as counter) */
  minLength?: number;
  /** FIX P1: Ask AI coach about this field */
  onAskAI?: (fieldLabel: string, value: string) => void;
}

function QualityBadge({ score }: { score: ReturnType<typeof qScore> }) {
  if (!score || score.t === 0) return null;
  const bg =
    score.t < 40 ? "bg-danger" : score.t < 70 ? "bg-warning" : "bg-success";
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${bg} text-surface rounded text-[11px] font-semibold`}
      title={`Quality: ${score.t}% (Specificity: ${score.s}/4, Evidence: ${score.e}/4, Actionability: ${score.a}/4)`}
    >
      Q: <span>{score.t}%</span>
    </span>
  );
}

export function FieldInput({
  label,
  type = "text",
  value = "",
  onChange,
  placeholder,
  hint,
  maxLength,
  disabled,
  gate,
  icon,
  tips,
  examples,
  autoFocus,
  minLength,
  onAskAI,
}: FieldInputProps) {
  const [showTips, setShowTips] = useState(false);
  const fieldId = useId();
  const hintId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const score = useMemo(() => qScore(value), [value]);

  // FIX P1: Auto-grow textareas based on content
  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = Math.max(80, Math.min(el.scrollHeight, 400)) + "px";
    }
  }, [value, type]);

  // FIX P1: Determine appropriate textarea rows based on expected content
  const textareaRows = useMemo(() => {
    if (minLength && minLength >= 50) return 6;
    if (
      placeholder &&
      (placeholder.includes("\n") || placeholder.length > 100)
    )
      return 6;
    return 4;
  }, [minLength, placeholder]);

  // FIX P1: Character counter for minLength gates
  const charCount = value.length;
  const showCharCounter = gate && minLength && minLength > 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
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
          <QualityBadge score={score} />
        </div>
        <div className="flex gap-1.5">
          {/* FIX P1: Per-field AI review button */}
          {onAskAI && value.length > 10 && (
            <button
              onClick={() => onAskAI(label, value)}
              className="px-2 py-0.5 text-[10px] bg-brand/10 text-brand border border-brand/30 rounded hover:bg-brand/20 transition-colors"
              title={`Ask AI coach to review your ${label}`}
            >
              AI Review
            </button>
          )}
          {tips && (
            <button
              onClick={() => setShowTips(!showTips)}
              className="px-2 py-0.5 text-[10px] bg-surface-3 text-content-muted border border-border rounded hover:bg-surface-elevated transition-colors"
              aria-label={`Tips for ${label}`}
              aria-expanded={showTips}
            >
              ?
            </button>
          )}
          {examples && (
            <button
              onClick={() => {
                // FIX P2: Confirm before auto-filling
                if (
                  value.length === 0 ||
                  confirm("Replace current value with example?")
                ) {
                  onChange(examples[0]);
                }
              }}
              className="px-2 py-0.5 text-[10px] bg-surface-3 text-content-muted border border-border rounded hover:bg-surface-elevated transition-colors"
              aria-label={`Fill with example for ${label}`}
              title="Fill with example"
            >
              ex
            </button>
          )}
        </div>
      </div>

      {type === "textarea" ? (
        <textarea
          ref={textareaRef}
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={textareaRows}
          autoFocus={autoFocus}
          aria-describedby={hint ? hintId : undefined}
          aria-required={gate || undefined}
          className="w-full text-xs p-2.5 bg-surface-1 text-content border border-border rounded-md font-mono resize-y min-h-[80px] focus:border-brand focus:outline-none transition-colors"
        />
      ) : (
        <input
          id={fieldId}
          // FIX P1: Use inputMode="numeric" for number fields to get numeric keyboard
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "numeric" : undefined}
          pattern={type === "number" ? "[0-9]*\\.?[0-9]*" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-describedby={hint ? hintId : undefined}
          aria-required={gate || undefined}
          className="w-full text-xs p-2.5 bg-surface-1 text-content border border-border rounded-md font-mono focus:border-brand focus:outline-none transition-colors"
        />
      )}

      {/* FIX P1: Character counter for minLength gates */}
      {showCharCounter && (
        <div
          className={`text-[10px] mt-1 text-right ${
            charCount >= minLength! ? "text-success" : "text-content-faint"
          }`}
        >
          {charCount}/{minLength} chars
          {charCount >= minLength! && " \u2713"}
        </div>
      )}

      {hint && (
        <div id={hintId} className="text-[11px] text-content-muted mt-1">
          {hint}
        </div>
      )}

      {showTips && tips && (
        <div className="text-[11px] text-content-muted mt-1.5 p-2.5 bg-surface-1 rounded border border-border">
          {tips}
        </div>
      )}
    </div>
  );
}
