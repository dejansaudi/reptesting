"use client";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type SaveStatus = "saved" | "saving" | "error" | "offline";

/**
 * FIX P0: Autosave hook now actually debounce-saves data and reports real status.
 * Previously was a stub that always returned "saved".
 */
export function useAutosave(
  data: Record<string, string>,
  projectId: string | null,
  enabled = true
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDataRef = useRef(JSON.stringify(data));
  const versionRef = useRef(0);

  useEffect(() => {
    if (!enabled || !projectId) return;

    const serialized = JSON.stringify(data);
    if (serialized === prevDataRef.current) return;

    prevDataRef.current = serialized;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await apiFetch(`/projects/${projectId}`, {
          method: "PATCH",
          body: JSON.stringify({ data, version: versionRef.current }),
        });
        if (res.ok) {
          versionRef.current += 1;
          setStatus("saved");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, projectId, enabled]);

  return status;
}
