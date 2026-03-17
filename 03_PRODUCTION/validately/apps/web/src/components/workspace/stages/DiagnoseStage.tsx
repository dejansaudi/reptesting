"use client";
import { FieldInput } from "../FieldInput";
import { FieldSelect } from "../FieldSelect";

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

      {/* Core Identity */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">
          Core Identity
        </div>
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
      </div>

      {/* Problem Validation */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">
          Problem Validation
        </div>
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
      </div>

      {/* Market Sizing */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">
          Market Sizing
        </div>
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
      </div>

      {/* Assumptions & Scoring */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">
          Risk Assessment
        </div>
        <FieldInput
          label="Key Assumptions"
          type="textarea"
          value={get("assumptions")}
          onChange={(v) => update("assumptions", v)}
          placeholder="List 3-5 riskiest assumptions (one per line)"
          gate
          onAskAI={askAI}
        />
        <FieldSelect
          label="Customer Pain Level"
          value={get("pain_level")}
          onChange={(v) => update("pain_level", v)}
          gate
          options={[
            { value: "1", label: "1 \u2014 Nice to have" },
            { value: "2", label: "2 \u2014 Mild inconvenience" },
            { value: "3", label: "3 \u2014 Real frustration" },
            { value: "4", label: "4 \u2014 Significant pain" },
            { value: "5", label: "5 \u2014 Hair on fire" },
          ]}
        />
        <FieldSelect
          label="Market Barrier Level"
          value={get("barrier_level")}
          onChange={(v) => update("barrier_level", v)}
          options={[
            { value: "1", label: "1 \u2014 Very easy to enter" },
            { value: "2", label: "2 \u2014 Low barriers" },
            { value: "3", label: "3 \u2014 Moderate barriers" },
            { value: "4", label: "4 \u2014 High barriers" },
            { value: "5", label: "5 \u2014 Extremely difficult" },
          ]}
        />
        <FieldSelect
          label="Target Adopter Segment"
          value={get("adopter_segment")}
          onChange={(v) => update("adopter_segment", v)}
          options={["Innovators", "Early Adopters", "Early Majority", "Late Majority"]}
        />
      </div>

      {/* Strategy Canvas */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">
          Strategy Canvas
        </div>
        <FieldInput
          label="ELIMINATE"
          type="textarea"
          value={get("canvas_eliminate")}
          onChange={(v) => update("canvas_eliminate", v)}
          placeholder="What does the industry take for granted that you can eliminate?"
        />
        <FieldInput
          label="CREATE"
          type="textarea"
          value={get("canvas_create")}
          onChange={(v) => update("canvas_create", v)}
          placeholder="What can you create that the industry has never offered?"
        />
      </div>
    </div>
  );
}
