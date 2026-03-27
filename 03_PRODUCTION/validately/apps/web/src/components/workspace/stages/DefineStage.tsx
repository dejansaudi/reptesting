"use client";
import { FieldInput } from "../FieldInput";
import { FieldSelect } from "../FieldSelect";
import { CollapsibleSection } from "../CollapsibleSection";

interface StageProps {
  data: Record<string, string>;
  update: (field: string, value: string) => void;
}

export function DefineStage({ data, update }: StageProps) {
  const get = (f: string) => data[f] || "";
  const askAI = (label: string, value: string) => {
    (window as any).__aiCoachAskField?.(label, value);
  };

  return (
    <div>
      <div className="p-3 bg-surface-2 rounded-lg border border-border mb-4">
        <div className="text-[10px] font-bold text-content-subtle uppercase mb-1.5">FailStory</div>
        <div className="text-[11px] text-content-muted">
          Google Wave (2009): Tried to be email, IM, wiki, and social network all at once.
          Users couldn&apos;t explain what it was. Lesson: define clearly or die confused.
        </div>
      </div>

      <CollapsibleSection
        title="Core Definition"
        fieldKeys={["core_problem", "value_prop"]}
        data={data}
        defaultOpen
      >
        <FieldInput label="Problem Statement (refined)" type="textarea" value={get("core_problem")}
          onChange={(v) => update("core_problem", v)}
          placeholder="Refined single statement: [Customer] needs [solution] because [reason]"
          gate autoFocus onAskAI={askAI} />
        <FieldInput label="Value Proposition" type="textarea" value={get("value_prop")}
          onChange={(v) => update("value_prop", v)}
          placeholder="We help [who] to [outcome] by [how], unlike [alternatives]"
          gate onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Feature Scoping"
        fieldKeys={["must_have", "not_building"]}
        data={data}
        defaultOpen
      >
        <FieldInput label="Must-have features (v1)" type="textarea" value={get("must_have")}
          onChange={(v) => update("must_have", v)}
          placeholder="Maximum 3 features. If you list more, you're building too much.\n1. \n2. \n3. "
          gate onAskAI={askAI} />
        <FieldInput label="What we're NOT building" type="textarea" value={get("not_building")}
          onChange={(v) => update("not_building", v)}
          placeholder="Be specific. What are you saying NO to? This is as important as what you build."
          gate onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Hook Model"
        fieldKeys={["hook_trigger", "hook_action", "hook_reward", "hook_investment"]}
        data={data}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <FieldInput label="Hook Trigger" value={get("hook_trigger")}
            onChange={(v) => update("hook_trigger", v)} placeholder="What triggers the user to start?" />
          <FieldInput label="Hook Action" value={get("hook_action")}
            onChange={(v) => update("hook_action", v)} placeholder="What's the simplest action they take?" />
          <FieldInput label="Hook Reward" value={get("hook_reward")}
            onChange={(v) => update("hook_reward", v)} placeholder="What reward do they get?" />
          <FieldInput label="Hook Investment" value={get("hook_investment")}
            onChange={(v) => update("hook_investment", v)} placeholder="What do they invest (data, effort, social)?" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Value Map"
        fieldKeys={["pain_relievers", "gain_creators"]}
        data={data}
      >
        <FieldInput label="Pain Relievers" type="textarea" value={get("pain_relievers")}
          onChange={(v) => update("pain_relievers", v)}
          placeholder="How does your product eliminate or reduce customer pains?" onAskAI={askAI} />
        <FieldInput label="Gain Creators" type="textarea" value={get("gain_creators")}
          onChange={(v) => update("gain_creators", v)}
          placeholder="How does your product create customer gains?" onAskAI={askAI} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Prototype Plan"
        fieldKeys={["prototype_level", "prototype_test_plan"]}
        data={data}
      >
        <FieldSelect label="Prototype Level" value={get("prototype_level")}
          onChange={(v) => update("prototype_level", v)}
          options={[
            { value: "whiteboard", label: "Whiteboard — Sketches and diagrams" },
            { value: "wireframe", label: "Wireframe — Clickable mockups" },
            { value: "prototype", label: "Prototype — Functional simulation" },
            { value: "mvp", label: "MVP — Minimum viable product" },
          ]} />
        <FieldInput label="Test Plan" type="textarea" value={get("prototype_test_plan")}
          onChange={(v) => update("prototype_test_plan", v)}
          placeholder="How will you test this with real users? What are you measuring?" onAskAI={askAI} />
      </CollapsibleSection>
    </div>
  );
}
