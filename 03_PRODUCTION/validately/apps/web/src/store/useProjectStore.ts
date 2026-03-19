"use client";
import { create } from "zustand";
import { apiFetch } from "@/lib/api";

interface ProjectState {
  projectId: string | null;
  data: Record<string, string>;
  stageIdx: number;
  tab: "build" | "assess";
  unlocked: number[];
  xp: number;
  version: number;
  update: (field: string, value: string) => void;
  setStageIdx: (idx: number) => void;
  setTab: (tab: "build" | "assess") => void;
  setData: (data: Record<string, string>) => void;
  setProject: (p: {
    id: string;
    data: Record<string, string>;
    stageIdx: number;
    version: number;
  }) => void;
  advanceStage: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectId: null,
  data: { startup_name: "" },
  stageIdx: 0,
  tab: "build",
  unlocked: [0],
  xp: 0,
  version: 0,
  update: (field, value) =>
    set((s) => ({ data: { ...s.data, [field]: value } })),
  setStageIdx: (idx) => set({ stageIdx: idx }),
  setTab: (tab) => set({ tab }),
  setData: (data) => set({ data }),
  setProject: (p) =>
    set({
      projectId: p.id,
      data: p.data,
      stageIdx: p.stageIdx,
      version: p.version,
      unlocked: Array.from({ length: p.stageIdx + 1 }, (_, i) => i),
      xp: 0,
      tab: "build",
    }),
  advanceStage: () => {
    const s = get();
    const next = s.stageIdx + 1;
    if (next >= 7) return;

    // Save previous state for rollback
    const prev = {
      unlocked: s.unlocked,
      xp: s.xp,
      stageIdx: s.stageIdx,
      tab: s.tab,
    };

    // Optimistically update local state
    set({
      unlocked: s.unlocked.includes(next)
        ? s.unlocked
        : [...s.unlocked, next],
      xp: s.xp + 100,
      stageIdx: next,
      tab: "build",
    });

    // Persist to server so stage advancement survives page refresh
    if (s.projectId) {
      apiFetch(`/projects/${s.projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ stageIdx: next, version: s.version }),
      })
        .then(async (res) => {
          if (res.ok) {
            const updated = await res.json();
            set({ version: updated?.version ?? s.version + 1 });
          } else {
            // Rollback on server rejection
            set(prev);
          }
        })
        .catch(() => {
          // Rollback on network failure
          set(prev);
        });
    }
  },
}));
