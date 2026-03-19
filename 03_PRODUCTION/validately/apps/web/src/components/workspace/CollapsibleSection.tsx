"use client";
import { useState, useRef, useEffect } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  /** Fields in this section for completion tracking */
  fieldKeys?: string[];
  /** Current form data */
  data?: Record<string, string>;
  /** Start expanded (default: true for first section) */
  defaultOpen?: boolean;
  /** Accent color class for the section indicator */
  accent?: string;
}

export function CollapsibleSection({
  title,
  children,
  fieldKeys,
  data,
  defaultOpen = false,
  accent,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  );

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, set to auto so dynamic content works
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      // Set explicit height first for transition, then collapse
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  // Calculate section completion
  let filled = 0;
  let total = 0;
  if (fieldKeys && data) {
    total = fieldKeys.length;
    filled = fieldKeys.filter((k) => (data[k] || "").trim().length > 0).length;
  }
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const isComplete = total > 0 && filled === total;

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 bg-surface-2 rounded-lg border border-border flex items-center gap-2.5 hover:bg-surface-3 transition-colors text-left group"
        aria-expanded={open}
      >
        <span
          className={`text-[10px] transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
        <span className="text-[11px] font-bold text-content flex-1">
          {title}
        </span>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? "bg-success" : accent || "bg-brand"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-semibold ${
                isComplete ? "text-success" : "text-content-subtle"
              }`}
            >
              {filled}/{total}
            </span>
          </div>
        )}
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: height === undefined ? "none" : `${height}px` }}
      >
        <div className="pt-3 px-1">{children}</div>
      </div>
    </div>
  );
}
