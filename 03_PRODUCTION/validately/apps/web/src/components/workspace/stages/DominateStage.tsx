"use client";
import { FieldInput } from "../FieldInput";
import { FieldSelect } from "../FieldSelect";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function DominateStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  const scores = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const thielFields = [
    get("thiel_engineering"),
    get("thiel_timing"),
    get("thiel_monopoly"),
    get("thiel_people"),
    get("thiel_distribution"),
    get("thiel_durability"),
    get("thiel_secret"),
  ];
  const filledScores = thielFields.filter((v) => v !== "");
  const avgScore = filledScores.length > 0
    ? Math.round(
        (filledScores.reduce((sum, v) => sum + (parseInt(v) || 0), 0) /
          filledScores.length) *
          10
      ) / 10
    : null;

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          WeWork ($47B valuation → $0): No moat. Just real estate arbitrage. Once public market
          scrutinized unit economics, the house of cards collapsed. Lesson: dominance requires defensibility.
        </div>
      </div>

      <CollapsibleSection
        title="Competitive Moat Scorecard"
        fieldKeys={["thiel_engineering", "thiel_timing", "thiel_monopoly", "thiel_people", "thiel_distribution", "thiel_durability", "thiel_secret", "thiel_moat"]}
        data={data}
        defaultOpen
      >
        <div className="text-[10px] text-content-subtle mb-2">
          Rate each area 1-10. Scoring 7+ in at least 2 areas means you have a real advantage.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldSelect label="Engineering (10x Tech)" value={get("thiel_engineering")}
            onChange={(v) => update("thiel_engineering", v)} options={scores} gate
            hint="Is your technology 10x better than alternatives?" />
          <FieldSelect label="Timing (Why Now?)" value={get("thiel_timing")}
            onChange={(v) => update("thiel_timing", v)} options={scores} gate
            hint="Is now the right moment? What changed?" />
          <FieldSelect label="Monopoly (Niche Dominance)" value={get("thiel_monopoly")}
            onChange={(v) => update("thiel_monopoly", v)} options={scores}
            hint="Can you dominate a small market first?" />
          <FieldSelect label="People (Team)" value={get("thiel_people")}
            onChange={(v) => update("thiel_people", v)} options={scores}
            hint="Do you have the right team to execute?" />
          <FieldSelect label="Distribution (Channels)" value={get("thiel_distribution")}
            onChange={(v) => update("thiel_distribution", v)} options={scores}
            hint="Do you have a channel advantage?" />
          <FieldSelect label="Durability (10-20yr Moat)" value={get("thiel_durability")}
            onChange={(v) => update("thiel_durability", v)} options={scores}
            hint="Will this still be defensible in 10-20 years?" />
        </div>
        <FieldSelect label="Secret (Unique Insight)" value={get("thiel_secret")}
          onChange={(v) => update("thiel_secret", v)} options={scores}
          hint="What do you know that others don't?" />
        {avgScore !== null && (
          <div className="p-2 bg-surface-1 rounded-md mt-2 text-[11px] text-content-muted">
            Moat Score: <span className="font-bold text-brand text-sm">{avgScore}/10</span> avg ({filledScores.length}/7 scored)
          </div>
        )}
        <FieldInput label="Moat Summary" type="textarea" value={get("thiel_moat")}
          onChange={(v) => update("thiel_moat", v)}
          placeholder="Based on your scores above — which 2-3 powers are your strongest? How will you strengthen them?"
          gate minLength={80} onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Market Dominance"
        fieldKeys={["market_share"]}
        data={data}
      >
        <FieldInput label="Market Share (%)" type="number" value={get("market_share")}
          onChange={(v) => update("market_share", v)} placeholder="0-100" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Financial Health"
        fieldKeys={["arr_mrr", "analytics_maturity", "data_driven_decision", "exit_strategy"]}
        data={data}
      >
        <FieldInput label="ARR / MRR ($)" value={get("arr_mrr")}
          onChange={(v) => update("arr_mrr", v)} placeholder="Annual or Monthly Recurring Revenue" gate />
        <FieldSelect label="Analytics Maturity" value={get("analytics_maturity")}
          onChange={(v) => update("analytics_maturity", v)} gate
          options={[
            { value: "Descriptive", label: "Descriptive — What happened?" },
            { value: "Diagnostic", label: "Diagnostic — Why did it happen?" },
            { value: "Predictive", label: "Predictive — What will happen?" },
            { value: "Prescriptive", label: "Prescriptive — What should we do?" },
          ]}
          hint="Most startups just track what happened. To scale, you need to predict what's next." />
        <FieldInput label="Data-Driven Decisions" type="textarea" value={get("data_driven_decision")}
          onChange={(v) => update("data_driven_decision", v)}
          placeholder="How do you use data to decide? What dashboards? What review cadence?" onAskAI={askAI} />
        <FieldInput label="Exit Strategy" type="textarea" value={get("exit_strategy")}
          onChange={(v) => update("exit_strategy", v)}
          placeholder="IPO / Acquisition / Profitability / Buyback" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Long-Term Vision"
        fieldKeys={["company_purpose", "company_mission", "company_values", "vision_10yr"]}
        data={data}
      >
        <FieldInput label="Company Purpose" type="textarea" value={get("company_purpose")}
          onChange={(v) => update("company_purpose", v)}
          placeholder="WHY does this company exist? What dent in the universe?"
          hint="Beyond profit — why does this company need to exist?" gate onAskAI={askAI} />
        <FieldInput label="Company Mission" type="textarea" value={get("company_mission")}
          onChange={(v) => update("company_mission", v)}
          placeholder="WHAT are we building? For whom? What does success look like?"
          hint="Keep it concrete — what does winning look like?" onAskAI={askAI} />
        <FieldInput label="Company Values" type="textarea" value={get("company_values")}
          onChange={(v) => update("company_values", v)}
          placeholder="HOW do we operate? 3-5 non-negotiable principles."
          hint="These should guide real decisions — not just decorate the wall." onAskAI={askAI} />
        <FieldInput label="10-Year Vision" type="textarea" value={get("vision_10yr")}
          onChange={(v) => update("vision_10yr", v)}
          placeholder="Where will you be in 10 years? Who will you be for?" gate onAskAI={askAI} />
      </CollapsibleSection>
    </div>
  );
}
