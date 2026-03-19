"use client";
import { FieldInput } from "../FieldInput";
import { BenchmarkIndicator } from "../BenchmarkIndicator";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function ValidateStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          Quibi ($1.75B raised, shut down in 6 months): Launched without validating PMF. Assumed
          people wanted short-form premium content on mobile. They didn&apos;t. Lesson: measure PMF before scaling.
        </div>
      </div>

      <CollapsibleSection
        title="Product-Market Fit"
        fieldKeys={["pmf_score", "retention_d7", "activation_rate"]}
        data={data}
        defaultOpen
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <div>
            <FieldInput label="PMF Score (%)" type="number" value={get("pmf_score")}
              onChange={(v) => update("pmf_score", v)} placeholder="Sean Ellis test: % who'd be 'very disappointed'" gate autoFocus />
            <BenchmarkIndicator label="PMF Score" value={get("pmf_score")} unit="%" good="40" ok="25" bad="20" />
          </div>
          <div>
            <FieldInput label="Day-7 Retention (%)" type="number" value={get("retention_d7")}
              onChange={(v) => update("retention_d7", v)} placeholder="% of users returning after 7 days" />
            <BenchmarkIndicator label="D7 Retention" value={get("retention_d7")} unit="%" good="20" ok="10" bad="5" />
          </div>
        </div>
        <FieldInput label="Activation Rate (%)" type="number" value={get("activation_rate")}
          onChange={(v) => update("activation_rate", v)} placeholder="% completing key action" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Unit Economics"
        fieldKeys={["cac", "ltv", "ltv_cac_ratio", "payback"]}
        data={data}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldInput label="CAC" type="number" value={get("cac")}
            onChange={(v) => update("cac", v)} placeholder="$" gate />
          <FieldInput label="LTV" type="number" value={get("ltv")}
            onChange={(v) => update("ltv", v)} placeholder="$" gate />
          <FieldInput label="LTV:CAC Ratio" type="number" value={get("ltv_cac_ratio")}
            onChange={(v) => update("ltv_cac_ratio", v)} placeholder="e.g., 3.5" gate />
          <FieldInput label="Payback Period (months)" type="number" value={get("payback")}
            onChange={(v) => update("payback", v)} placeholder="e.g., 12" />
        </div>
        <BenchmarkIndicator label="LTV:CAC" value={get("ltv_cac_ratio")} good="3" ok="2" bad="1" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Business Model"
        fieldKeys={["revenue_model", "pmf_verdict", "key_learning"]}
        data={data}
      >
        <FieldInput label="Revenue Model" type="textarea" value={get("revenue_model")}
          onChange={(v) => update("revenue_model", v)}
          placeholder="SaaS / Marketplace / Transaction fee / Usage-based / Freemium → Pro" gate onAskAI={askAI} />
        <FieldInput label="PMF Verdict" type="textarea" value={get("pmf_verdict")}
          onChange={(v) => update("pmf_verdict", v)}
          placeholder="Based on your data — do you have PMF? What evidence supports your verdict?" gate onAskAI={askAI} />
        <FieldInput label="Key Learning" type="textarea" value={get("key_learning")}
          onChange={(v) => update("key_learning", v)}
          placeholder="What was the most surprising finding?" onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Business Model Canvas"
        fieldKeys={["bmc_channels", "bmc_customer_relationships", "bmc_key_resources", "bmc_key_activities", "bmc_key_partners", "bmc_cost_structure"]}
        data={data}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldInput label="BMC Channels" type="textarea" value={get("bmc_channels")}
            onChange={(v) => update("bmc_channels", v)} placeholder="How do you reach customers?" />
          <FieldInput label="BMC Customer Relationships" type="textarea" value={get("bmc_customer_relationships")}
            onChange={(v) => update("bmc_customer_relationships", v)} placeholder="How do you interact with customers?" />
          <FieldInput label="BMC Key Resources" type="textarea" value={get("bmc_key_resources")}
            onChange={(v) => update("bmc_key_resources", v)} placeholder="What assets are required?" />
          <FieldInput label="BMC Key Activities" type="textarea" value={get("bmc_key_activities")}
            onChange={(v) => update("bmc_key_activities", v)} placeholder="What must you do well?" />
          <FieldInput label="BMC Key Partners" type="textarea" value={get("bmc_key_partners")}
            onChange={(v) => update("bmc_key_partners", v)} placeholder="Who helps you deliver?" />
          <FieldInput label="BMC Cost Structure" type="textarea" value={get("bmc_cost_structure")}
            onChange={(v) => update("bmc_cost_structure", v)} placeholder="What are the major costs?" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Experiment Framework"
        fieldKeys={["experiment_hypothesis", "experiment_result", "experiment_learning"]}
        data={data}
      >
        <FieldInput label="Hypothesis" type="textarea" value={get("experiment_hypothesis")}
          onChange={(v) => update("experiment_hypothesis", v)}
          placeholder="We believe [action] will result in [outcome]. We'll know when [metric] changes by [amount]." onAskAI={askAI} />
        <FieldInput label="Experiment Result" type="textarea" value={get("experiment_result")}
          onChange={(v) => update("experiment_result", v)} placeholder="What happened?" onAskAI={askAI} />
        <FieldInput label="Experiment Learning" type="textarea" value={get("experiment_learning")}
          onChange={(v) => update("experiment_learning", v)} placeholder="What did you learn?" onAskAI={askAI} />
      </CollapsibleSection>
    </div>
  );
}
