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
  enabled = true,
  initialVersion = 0
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDataRef = useRef(JSON.stringify(data));
  const versionRef = useRef(initialVersion);
  const projectIdRef = useRef(projectId);

  // Reset refs when project changes to avoid cross-project data leaks
  useEffect(() => {
    projectIdRef.current = projectId;
    versionRef.current = initialVersion;
    prevDataRef.current = JSON.stringify(data);
  }, [projectId]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    const serialized = JSON.stringify(data);
    if (serialized === prevDataRef.current) return;

    prevDataRef.current = serialized;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const savedProjectId = projectId;
    timeoutRef.current = setTimeout(async () => {
      // Abort if project changed during debounce window
      if (projectIdRef.current !== savedProjectId) return;

      setStatus("saving");
      try {
        const res = await apiFetch(`/projects/${savedProjectId}`, {
          method: "PATCH",
          body: JSON.stringify({ data, version: versionRef.current }),
        });
        // Abort state updates if project changed during fetch
        if (projectIdRef.current !== savedProjectId) return;

        if (res.ok) {
          const updated = await res.json();
          versionRef.current = updated?.version ?? versionRef.current + 1;
          setStatus("saved");
        } else {
          setStatus("error");
        }
      } catch {
        if (projectIdRef.current === savedProjectId) {
          setStatus("error");
        }
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, projectId, enabled]);

  return status;
}
