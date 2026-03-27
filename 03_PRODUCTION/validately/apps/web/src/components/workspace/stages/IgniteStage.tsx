"use client";
import { FieldInput } from "../FieldInput";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function IgniteStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          Homejoy ($40M raised, shut down 2015): Great product, terrible unit economics. CAC exceeded LTV.
          Tried to scale before the economics worked. Lesson: ignite with sustainable unit economics.
        </div>
      </div>

      <CollapsibleSection
        title="Beachhead Strategy"
        fieldKeys={["beachhead_segment", "omtm", "primary_channel", "pricing_model"]}
        data={data}
        defaultOpen
      >
        <FieldInput label="Beachhead Segment" type="textarea" value={get("beachhead_segment")}
          onChange={(v) => update("beachhead_segment", v)}
          placeholder="The ONE narrow segment you'll dominate first (e.g. 'solo SaaS founders in SF')"
          gate autoFocus onAskAI={askAI} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldInput label="Key Metric (OMTM)" value={get("omtm")}
            onChange={(v) => update("omtm", v)} placeholder="e.g., Weekly Active Users" gate />
          <FieldInput label="Pricing Model (first 10)" value={get("pricing_model")}
            onChange={(v) => update("pricing_model", v)} placeholder="e.g., $29/mo freemium-to-paid" gate />
        </div>
        <FieldInput label="Primary Acquisition Channel" value={get("primary_channel")}
          onChange={(v) => update("primary_channel", v)} placeholder="e.g., Content marketing, Cold outreach" gate />
      </CollapsibleSection>

      <CollapsibleSection
        title="First Customers"
        fieldKeys={["first_10_customers", "retention_strategy", "expansion_playbook"]}
        data={data}
      >
        <FieldInput label="How to get first 10 customers" type="textarea" value={get("first_10_customers")}
          onChange={(v) => update("first_10_customers", v)}
          placeholder="Be specific — names, outreach method, timeline.\nDo unscalable things. Airbnb went door-to-door."
          gate onAskAI={askAI} />
        <FieldInput label="Retention Strategy" type="textarea" value={get("retention_strategy")}
          onChange={(v) => update("retention_strategy", v)}
          placeholder="How do you keep them coming back? Onboarding → Activation → Habit" onAskAI={askAI} />
        <FieldInput label="Expansion Playbook" type="textarea" value={get("expansion_playbook")}
          onChange={(v) => update("expansion_playbook", v)}
          placeholder="How do you grow revenue per customer? Upsell, cross-sell, usage expansion" onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Get / Keep / Grow"
        fieldKeys={["get_strategy", "keep_strategy", "grow_strategy"]}
        data={data}
      >
        <FieldInput label="GET Strategy" type="textarea" value={get("get_strategy")}
          onChange={(v) => update("get_strategy", v)}
          placeholder="How do you acquire customers? Be specific about channels, tactics, budget."
          hint="Focus on the ONE channel that works best, not all channels."
          gate onAskAI={askAI} />
        <FieldInput label="KEEP Strategy" type="textarea" value={get("keep_strategy")}
          onChange={(v) => update("keep_strategy", v)}
          placeholder="How do you retain customers? Onboarding, engagement loops, support."
          hint="Retention is cheaper than acquisition. What makes them stay?"
          gate onAskAI={askAI} />
        <FieldInput label="GROW Strategy" type="textarea" value={get("grow_strategy")}
          onChange={(v) => update("grow_strategy", v)}
          placeholder="How do you increase revenue per customer? Expansion, referrals, network effects."
          hint="The best growth is when customers bring more customers." onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Channel Economics"
        fieldKeys={["channel_conversion", "channel_cac"]}
        data={data}
      >
        <FieldInput label="Channel Conversion Rates" type="textarea" value={get("channel_conversion")}
          onChange={(v) => update("channel_conversion", v)}
          placeholder="Channel | Impressions → Clicks → Trials → Paid\ne.g., Content: 10K → 500 → 50 → 10"
          hint="Track the full funnel for each channel" />
        <FieldInput label="CAC per Channel ($)" type="textarea" value={get("channel_cac")}
          onChange={(v) => update("channel_cac", v)}
          placeholder="Channel | CAC | LTV\ne.g., Content: $15 | $450"
          hint="Know your CAC per channel — not just blended average" />
      </CollapsibleSection>
    </div>
  );
}
