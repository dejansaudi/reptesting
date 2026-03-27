"use client";
import { STAGE_META } from "@validately/shared";
import { useProjectStore } from "@/store/useProjectStore";
import { IRSWidget } from "./IRSWidget";

interface StageNavProps {
  currentStage: number;
  onSelectStage: (idx: number) => void;
}

export function StageNav({ currentStage, onSelectStage }: StageNavProps) {
  const { unlocked, data } = useProjectStore();

  return (
    <nav>
      <div className="text-xs font-bold mb-3">Stages</div>
      {STAGE_META.map((stage) => {
        const isUnlocked = unlocked.includes(stage.id);
        const isActive = currentStage === stage.id;
        return (
          <button
            key={stage.id}
            onClick={() => isUnlocked && onSelectStage(stage.id)}
            disabled={!isUnlocked}
            aria-label={
              isUnlocked
                ? stage.phase
                : `${stage.phase} \u2014 locked, complete previous stage`
            }
            aria-current={isActive ? "step" : undefined}
            className={`w-full p-2.5 mb-1.5 rounded-md text-left text-[11px] font-semibold border transition-colors min-h-[44px] ${
              isActive
                ? "border-brand bg-brand/10"
                : "border-transparent bg-surface-2 hover:bg-surface-3"
            } ${isUnlocked ? "cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
          >
            {stage.icon} {stage.phase}
            {!isUnlocked && (
              <span className="text-[9px] ml-1">{"\u{1F512}"}</span>
            )}
          </button>
        );
      })}
      {/* FIX P1: IRS widget always visible in sidebar */}
      <IRSWidget data={data} />
    </nav>
  );
}
