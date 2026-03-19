"use client";
import { create } from "zustand";

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

export const useProjectStore = create<ProjectState>((set) => ({
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
  advanceStage: () =>
    set((s) => {
      const next = s.stageIdx + 1;
      if (next >= 7) return {};
      return {
        unlocked: s.unlocked.includes(next)
          ? s.unlocked
          : [...s.unlocked, next],
        xp: s.xp + 100,
        stageIdx: next,
        tab: "build",
      };
    }),
}));
