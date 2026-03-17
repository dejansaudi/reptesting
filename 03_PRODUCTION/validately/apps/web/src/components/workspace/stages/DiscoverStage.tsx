"use client";
import { FieldInput } from "../FieldInput";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function DiscoverStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          Juicero ($120M raised): Never validated whether customers actually wanted a $400 juicer.
          Bloomberg discovered you could squeeze the packs by hand. Lesson: talk to customers before building.
        </div>
      </div>

      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">Customer Interviews</div>
        <FieldInput label="Number of interviews" type="number" value={get("interviews_count")}
          onChange={(v) => update("interviews_count", v)} placeholder="e.g., 25" gate autoFocus />
        <FieldInput label="Verbatim customer quotes" type="textarea" value={get("verbatim_quotes")}
          onChange={(v) => update("verbatim_quotes", v)}
          placeholder={'"I spend 3 hours every week doing X manually"\n"If this existed, I would pay $Y/mo"'}
          gate onAskAI={askAI} />
        <FieldInput label="Primary Persona" type="textarea" value={get("persona_primary")}
          onChange={(v) => update("persona_primary", v)} placeholder="Name, role, context, goals, frustrations"
          gate onAskAI={askAI} />
        <FieldInput label="Top 3 pains" type="textarea" value={get("top_pains")}
          onChange={(v) => update("top_pains", v)} placeholder="1. \n2. \n3. " gate onAskAI={askAI} />
      </div>

      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">Deep Understanding</div>
        <FieldInput label="What do they think/feel?" type="textarea" value={get("think_feel")}
          onChange={(v) => update("think_feel", v)} placeholder="What occupies their thinking? What worries them?"
          onAskAI={askAI} />
        <FieldInput label="Current workarounds" type="textarea" value={get("workarounds")}
          onChange={(v) => update("workarounds", v)} placeholder="How do they solve this problem today?" onAskAI={askAI} />
        <FieldInput label="Customer journey map" type="textarea" value={get("journey_map")}
          onChange={(v) => update("journey_map", v)} placeholder="Step 1: → Step 2: → Step 3: → Pain point:" onAskAI={askAI} />
      </div>

      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">Competitive Landscape</div>
        <FieldInput label="Competitor matrix" type="textarea" value={get("competitor_matrix")}
          onChange={(v) => update("competitor_matrix", v)}
          placeholder="Competitor | Strengths | Weaknesses | Price | Our differentiation" gate onAskAI={askAI} />
      </div>

      {/* FIX P2: Responsive grid — single column on mobile */}
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">Empathy Map</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldInput label="Think & Feel" type="textarea" value={get("empathy_think")}
            onChange={(v) => update("empathy_think", v)} placeholder="What occupies their thinking?" />
          <FieldInput label="See" type="textarea" value={get("empathy_see")}
            onChange={(v) => update("empathy_see", v)} placeholder="What do they see in their environment?" />
          <FieldInput label="Hear" type="textarea" value={get("empathy_hear")}
            onChange={(v) => update("empathy_hear", v)} placeholder="What do friends/colleagues say?" />
          <FieldInput label="Say & Do" type="textarea" value={get("empathy_say")}
            onChange={(v) => update("empathy_say", v)} placeholder="What do they say publicly? How do they behave?" />
        </div>
      </div>

      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[11px] font-bold text-content mb-2.5">Value Proposition Canvas</div>
        <FieldInput label="Jobs to Be Done" type="textarea" value={get("jtbd")}
          onChange={(v) => update("jtbd", v)} placeholder="What job is the customer hiring your product to do?" onAskAI={askAI} />
        <FieldInput label="Customer Gains" type="textarea" value={get("customer_gains")}
          onChange={(v) => update("customer_gains", v)} placeholder="What outcomes do customers want?" />
      </div>
    </div>
  );
}
