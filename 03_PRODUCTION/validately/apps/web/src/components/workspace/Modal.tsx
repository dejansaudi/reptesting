"use client";
import { useRef, useCallback, useEffect } from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
  "aria-label"?: string;
}

export function Modal({
  children,
  onClose,
  maxWidth = "max-w-md",
  "aria-label": ariaLabel,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") return void onClose();
      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      const el = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      previouslyFocused?.focus();
    };
  }, [handleKeyDown]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <div
        ref={contentRef}
        className={`bg-surface-1 border border-border rounded-xl w-full ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}
