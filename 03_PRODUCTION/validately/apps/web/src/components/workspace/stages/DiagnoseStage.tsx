"use client";
import { FieldInput } from "../FieldInput";
import { FieldSelect } from "../FieldSelect";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function DiagnoseStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";

  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      {/* Fail Story */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">
          FailStory
        </div>
        <div className="text-[11px] text-content-muted">
          Webvan ($800M raised, $0 returned): Tried to solve grocery delivery
          before validating that enough people wanted it at a price that worked.
          Lesson: validate the problem before building the solution.
        </div>
      </div>

      {/* Core Identity - always open, it's small and first */}
      <CollapsibleSection
        title="Core Identity"
        fieldKeys={["startup_name", "team_size"]}
        data={data}
        defaultOpen
      >
        <FieldInput
          label="Startup Name"
          value={get("startup_name")}
          onChange={(v) => update("startup_name", v)}
          placeholder="e.g. Validately, Airbnb, Stripe"
          gate
          autoFocus
        />
        <FieldInput
          label="Team Size"
          type="number"
          value={get("team_size")}
          onChange={(v) => update("team_size", v)}
          placeholder="e.g., 3"
        />
      </CollapsibleSection>

      {/* Problem Validation */}
      <CollapsibleSection
        title="Problem Validation"
        fieldKeys={["problem_statement", "who_has_problem", "contrarian_bet", "why_now"]}
        data={data}
        defaultOpen
      >
        <FieldInput
          label="Problem Statement"
          type="textarea"
          value={get("problem_statement")}
          onChange={(v) => update("problem_statement", v)}
          placeholder="Describe the specific problem in 1-2 sentences"
          gate
          minLength={50}
          onAskAI={askAI}
        />
        <FieldInput
          label="Who has this problem?"
          type="textarea"
          value={get("who_has_problem")}
          onChange={(v) => update("who_has_problem", v)}
          placeholder="Name the specific segment (job title, context, pain)"
          gate
          onAskAI={askAI}
        />
        <FieldInput
          label="Why is this a contrarian bet?"
          type="textarea"
          value={get("contrarian_bet")}
          onChange={(v) => update("contrarian_bet", v)}
          placeholder="Why do smart people disagree?"
          onAskAI={askAI}
        />
        <FieldInput
          label="Why NOW? (timing)"
          type="textarea"
          value={get("why_now")}
          onChange={(v) => update("why_now", v)}
          placeholder="What changed in the world?"
          gate
          onAskAI={askAI}
        />
      </CollapsibleSection>

      {/* Market Sizing */}
      <CollapsibleSection
        title="Market Sizing"
        fieldKeys={["tam_sam_som", "unfair_advantage"]}
        data={data}
      >
        <FieldInput
          label="TAM / SAM / SOM"
          type="textarea"
          value={get("tam_sam_som")}
          onChange={(v) => update("tam_sam_som", v)}
          placeholder="Total Addressable / Serviceable / Obtainable market"
          gate
          onAskAI={askAI}
        />
        <FieldInput
          label="Unfair Advantage"
          type="textarea"
          value={get("unfair_advantage")}
          onChange={(v) => update("unfair_advantage", v)}
          placeholder="What do you have that competitors don't?"
          gate
          onAskAI={askAI}
        />
      </CollapsibleSection>

      {/* Risk Assessment */}
      <CollapsibleSection
        title="Risk Assessment"
        fieldKeys={["assumptions", "pain_level", "barrier_level", "target_adopter"]}
        data={data}
      >
        <FieldInput
          label="Key Assumptions"
          type="textarea"
          value={get("assumptions")}
          onChange={(v) => update("assumptions", v)}
          placeholder="List 3-5 riskiest assumptions (one per line)"
          gate
          onAskAI={askAI}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldSelect
            label="Customer Pain Level"
            value={get("pain_level")}
            onChange={(v) => update("pain_level", v)}
            gate
            options={[
              { value: "1", label: "1 — Nice to have" },
              { value: "2", label: "2 — Mild inconvenience" },
              { value: "3", label: "3 — Real frustration" },
              { value: "4", label: "4 — Significant pain" },
              { value: "5", label: "5 — Hair on fire" },
            ]}
          />
          <FieldSelect
            label="Market Barrier Level"
            value={get("barrier_level")}
            onChange={(v) => update("barrier_level", v)}
            options={[
              { value: "1", label: "1 — Very easy to enter" },
              { value: "2", label: "2 — Low barriers" },
              { value: "3", label: "3 — Moderate barriers" },
              { value: "4", label: "4 — High barriers" },
              { value: "5", label: "5 — Extremely difficult" },
            ]}
          />
        </div>
        <FieldSelect
          label="Target Adopter Segment"
          value={get("target_adopter")}
          onChange={(v) => update("target_adopter", v)}
          options={["Innovators", "Early Adopters", "Early Majority", "Late Majority"]}
        />
      </CollapsibleSection>

      {/* Strategy Canvas */}
      <CollapsibleSection
        title="Strategy Canvas"
        fieldKeys={["strategy_eliminate", "strategy_create"]}
        data={data}
      >
        <FieldInput
          label="ELIMINATE"
          type="textarea"
          value={get("strategy_eliminate")}
          onChange={(v) => update("strategy_eliminate", v)}
          placeholder="What does the industry take for granted that you can eliminate?"
        />
        <FieldInput
          label="CREATE"
          type="textarea"
          value={get("strategy_create")}
          onChange={(v) => update("strategy_create", v)}
          placeholder="What can you create that the industry has never offered?"
        />
      </CollapsibleSection>
    </div>
  );
}
