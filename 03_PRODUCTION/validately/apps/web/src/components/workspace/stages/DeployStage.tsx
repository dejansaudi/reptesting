"use client";
import { FieldInput } from "../FieldInput";
import { FieldSelect } from "../FieldSelect";
import { BenchmarkIndicator } from "../BenchmarkIndicator";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function DeployStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          Theranos ($9B valuation → fraud): Scaled the story before scaling the product. Never had
          repeatable, reliable technology. Lesson: deploy systems that actually work at scale.
        </div>
      </div>

      <CollapsibleSection
        title="Current Phase"
        fieldKeys={["current_phase"]}
        data={data}
        defaultOpen
      >
        <FieldSelect label="Startup Phase" value={get("current_phase")}
          onChange={(v) => update("current_phase", v)} gate
          options={[
            { value: "Discovery", label: "Discovery — Still finding problem-solution fit" },
            { value: "Validation", label: "Validation — Testing with real customers" },
            { value: "Efficiency", label: "Efficiency — Optimizing unit economics" },
            { value: "Scale", label: "Scale — Repeatable growth engine" },
          ]}
          hint="Where are you on the journey from idea to growth engine?" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Sales Process"
        fieldKeys={["sales_playbook", "sales_cycle"]}
        data={data}
        defaultOpen
      >
        <FieldInput label="Sales Playbook" type="textarea" value={get("sales_playbook")}
          onChange={(v) => update("sales_playbook", v)}
          placeholder="Lead source → Qualification → Demo → Close. Step by step." gate onAskAI={askAI} />
        <FieldInput label="Sales Cycle (days)" type="number" value={get("sales_cycle")}
          onChange={(v) => update("sales_cycle", v)} placeholder="e.g., 30" gate />
        <BenchmarkIndicator label="Sales Cycle" value={get("sales_cycle")} good="30" ok="60" bad="90" lowerIsBetter />
      </CollapsibleSection>

      <CollapsibleSection
        title="Your One Key Metric"
        fieldKeys={["omtm_metric", "omtm_target", "omtm_process"]}
        data={data}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldInput label="Key Metric" value={get("omtm_metric")}
            onChange={(v) => update("omtm_metric", v)} placeholder="e.g., Weekly Active Users, MRR, NPS"
            hint="The one number your whole team obsesses over right now" gate autoFocus />
          <FieldInput label="Target" value={get("omtm_target")}
            onChange={(v) => update("omtm_target", v)} placeholder="e.g., 1000 WAU by March, $50k MRR by Q2"
            hint="Specific number + deadline" />
        </div>
        <FieldInput label="How You'll Move It" type="textarea" value={get("omtm_process")}
          onChange={(v) => update("omtm_process", v)}
          placeholder="What experiments are you running to move this number?"
          hint="Think up experiments, analyze results, rank by impact, run the best ones, repeat" onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Experiment Backlog"
        fieldKeys={["experiment_backlog", "weekly_review"]}
        data={data}
      >
        <FieldInput label="Experiment Backlog" type="textarea" value={get("experiment_backlog")}
          onChange={(v) => update("experiment_backlog", v)}
          placeholder="Rank by impact (high/med/low):\n1. [High] Test pricing at $29 vs $49\n2. [Med] A/B test landing page"
          hint="What are you testing next? Prioritize by impact and effort." onAskAI={askAI} />
        <FieldInput label="Weekly Review" type="textarea" value={get("weekly_review")}
          onChange={(v) => update("weekly_review", v)}
          placeholder="What did you learn this week? What will you test next week?"
          hint="Consistent weekly learning compounds faster than any feature" onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Learning & Hypotheses"
        fieldKeys={["hypothesis_log", "okrs"]}
        data={data}
      >
        <FieldInput label="Hypothesis Log" type="textarea" value={get("hypothesis_log")}
          onChange={(v) => update("hypothesis_log", v)}
          placeholder="H1: Customers value X\nH2: Channel Y will convert at Z%" />
        <FieldInput label="OKRs" type="textarea" value={get("okrs")}
          onChange={(v) => update("okrs", v)}
          placeholder="Objective: Reach product-market fit. KR1: 40% PMF. KR2: 20% retention." />
      </CollapsibleSection>

      <CollapsibleSection
        title="Scaling & Team"
        fieldKeys={["team_plan", "expansion_revenue"]}
        data={data}
      >
        <FieldInput label="Team Plan (next 12 months)" type="textarea" value={get("team_plan")}
          onChange={(v) => update("team_plan", v)}
          placeholder="Role | Timeline | Cost | Why. Be specific." gate minLength={50} onAskAI={askAI} />
        <FieldInput label="Expansion Revenue Goal ($)" type="number" value={get("expansion_revenue")}
          onChange={(v) => update("expansion_revenue", v)} placeholder="12-month revenue target" gate />
      </CollapsibleSection>

      <CollapsibleSection
        title="Unit Economics"
        fieldKeys={["gross_margin"]}
        data={data}
      >
        <FieldInput label="Gross Margin (%)" type="number" value={get("gross_margin")}
          onChange={(v) => update("gross_margin", v)} placeholder="0-100" gate />
        <BenchmarkIndicator label="Gross Margin" value={get("gross_margin")} good="50" ok="40" bad="20" />
      </CollapsibleSection>
    </div>
  );
}
