import { useState, useCallback, useEffect, useRef, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════
// VENTUREPATH v4 — Visual Canvas Edition
// Interactive frameworks · Quality scoring · Benchmarks · Failure stories
// ══════════════════════════════════════════════════════════════════

// ─── COLORS ───
const P = {
  bg: "#0f0a1a", bgCard: "#1a1228", bgSurface: "#140e22", bgInput: "#1e1630",
  accent1: "#f97316", accent2: "#ec4899", accent3: "#a855f7", accent4: "#6366f1",
  accent5: "#10b981", accent6: "#3b82f6",
  gradient: "linear-gradient(135deg, #f97316, #ec4899, #a855f7)",
  text: "#f1f0f5", textMuted: "#9b8fb8", textDim: "#6b5f85",
  border: "#2a2040", borderLight: "#352a4d",
  success: "#10b981", danger: "#ef4444", warning: "#f59e0b", xp: "#fbbf24",
};

// ─── QUALITY SCORING ENGINE ───
function scoreInput(value, fieldType) {
  if (!value || value.trim().length === 0) return { total: 0, specificity: 0, evidence: 0, actionability: 0 };
  const v = value.trim();
  let specificity = 0, evidence = 0, actionability = 0;

  // Specificity: length, no buzzwords, has details
  if (v.length > 20) specificity++;
  if (v.length > 60) specificity++;
  if (v.length > 120) specificity++;
  if (/specific|exact|precise|\d/.test(v)) specificity++;
  if (/everyone|disrupt|revolutionize|leverage|synergy|world.?class/i.test(v)) specificity = Math.max(0, specificity - 2);
  specificity = Math.min(5, specificity);

  // Evidence: numbers, data, quotes, references
  if (/\d/.test(v)) evidence++;
  if (/\$|€|£/.test(v)) evidence++;
  if (/\d+%|\d+x|\d+k/i.test(v)) evidence++;
  if (/interview|survey|data|research|tested|found|measured/i.test(v)) evidence++;
  if (/"[^"]+"/i.test(v)) evidence++;
  evidence = Math.min(5, evidence);

  // Actionability: verbs, timeframes, measurability
  if (/will|plan|test|launch|build|ship|measure/i.test(v)) actionability++;
  if (/week|month|day|quarter|by |within/i.test(v)) actionability++;
  if (/\d/.test(v) && /metric|kpi|target|goal/i.test(v)) actionability++;
  if (v.length > 40) actionability++;
  if (/step|first|then|next/i.test(v)) actionability++;
  actionability = Math.min(5, actionability);

  const total = Math.round(((specificity + evidence + actionability) / 15) * 100);
  return { total, specificity, evidence, actionability };
}

// ─── BENCHMARKS & FAILURE STORIES ───
const BENCHMARKS = {
  customer_interviews: { good: 20, avg: 10, text: "Successful startups average 20+ customer interviews before building. YC recommends talking to 100 potential users." },
  mvp_features: { good: 3, avg: 5, text: "The best MVPs have 1-3 features. Dropbox launched with just a video. Buffer launched with a single landing page." },
  pmf_score: { good: 40, avg: 25, text: "Sean Ellis benchmark: 40%+ 'very disappointed' = PMF. Superhuman hit 58% after iterating from 22%." },
  time_to_mvp: { good: 4, avg: 12, text: "Top YC companies ship MVP in 2-4 weeks. If it takes months, you're building too much." },
  ltv_cac: { good: 3, avg: 1.5, text: "Healthy SaaS: LTV ≥ 3× CAC. Below 1× means you're paying to lose money on every customer." },
};

const FAILURE_STORIES = [
  { trigger: "no_competitors", story: "Webvan (1999) claimed grocery delivery had no real competitors. They spent $375M before realizing people were fine going to the store. 'No competitors' meant 'no proven demand.'", lesson: "If nobody is solving this problem, question whether it needs solving." },
  { trigger: "mvp_too_big", story: "Color Labs raised $41M pre-launch to build a feature-rich social photo app. They launched with too many features, confused users, and shut down. Instagram launched with 1 feature: photo filters.", lesson: "More features = more confusion. Ship the minimum that tests your hypothesis." },
  { trigger: "no_customer_quotes", story: "Juicero built a $400 juicer without deeply understanding customers. Turns out people could just squeeze the juice packs by hand. $120M wasted on an assumption.", lesson: "If you can't quote a real customer describing the pain, you might be imagining it." },
  { trigger: "weak_timing", story: "Google Glass (2013) was technically impressive but launched when society wasn't ready for wearable cameras. The same technology succeeded years later as enterprise tools.", lesson: "Right product, wrong time = failure. Timing isn't optional." },
  { trigger: "no_moat", story: "Groupon had no structural moat — any competitor could offer deals. They went from $16B valuation to <$1B. 'Better deals' wasn't defensible.", lesson: "Without structural defensibility, success attracts competitors who copy everything." },
  { trigger: "vanity_metrics", story: "MoviePass had millions of users but lost money on every transaction. Growth without unit economics is just slow-motion bankruptcy.", lesson: "Users ≠ business. Revenue minus costs = business." },
];

// ─── GAMIFICATION ───
const LEVELS = [
  { level: 1, name: "Explorer", xp: 0, icon: "🌱", color: "#10b981" },
  { level: 2, name: "Discoverer", xp: 200, icon: "🔍", color: "#3b82f6" },
  { level: 3, name: "Builder", xp: 500, icon: "🔨", color: "#a855f7" },
  { level: 4, name: "Validator", xp: 900, icon: "🔬", color: "#ec4899" },
  { level: 5, name: "Launcher", xp: 1400, icon: "🚀", color: "#f97316" },
];
function getLevel(xp) { let l = LEVELS[0]; for (const lv of LEVELS) if (xp >= lv.xp) l = lv; return l; }
function getNextLevel(xp) { for (const l of LEVELS) if (xp < l.xp) return l; return null; }

// ─── PROGRESS RING ───
function Ring({ pct, size = 64, stroke = 5, color, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color || P.accent1} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

// ─── CONFETTI ───
function Confetti({ show }) {
  if (!show) return null;
  const ps = Array.from({length:35},(_,i)=>({ id:i, x:Math.random()*100, d:Math.random()*0.5, dur:1+Math.random()*1.5, col:[P.accent1,P.accent2,P.accent3,P.accent5,P.xp,P.accent6][i%6], sz:4+Math.random()*8 }));
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
    <style>{`@keyframes cFall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    {ps.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:-20,width:p.sz,height:p.sz,background:p.col,borderRadius:p.sz>8?"50%":"2px",animation:`cFall ${p.dur}s ${p.d}s ease-in forwards`}}/>)}
  </div>;
}

// ─── QUALITY SCORE BADGE ───
function QualityBadge({ value, fieldType }) {
  const sc = scoreInput(value, fieldType);
  if (sc.total === 0) return null;
  const color = sc.total >= 70 ? P.success : sc.total >= 40 ? P.warning : P.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32 }}>{sc.total}%</div>
      <div style={{ flex: 1, display: "flex", gap: 4 }}>
        {[
          { label: "Specificity", val: sc.specificity },
          { label: "Evidence", val: sc.evidence },
          { label: "Actionable", val: sc.actionability },
        ].map(d => (
          <div key={d.label} style={{ flex: 1 }} title={`${d.label}: ${d.val}/5`}>
            <div style={{ fontSize: 8, color: P.textDim, marginBottom: 2 }}>{d.label}</div>
            <div style={{ height: 3, borderRadius: 2, background: P.border }}>
              <div style={{ height: "100%", width: `${(d.val/5)*100}%`, background: d.val >= 4 ? P.success : d.val >= 2 ? P.warning : P.danger, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SMART INPUT FIELD ───
function SmartField({ label, value, onChange, placeholder, example, type = "text", options, icon, tip, fieldType, color }) {
  const [showTip, setShowTip] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const fieldColor = color || P.accent1;

  if (type === "select") {
    return (
      <div style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, color: fieldColor, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
          {tip && <span style={{ fontSize: 12, cursor: "pointer", opacity: 0.5 }} onClick={() => setShowTip(!showTip)} title="Show tip">💡</span>}
        </div>
        {showTip && <div style={{ fontSize: 11, color: P.textMuted, marginBottom: 6, padding: "6px 10px", background: P.accent4+"12", borderRadius: 6, lineHeight: 1.5 }}>{tip}</div>}
        <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: P.bgInput, border: `1px solid ${P.borderLight}`, borderRadius: 8, color: P.text, fontSize: 13, fontFamily: "inherit", outline: "none", appearance: "none", cursor: "pointer" }}>
          <option value="" style={{ background: P.bgInput }}>{placeholder || "Select..."}</option>
          {(options || []).map(o => <option key={o} value={o} style={{ background: P.bgInput }}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (type === "scale") {
    const val = parseInt(value) || 0;
    return (
      <div style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, color: fieldColor, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
          <span style={{ fontSize: 12, color: P.textMuted, marginLeft: "auto" }}>{val}/10</span>
        </div>
        <input type="range" min={0} max={10} value={val} onChange={e => onChange(e.target.value)} style={{ width: "100%", accentColor: fieldColor }} />
        {options && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: P.textDim }}><span>{options[0]}</span><span>{options[1]}</span></div>}
      </div>
    );
  }

  if (type === "chips") {
    const selected = value ? value.split("|||") : [];
    return (
      <div style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, color: fieldColor, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(options || []).map(o => {
            const on = selected.includes(o);
            return <button key={o} onClick={() => { const next = on ? selected.filter(s => s !== o) : [...selected, o]; onChange(next.join("|||")); }} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${on ? fieldColor : P.border}`, background: on ? fieldColor + "20" : "transparent", color: on ? fieldColor : P.textMuted, cursor: "pointer", transition: "all 0.15s" }}>{o}</button>;
          })}
        </div>
      </div>
    );
  }

  if (type === "checklist") {
    const checked = value ? value.split("|||") : [];
    return (
      <div style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontSize: 11, fontWeight: 700, color: fieldColor, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        </div>
        {(options || []).map(o => {
          const on = checked.includes(o);
          return <div key={o} onClick={() => { const next = on ? checked.filter(s => s !== o) : [...checked, o]; onChange(next.join("|||")); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: on ? P.accent5 + "12" : "transparent", border: `1px solid ${on ? P.accent5+"30" : P.border}`, marginBottom: 4, cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${on ? P.accent5 : P.border}`, background: on ? P.accent5 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, transition: "all 0.15s" }}>{on ? "✓" : ""}</div>
            <span style={{ fontSize: 12, color: on ? P.text : P.textMuted }}>{o}</span>
          </div>;
        })}
      </div>
    );
  }

  // Default: textarea with example toggle and quality scoring
  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span style={{ fontSize: 11, fontWeight: 700, color: fieldColor, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {example && <button onClick={() => setShowExample(!showExample)} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, border: `1px solid ${P.border}`, background: showExample ? P.accent4+"20" : "transparent", color: P.textDim, cursor: "pointer", fontWeight: 600 }}>Example</button>}
          {tip && <button onClick={() => setShowTip(!showTip)} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, border: `1px solid ${P.border}`, background: showTip ? P.accent4+"20" : "transparent", color: P.textDim, cursor: "pointer", fontWeight: 600 }}>💡 Tip</button>}
        </div>
      </div>
      {showExample && <div style={{ fontSize: 11, color: P.accent5, marginBottom: 6, padding: "8px 10px", background: P.accent5+"10", borderRadius: 6, lineHeight: 1.5, borderLeft: `3px solid ${P.accent5}` }}>
        <strong>Good example:</strong> {example}
      </div>}
      {showTip && <div style={{ fontSize: 11, color: P.textMuted, marginBottom: 6, padding: "8px 10px", background: P.accent4+"10", borderRadius: 6, lineHeight: 1.5 }}>{tip}</div>}
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", minHeight: type === "short" ? 48 : 72, background: P.bgInput, border: `1px solid ${P.borderLight}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", color: P.text, outline: "none", resize: "vertical", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = fieldColor} onBlur={e => e.target.style.borderColor = P.borderLight} />
      <QualityBadge value={value} fieldType={fieldType} />
    </div>
  );
}

// ─── FAILURE STORY CALLOUT ───
function FailureCallout({ triggerId }) {
  const story = FAILURE_STORIES.find(s => s.trigger === triggerId);
  if (!story) return null;
  return (
    <div style={{ background: P.danger+"10", border: `1px solid ${P.danger}25`, borderRadius: 10, padding: 14, marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: P.danger, marginBottom: 4 }}>💀 Real failure story</div>
      <div style={{ fontSize: 12, color: P.text, lineHeight: 1.6, marginBottom: 6 }}>{story.story}</div>
      <div style={{ fontSize: 11, color: P.warning, fontStyle: "italic" }}>→ Lesson: {story.lesson}</div>
    </div>
  );
}

// ─── BENCHMARK CALLOUT ───
function BenchmarkCallout({ id }) {
  const b = BENCHMARKS[id];
  if (!b) return null;
  return (
    <div style={{ background: P.accent6+"10", border: `1px solid ${P.accent6}25`, borderRadius: 10, padding: 12, marginTop: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: P.accent6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>📊 Benchmark</div>
      <div style={{ fontSize: 12, color: P.textMuted, lineHeight: 1.5 }}>{b.text}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STAGE DEFINITIONS — Visual Canvas Frameworks
// ══════════════════════════════════════════════════════════════

const STAGES = [
  // ─── STAGE 0: STRATEGY MAP ───
  {
    id: 0, title: "Strategy Map", icon: "🗺️", color: P.accent4, xpPerField: 20,
    desc: "Map your strategic foundation — vision, bets, assumptions, and what kills this.",
    render: (d, u, c) => (
      <div>
        {/* Strategy Map: vertical stacked layers like Dejan's Hitrinakup template */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { id: "vision", label: "Vision & Future", icon: "🔭", color: "#fbbf24", tip: "Specific picture of the world you're creating — not a tagline", example: "In 5 years, every Series A startup in SEA uses our platform to validate product ideas in <48 hours, replacing 3-month research cycles.", placeholder: "The specific future you're building toward..." },
            { id: "mission", label: "Mission — What You DO", icon: "🎯", color: "#f97316", tip: "ONE sentence. If you need two, you don't understand it yet.", example: "We provide a self-serve experiment platform that lets product teams run 10x more validation tests per quarter.", placeholder: "One sentence: what does your venture do?", type: "short" },
            { id: "strategy", label: "Contrarian Bet", icon: "♟️", color: "#ec4899", tip: "What do YOU believe that most people in your industry think is wrong?", example: "Most people think customer research requires hiring an agency. We believe AI + structured frameworks can make any PM a great researcher.", placeholder: "Your contrarian belief about this space..." },
            { id: "advantage", label: "Unfair Advantage", icon: "🛡️", color: "#a855f7", tip: "What takes 18+ months to replicate? 'Team' and 'passion' don't count.", example: "Proprietary dataset of 50K validated experiments from 2,000 startups, creating benchmark data no competitor can match.", placeholder: "Specific defensible advantage..." },
          ].map((f, i) => (
            <div key={f.id} style={{ background: f.color + "10", border: `1px solid ${f.color}25`, borderRadius: i === 0 ? "12px 12px 4px 4px" : i === 3 ? "4px 4px 12px 12px" : "4px", padding: 16 }}>
              <SmartField {...f} value={d(`0_${f.id}`)} onChange={v => u(`0_${f.id}`, v)} fieldType="strategy" color={f.color} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: 2 }}>
          <div style={{ background: P.danger+"10", border: `1px solid ${P.danger}25`, borderRadius: "4px 4px 4px 12px", padding: 16 }}>
            <SmartField label="Key Assumptions (must be true)" icon="⚠️" value={d("0_assumptions")} onChange={v => u("0_assumptions", v)} placeholder={"We assume that...\nWe assume that...\nWe assume that..."} tip="3-5 falsifiable assumptions. These become your validation targets." example="We assume that: (1) PMs spend >8hrs/week on research, (2) They trust AI-generated insights, (3) Their managers measure experiment velocity." color={P.warning} />
          </div>
          <div style={{ background: P.danger+"10", border: `1px solid ${P.danger}25`, borderRadius: "4px 4px 12px 4px", padding: 16 }}>
            <SmartField label="Pre-Mortem: What Kills This" icon="💀" value={d("0_risks")} onChange={v => u("0_risks", v)} placeholder="Write the failure post-mortem: what went wrong?" tip="Imagine it failed spectacularly. Why? Be brutal." example="We failed because: (1) Enterprise sales cycles were 9 months not 2, (2) PMs didn't trust AI outputs without manual validation, (3) A big player launched a free version." color={P.danger} />
          </div>
        </div>
      </div>
    ),
    assessment: ["I have a specific strategic direction, not a tagline", "I hold a contrarian belief that drives this venture", "I've listed 3+ falsifiable assumptions to test", "I've done a pre-mortem on how this fails"],
  },

  // ─── STAGE 1: TIMING & POSITIONING ───
  {
    id: 1, title: "Timing & Position", icon: "⏱️", color: P.accent3, xpPerField: 25,
    desc: "Prove why NOW and why HERE — with data, not hope.",
    render: (d, u, c) => (
      <div>
        {/* Market Timing — structured inputs */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📈</span> Market Timing Assessment
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SmartField label="Market Stage" icon="📊" type="select" options={["Emerging — new category forming", "Growing — expanding rapidly", "Mature — stable, established players", "Declining — shrinking or disrupted"]} value={d("1_stage")} onChange={v => u("1_stage", v)} placeholder="Select market stage..." color={P.accent3} />
            <SmartField label="Market Size Evidence" icon="💰" value={d("1_size")} onChange={v => u("1_size", v)} placeholder="TAM/SAM/SOM with sources..." example="TAM: $12B global product analytics (Gartner 2024). SAM: $2.1B in startup segment. SOM: $180M in SEA market." tip="Include source and year for every number." type="short" color={P.accent3} />
            <div style={{ gridColumn: "1 / -1" }}>
              <SmartField label="Why NOW — Timing Forces" icon="⏰" value={d("1_drivers")} onChange={v => u("1_drivers", v)} placeholder="2-3 specific forces with dates and data..." example="(1) GPT-4 launch (Mar 2023) made AI-assisted research viable for first time. (2) Gartner reports 73% of PMs now required to show evidence-based decisions (2024). (3) Series A funding down 40% — VCs demanding more validation pre-investment." tip="Name specific shifts with dates. Not 'AI is growing' but what exactly changed." color={P.accent3} />
              <BenchmarkCallout id="time_to_mvp" />
              {d("1_drivers") && d("1_drivers").length < 80 && <FailureCallout triggerId="weak_timing" />}
            </div>
          </div>
        </div>

        {/* Strategy Canvas — visual line chart representation */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📉</span> Strategy Canvas (Blue Ocean)
          </div>
          <div style={{ fontSize: 11, color: P.textDim, marginBottom: 14 }}>Rate each factor: how do competitors score vs. your offering? Find your differentiation.</div>
          <SmartField label="Competing Factors" icon="📋" type="chips" options={["Price", "Speed", "Quality", "Support", "Features", "Ease of Use", "Brand Trust", "Customization", "Integration", "Community"]} value={d("1_factors")} onChange={v => u("1_factors", v)} color={P.accent6} />
          <div style={{ marginTop: 14 }} />
          <SmartField label="Your Positioning Statement" icon="🎯" value={d("1_position")} onChange={v => u("1_position", v)} placeholder="For [specific segment] who [need], [product] is a [category] that [differentiator], unlike [alternative]." example="For product managers at Series A startups who need to validate features fast, VenturePath is an experiment platform that provides structured frameworks + AI coaching, unlike generic survey tools which give data without actionable guidance." color={P.accent3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <SmartField label="ELIMINATE (kill sacred cows)" icon="🗑️" value={d("1_eliminate")} onChange={v => u("1_eliminate", v)} placeholder="What industry standard will you remove?" example="Eliminate: expensive research agencies, 3-month research timelines, 50-page reports nobody reads." tip="If you can't eliminate anything, you're building an incrementally better version — that's a feature, not a venture." color={P.danger} />
            <SmartField label="CREATE (new value)" icon="✨" value={d("1_create")} onChange={v => u("1_create", v)} placeholder="What entirely new value do you introduce?" example="Create: real-time validation scoring, AI mentor that challenges assumptions, benchmark data from 50K experiments." tip="What does the world get from you that it doesn't have today?" color={P.accent5} />
          </div>
        </div>

        {/* Pain/Barrier Pyramid */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔺</span> Pain/Barrier Pyramid — Where Do You Enter?
          </div>
          <SmartField label="Entry Strategy" icon="🚪" type="select" options={[
            "Level 5 — Customer has budget allocated (high barrier, high intent)",
            "Level 4 — Customer assembled DIY solution (hard entry, strong pain)",
            "Level 3 — Actively looking for solutions (normal entry, long sales)",
            "Level 2 — Aware of problem, not yet shopping (easy entry, education needed)",
            "Level 1 — Has problem, not aware of it (easiest entry, must create awareness)"
          ]} value={d("1_entry")} onChange={v => u("1_entry", v)} placeholder="Select your entry level..." color={P.accent3} />
          <div style={{ marginTop: 10 }} />
          <SmartField label="Target Segments (2-3 specific)" icon="👥" value={d("1_segments")} onChange={v => u("1_segments", v)} placeholder="Segment 1: [who, size, need, willingness to pay]\nSegment 2: ..." example="Segment 1: Head of Product at 30-100 person B2B SaaS (est. 12,000 in US). Budget: $500-2K/mo. Pain: shipping features that don't move metrics.\nSegment 2: Solo founders pre-PMF (est. 50,000 active). Budget: $0-100/mo. Pain: burning cash on wrong features." color={P.accent3} />
        </div>
      </div>
    ),
    assessment: ["I have data-backed market timing evidence", "My positioning statement is specific and tested", "I've identified the pain/barrier level for my entry", "I have 2+ quantified target segments"],
  },

  // ─── STAGE 2: CUSTOMER–PROBLEM FIT ───
  {
    id: 2, title: "Customer–Problem", icon: "🎯", color: P.accent2, xpPerField: 30,
    desc: "Get obsessively close to your customer. Don't assume the pain — PROVE it.",
    render: (d, u, c) => (
      <div>
        {/* Value Proposition Canvas — matching the PDF layout: square (left) + circle (right) */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>💎</span> Value Proposition Canvas
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* LEFT: Value Map (square) */}
            <div style={{ border: `2px solid ${P.accent2}40`, borderRadius: 12, padding: 16, background: P.accent2+"06" }}>
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: P.accent2, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Your Value Map</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <SmartField label="Products & Services" icon="📦" value={d("2_products")} onChange={v => u("2_products", v)} placeholder="What are you offering? Be specific." example="Self-serve experiment platform: (1) Structured validation templates, (2) AI coaching bot, (3) Benchmark database." color={P.accent2} />
                <SmartField label="Gain Creators" icon="📈" value={d("2_gainCreators")} onChange={v => u("2_gainCreators", v)} placeholder="How does each feature deliver a specific gain?" example="Template system → PMs run experiments 5x faster. AI coach → catches blind spots humans miss. Benchmarks → teams know if their metrics are good or bad." color={P.accent5} />
                <SmartField label="Pain Relievers" icon="💊" value={d("2_painRelievers")} onChange={v => u("2_painRelievers", v)} placeholder="How does each feature reduce a specific pain?" example="Template system → eliminates blank-page paralysis. AI coach → replaces expensive consultants ($5K/engagement). Benchmarks → stops internal debates about what 'good' looks like." color={P.accent6} />
              </div>
            </div>
            {/* RIGHT: Customer Profile (circle shape via rounded border) */}
            <div style={{ border: `2px solid ${P.accent1}40`, borderRadius: 100, padding: 20, background: P.accent1+"06", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: P.accent1, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Customer Profile</div>
              <SmartField label="Customer Jobs" icon="✅" value={d("2_jobs")} onChange={v => u("2_jobs", v)} placeholder="Functional, social, and emotional jobs" example="Functional: validate product ideas before dev. Social: look data-driven to leadership. Emotional: feel confident they're not wasting the team's time." tip="Include ALL three types: what they DO, how they want to be SEEN, how they want to FEEL." color={P.accent1} />
              <SmartField label="Gains (desired outcomes)" icon="😊" value={d("2_gains")} onChange={v => u("2_gains", v)} placeholder="What would delight them?" color={P.accent5} />
              <SmartField label="Pains (quantified!)" icon="😣" value={d("2_pains")} onChange={v => u("2_pains", v)} placeholder="Quantify: $X lost, Y hours wasted, Z% failure rate" example="PMs waste avg 8 hrs/week on inconclusive research. 65% of shipped features don't move target metrics (Pendo 2024). Failed features cost $250K+ in dev time." tip="No numbers = no proof of pain. Quantify in dollars, hours, or percentages." color={P.danger} />
            </div>
          </div>
        </div>

        {/* Empathy Map — matching the 4-quadrant + 2 bottom layout from PDF */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🧠</span> Empathy Map
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <div style={{ background: P.accent4+"10", borderRadius: "12px 4px 4px 4px", padding: 14 }}>
              <SmartField label="Think & Feel" icon="💭" value={d("2_thinks")} onChange={v => u("2_thinks", v)} placeholder="What's really on their mind? Not what they'd tell you in a survey..." example="'Am I wasting my team's time building the wrong thing? My VP keeps asking for data I don't have. Other PMs seem to have it figured out.'" color={P.accent4} />
            </div>
            <div style={{ background: P.accent6+"10", borderRadius: "4px 12px 4px 4px", padding: 14 }}>
              <SmartField label="See" icon="👀" value={d("2_sees")} onChange={v => u("2_sees", v)} placeholder="What solutions do they see others using? What's in their environment?" color={P.accent6} />
            </div>
            <div style={{ background: P.accent3+"10", borderRadius: "4px 4px 4px 4px", padding: 14 }}>
              <SmartField label="Hear" icon="👂" value={d("2_hears")} onChange={v => u("2_hears", v)} placeholder="Who influences them? What are peers and leaders saying?" color={P.accent3} />
            </div>
            <div style={{ background: P.accent1+"10", borderRadius: "4px 4px 4px 4px", padding: 14 }}>
              <SmartField label="Say & Do" icon="🗣️" value={d("2_says")} onChange={v => u("2_says", v)} placeholder="What workarounds have they built? What do they tell colleagues?" tip="People in real pain build ugly solutions. No workarounds = maybe not painful enough." color={P.accent1} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: 2 }}>
            <div style={{ background: P.danger+"10", borderRadius: "4px 4px 4px 12px", padding: 14 }}>
              <SmartField label="Pain Points (deep)" icon="😰" value={d("2_deepPains")} onChange={v => u("2_deepPains", v)} placeholder="Beyond surface complaints — the recurring frustration" color={P.danger} />
            </div>
            <div style={{ background: P.accent5+"10", borderRadius: "4px 4px 12px 4px", padding: 14 }}>
              <SmartField label="Goals & Aspirations" icon="⭐" value={d("2_goals")} onChange={v => u("2_goals", v)} placeholder="If perfectly solved, what does their Tuesday morning look like?" color={P.accent5} />
            </div>
          </div>
        </div>

        {/* Persona — structured card */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>👤</span> Primary Persona
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <SmartField label="Name & Role" icon="📛" value={d("2_personaName")} onChange={v => u("2_personaName", v)} placeholder="Maya, 34, Head of Product..." type="short" color={P.accent2} />
            <SmartField label="Company Context" icon="🏢" value={d("2_personaContext")} onChange={v => u("2_personaContext", v)} placeholder="50-person Series A SaaS..." type="short" color={P.accent2} />
            <SmartField label="Budget Authority" icon="💳" value={d("2_personaBudget")} onChange={v => u("2_personaBudget", v)} placeholder="$2K/mo tool budget..." type="short" color={P.accent2} />
          </div>
          <div style={{ marginTop: 12 }}>
            <SmartField label="Verbatim Customer Quote" icon="💬" value={d("2_quote")} onChange={v => u("2_quote", v)} placeholder="An actual sentence from a real interview..." example="\"I spend half my week in spreadsheets trying to figure out if we should build Feature A or B, and I still end up guessing.\"" tip="If you don't have a real quote, go talk to 5 more people this week." color={P.accent2} />
            {(!d("2_quote") || d("2_quote").length < 10) && <FailureCallout triggerId="no_customer_quotes" />}
          </div>
          <div style={{ marginTop: 12 }}>
            <SmartField label="Customer Interviews Done" icon="🎙️" type="select" options={["0 — Haven't started", "1-4 — Just beginning", "5-9 — Getting there", "10-19 — Solid foundation", "20+ — Deep understanding"]} value={d("2_interviews")} onChange={v => u("2_interviews", v)} color={P.accent2} />
            <BenchmarkCallout id="customer_interviews" />
          </div>
        </div>
      </div>
    ),
    assessment: ["I've interviewed 10+ potential customers", "I can quantify the #1 pain in dollars or hours", "I have verbatim quotes from real interviews", "My Value Proposition Canvas has no blank sections"],
  },

  // ─── STAGE 3: PROBLEM–SOLUTION FIT ───
  {
    id: 3, title: "Problem–Solution", icon: "🧩", color: P.accent1, xpPerField: 30,
    desc: "Design the simplest test of your riskiest assumption. Less is more.",
    render: (d, u, c) => (
      <div>
        {/* Hook Model — circular 4-quadrant matching PDF */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🪝</span> Hook Model — Will They Come Back?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {[
              { id: "trigger", label: "1. Trigger (internal!)", icon: "⚡", color: P.accent1, placeholder: "What EMOTION drives usage?", tip: "Not 'push notification' — what FEELING precedes opening your product?", example: "Internal: anxiety about shipping the wrong feature. External bridge: Slack reminder 'Your experiment results are ready'." },
              { id: "action", label: "2. Action (simplest)", icon: "👆", color: P.accent6, placeholder: "Fewest possible clicks to value", tip: "Count literal taps from trigger to reward. If >3, simplify.", example: "Open app → see experiment dashboard with red/green indicators → click into failing experiment for details. (3 clicks)" },
              { id: "investment", label: "4. Investment", icon: "🔒", color: P.accent3, placeholder: "What do they put in that makes it better?", tip: "Data, content, preferences, social capital", example: "Each experiment adds to their benchmark dataset. After 10 experiments, their predictions get 40% more accurate." },
              { id: "reward", label: "3. Variable Reward", icon: "🎁", color: P.accent5, placeholder: "What reward varies each time?", tip: "Tribe (social), Hunt (information), or Self (mastery)?", example: "Hunt: each experiment reveals unexpected insights ('users prefer X over Y — 73% confidence'). Self: validation score improves as they learn." },
            ].map((f, i) => (
              <div key={f.id} style={{ background: f.color+"08", border: `1px solid ${f.color}20`, borderRadius: i===0?"12px 4px 4px 4px":i===1?"4px 12px 4px 4px":i===2?"4px 4px 4px 12px":"4px 4px 12px 4px", padding: 14 }}>
                <SmartField {...f} value={d(`3_${f.id}`)} onChange={v => u(`3_${f.id}`, v)} color={f.color} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: P.textDim }}>↻ Loop: Trigger → Action → Reward → Investment → back to Trigger</div>
        </div>

        {/* Less is More: MVP Scope — progressive fidelity matching PDF */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>✂️</span> Less is More — MVP Scope
          </div>
          <div style={{ fontSize: 11, color: P.textDim, marginBottom: 14 }}>Prototype progression: BH Prototype → Whiteboard → Dummy → MVP. You're scoping the MVP.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SmartField label="ONE Core Problem" icon="🎯" value={d("3_core")} onChange={v => u("3_core", v)} placeholder="Single problem. No 'and'." tip="If you need the word 'and', you're doing too much." type="short" color={P.accent1} />
            <SmartField label="Riskiest Assumption" icon="💣" value={d("3_riskiest")} onChange={v => u("3_riskiest", v)} placeholder="If THIS is wrong, nothing else matters" type="short" color={P.danger} />
            <SmartField label="Must Have (MAX 3 features)" icon="✅" value={d("3_mustHave")} onChange={v => u("3_mustHave", v)} placeholder="1. ...\n2. ...\n3. ..." tip="More than 3 = not minimal. Cut until it hurts." color={P.accent5} />
            <SmartField label="NOT Building (should be longer!)" icon="🚫" value={d("3_notNow")} onChange={v => u("3_notNow", v)} placeholder="Explicitly excluded..." tip="This list should be LONGER than must-haves. Every 'no' sharpens your MVP." color={P.textDim} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <SmartField label="Success Metric" icon="✅" value={d("3_successMetric")} onChange={v => u("3_successMetric", v)} placeholder="Success if [metric] > [X]" type="short" color={P.accent5} />
            <SmartField label="Kill Metric" icon="☠️" value={d("3_killMetric")} onChange={v => u("3_killMetric", v)} placeholder="KILL if [metric] < [Y]" tip="Pre-commit to when you stop. No kill metric = zombie startup." type="short" color={P.danger} />
          </div>
          <div style={{ marginTop: 12 }}>
            <SmartField label="Ship Date" icon="🚀" type="select" options={["1-2 weeks", "2-4 weeks", "4-6 weeks", "6-8 weeks", "8+ weeks (too long!)"]} value={d("3_timeline")} onChange={v => u("3_timeline", v)} color={P.accent1} />
            <BenchmarkCallout id="mvp_features" />
            {d("3_mustHave") && d("3_mustHave").split("\n").filter(s=>s.trim()).length > 3 && <FailureCallout triggerId="mvp_too_big" />}
          </div>
        </div>
      </div>
    ),
    assessment: ["My MVP tests ONE assumption with ≤3 features", "I have pre-committed kill metrics", "My 'not building' list is longer than my feature list", "I can ship in ≤4 weeks"],
  },

  // ─── STAGE 4: VALIDATION ───
  {
    id: 4, title: "Validation", icon: "✅", color: P.accent5, xpPerField: 35,
    desc: "The business model math — does it actually work?",
    render: (d, u, c) => (
      <div>
        {/* Business Model Canvas — 9-block grid matching PDF exactly */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏗️</span> Business Model Canvas
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1fr 1fr", gridTemplateRows: "auto auto auto", gap: 2 }}>
            <div style={{ gridRow: "1/3", background: P.accent3+"08", borderRadius: "12px 4px 4px 4px", padding: 12, border: `1px solid ${P.accent3}15` }}>
              <SmartField label="Key Partners" icon="🤝" value={d("4_partners")} onChange={v => u("4_partners", v)} placeholder="Who do you need?" color={P.accent3} />
            </div>
            <div style={{ background: P.accent4+"08", borderRadius: "4px", padding: 12, border: `1px solid ${P.accent4}15` }}>
              <SmartField label="Key Activities" icon="⚙️" value={d("4_activities")} onChange={v => u("4_activities", v)} placeholder="Critical activities" color={P.accent4} />
            </div>
            <div style={{ gridRow: "1/3", background: P.accent2+"08", borderRadius: "4px", padding: 12, border: `1px solid ${P.accent2}15` }}>
              <SmartField label="Value Propositions" icon="💎" value={d("4_value")} onChange={v => u("4_value", v)} placeholder="Why do they pay YOU?" color={P.accent2} />
            </div>
            <div style={{ background: P.accent1+"08", borderRadius: "4px", padding: 12, border: `1px solid ${P.accent1}15` }}>
              <SmartField label="Customer Relationships" icon="💬" value={d("4_relationships")} onChange={v => u("4_relationships", v)} placeholder="Self-serve? High-touch?" color={P.accent1} />
            </div>
            <div style={{ gridRow: "1/3", background: P.accent6+"08", borderRadius: "4px 12px 4px 4px", padding: 12, border: `1px solid ${P.accent6}15` }}>
              <SmartField label="Customer Segments" icon="👥" value={d("4_segments")} onChange={v => u("4_segments", v)} placeholder="Who PAYS? (not just uses)" color={P.accent6} />
            </div>
            <div style={{ background: P.accent4+"08", borderRadius: "4px", padding: 12, border: `1px solid ${P.accent4}15` }}>
              <SmartField label="Key Resources" icon="🔧" value={d("4_resources")} onChange={v => u("4_resources", v)} placeholder="Hard-to-get resources" color={P.accent4} />
            </div>
            <div style={{ background: P.accent1+"08", borderRadius: "4px", padding: 12, border: `1px solid ${P.accent1}15` }}>
              <SmartField label="Channels" icon="📣" value={d("4_channels")} onChange={v => u("4_channels", v)} placeholder="How do you reach them?" color={P.accent1} />
            </div>
            <div style={{ gridColumn: "1/3", background: P.danger+"08", borderRadius: "4px 4px 4px 12px", padding: 12, border: `1px solid ${P.danger}15` }}>
              <SmartField label="Cost Structure" icon="💸" value={d("4_costs")} onChange={v => u("4_costs", v)} placeholder="Top 5 costs with $ amounts" tip="No numbers = no model. Estimate everything." color={P.danger} />
            </div>
            <div style={{ gridColumn: "3/6", background: P.accent5+"08", borderRadius: "4px 4px 12px 4px", padding: 12, border: `1px solid ${P.accent5}15` }}>
              <SmartField label="Revenue Streams" icon="💰" value={d("4_revenue")} onChange={v => u("4_revenue", v)} placeholder="$X per [unit] per [period]. Specific numbers." example="$99/mo per team (up to 10 users). Estimated avg contract: $1,188/yr. Expansion to $199/mo at 50+ users." color={P.accent5} />
              {d("4_revenue") && !/\$|\d/.test(d("4_revenue")) && <FailureCallout triggerId="vanity_metrics" />}
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🧮</span> Unit Economics — Does the Math Work?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <SmartField label="CAC (Cost to Acquire)" icon="📊" value={d("4_cac")} onChange={v => u("4_cac", v)} placeholder="$X per customer" example="$150 CAC via content marketing ($3K/mo spend ÷ 20 signups)." type="short" color={P.warning} />
            <SmartField label="LTV (Lifetime Value)" icon="💎" value={d("4_ltv")} onChange={v => u("4_ltv", v)} placeholder="$X/mo × Y months" example="$99/mo × 18 months avg retention = $1,782 LTV." type="short" color={P.accent5} />
            <SmartField label="LTV:CAC Ratio" icon="⚖️" value={d("4_ratio")} onChange={v => u("4_ratio", v)} placeholder="Target: ≥ 3:1" type="short" color={d("4_ratio") && parseFloat(d("4_ratio")) >= 3 ? P.accent5 : P.danger} />
          </div>
          <BenchmarkCallout id="ltv_cac" />
        </div>
      </div>
    ),
    assessment: ["Business Model Canvas has no blank sections", "I have specific pricing with real numbers", "My LTV:CAC ratio is ≥3:1 (or plan to get there)", "I've identified my primary acquisition channel"],
  },

  // ─── STAGE 5: PMF ───
  {
    id: 5, title: "Product–Market Fit", icon: "🚀", color: P.accent6, xpPerField: 35,
    desc: "PMF is measurable. Face the data — is the market pulling, or are you pushing?",
    render: (d, u, c) => (
      <div>
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🔬 PMF Measurement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SmartField label="Sean Ellis Score" icon="📊" value={d("5_pmfScore")} onChange={v => u("5_pmfScore", v)} placeholder="X% 'very disappointed'" tip="Ask: 'How would you feel if you could no longer use [product]?' 40%+ = PMF." type="short" color={P.accent6} />
            <SmartField label="Retention Curve" icon="📉" type="select" options={["Flattening (good — users stick)", "Slowly declining (warning)", "Steep decline to near-zero (no PMF)", "Don't have retention data yet"]} value={d("5_retention")} onChange={v => u("5_retention", v)} color={P.accent6} />
            <SmartField label="Organic Growth %" icon="🌱" value={d("5_organic")} onChange={v => u("5_organic", v)} placeholder="X% of new users come organically" type="short" color={P.accent5} />
            <SmartField label="PMF Verdict" icon="⚖️" type="select" options={["Pre-PMF — still searching", "Approaching — some signals", "Achieved — strong pull from market"]} value={d("5_verdict")} onChange={v => u("5_verdict", v)} color={P.accent6} />
          </div>
          <BenchmarkCallout id="pmf_score" />
        </div>

        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🛡️ Competitive Moat</div>
          <SmartField label="Real Competitors (3-5)" icon="⚔️" value={d("5_competitors")} onChange={v => u("5_competitors", v)} placeholder="Include: direct, indirect, and 'doing nothing'" example="1. Maze (direct — user testing). 2. UserTesting.com (indirect — traditional research). 3. Internal spreadsheets + Slack polls (DIY). 4. Doing nothing — shipping based on intuition." color={P.accent6} />
          {d("5_competitors") && /none|no comp/i.test(d("5_competitors")) && <FailureCallout triggerId="no_competitors" />}
          <div style={{ marginTop: 12 }}>
            <SmartField label="Your Structural Moat" icon="🏰" type="chips" options={["Proprietary Data", "Network Effects", "Switching Costs", "Brand/Trust", "Patents/IP", "Economies of Scale", "Regulatory", "Exclusive Partnerships"]} value={d("5_moatType")} onChange={v => u("5_moatType", v)} color={P.accent6} />
            {d("5_moatType") && !d("5_moatType") && <FailureCallout triggerId="no_moat" />}
          </div>
          <div style={{ marginTop: 12 }}>
            <SmartField label="Moat Details" icon="📝" value={d("5_moat")} onChange={v => u("5_moat", v)} placeholder="Specifically how your moat works..." color={P.accent6} />
          </div>
        </div>
      </div>
    ),
    assessment: ["I have PMF survey data from real users", "My retention curve shape is known", "I can name structural moats (not just 'better product')", "I've honestly assessed my PMF status"],
  },

  // ─── STAGE 6: GO-TO-MARKET ───
  {
    id: 6, title: "Go-to-Market", icon: "📈", color: "#0ea5e9", xpPerField: 30,
    desc: "Your plan to win the first market in 90 days.",
    render: (d, u, c) => (
      <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🎯 90-Day Go-to-Market Plan</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <SmartField label="Beachhead (first 100 customers)" icon="🏖️" value={d("6_beachhead")} onChange={v => u("6_beachhead", v)} placeholder="THE specific niche to dominate first" example="Head of Product at 30-100 person B2B SaaS companies in the US that have raised Series A in the last 12 months." color="#0ea5e9" />
          <SmartField label="ONE Acquisition Channel" icon="📣" value={d("6_channel")} onChange={v => u("6_channel", v)} placeholder="ONE channel. Not 5." tip="Master one before adding another." example="Content marketing via LinkedIn: weekly teardowns of failed product launches, driving traffic to free validation template." color="#0ea5e9" />
          <div style={{ gridColumn: "1/-1" }}>
            <SmartField label="Positioning Statement" icon="📝" value={d("6_message")} onChange={v => u("6_message", v)} placeholder="[Product] helps [who] [do what] by [how], unlike [alternative] which [limitation]." color="#0ea5e9" />
          </div>
          <SmartField label="Pricing (tested)" icon="💰" value={d("6_pricing")} onChange={v => u("6_pricing", v)} placeholder="$X per Y — tested with real customers" color="#0ea5e9" />
          <SmartField label="Pricing Test Evidence" icon="🧪" value={d("6_pricingTest")} onChange={v => u("6_pricingTest", v)} placeholder="What did customers say?" type="short" color="#0ea5e9" />
        </div>
        <div style={{ marginTop: 14 }}>
          <SmartField label="90-Day Milestones (3 specific)" icon="🏁" value={d("6_milestones")} onChange={v => u("6_milestones", v)} placeholder="30 days: ...\n60 days: ...\n90 days: ..." example="30 days: 500 email signups from landing page, 20 demo calls.\n60 days: 10 paying customers, $990 MRR, NPS >40.\n90 days: 30 paying customers, 3 case studies, $2,970 MRR." color="#0ea5e9" />
        </div>
      </div>
    ),
    assessment: ["I know my first 100 customers specifically", "I have ONE tested primary channel", "My 90-day milestones are specific and measurable", "I've tested pricing with real customers"],
  },

  // ─── STAGE 7: PROCESS ENGINE ───
  {
    id: 7, title: "Process Engine", icon: "🔄", color: "#14b8a6", xpPerField: 25,
    desc: "Build repeatable experiment systems. No more heroic sprints.",
    render: (d, u, c) => (
      <div>
        {/* Experiment Plan/Report — matching PDF: left = plan, right = results */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🧪 Experiment Plan & Report</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14b8a6", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📋 Plan</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SmartField label="Hypothesis" icon="🔬" value={d("7_hypothesis")} onChange={v => u("7_hypothesis", v)} placeholder="We believe [action] will cause [result] for [audience] within [time]" tip="Must be falsifiable and time-bound." color="#14b8a6" />
                <SmartField label="Success Criteria" icon="✅" value={d("7_success")} onChange={v => u("7_success", v)} placeholder="Success if [metric] > [X]" type="short" color={P.accent5} />
                <SmartField label="Kill Criteria" icon="☠️" value={d("7_kill")} onChange={v => u("7_kill", v)} placeholder="KILL if [metric] < [Y]" type="short" color={P.danger} />
                <SmartField label="Duration" icon="⏱️" type="select" options={["1 week", "2 weeks", "3 weeks", "4 weeks", "4+ weeks (too long?)"]} value={d("7_duration")} onChange={v => u("7_duration", v)} color="#14b8a6" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.accent1, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📊 Results</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SmartField label="Result Data" icon="📈" value={d("7_results")} onChange={v => u("7_results", v)} placeholder="What happened? Enter the data." color={P.accent1} />
                <SmartField label="Verdict" icon="⚖️" type="select" options={["✅ VALIDATED — hypothesis confirmed", "❌ INVALIDATED — hypothesis rejected", "🔄 INCONCLUSIVE — need more data", "⏳ Not yet run"]} value={d("7_verdict")} onChange={v => u("7_verdict", v)} color={P.accent1} />
                <SmartField label="Key Learning" icon="💡" value={d("7_learning")} onChange={v => u("7_learning", v)} placeholder="What did you learn? What changes?" type="short" color={P.xp} />
                <SmartField label="Next Experiment" icon="➡️" value={d("7_next")} onChange={v => u("7_next", v)} placeholder="Based on this, what do you test next?" type="short" color="#14b8a6" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 OMTM & Weekly Review</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SmartField label="OMTM (One Metric That Matters)" icon="🎯" value={d("7_omtm")} onChange={v => u("7_omtm", v)} placeholder="[Metric]: current [X] → target [Y]" type="short" color="#14b8a6" />
            <SmartField label="Review Cadence" icon="📅" type="select" options={["Daily standup", "Weekly review (recommended)", "Bi-weekly sprint review", "Monthly review", "No regular cadence yet"]} value={d("7_cadence")} onChange={v => u("7_cadence", v)} color="#14b8a6" />
          </div>
        </div>
      </div>
    ),
    assessment: ["I run structured experiments with kill criteria", "I have a weekly review cadence", "I know my OMTM and it's trending right", "I have an experiment pipeline"],
  },

  // ─── STAGE 8: ANALYTICS ───
  {
    id: 8, title: "Analytics", icon: "📊", color: P.accent4, xpPerField: 25,
    desc: "Turn data into decisions. Build the intelligence layer.",
    render: (d, u, c) => (
      <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Analytics Maturity Assessment</div>
        <SmartField label="Current Maturity Level" icon="📈" type="select" options={["Level 0 — No tracking at all", "Level 1 — Basic (Google Analytics / page views)", "Level 2 — Custom events tracked", "Level 3 — Full funnel analytics", "Level 4 — Predictive / cohort analysis"]} value={d("8_maturity")} onChange={v => u("8_maturity", v)} color={P.accent4} />
        <div style={{ marginTop: 12 }} />
        <SmartField label="What You Currently Track" icon="📋" value={d("8_tracking")} onChange={v => u("8_tracking", v)} placeholder="List every metric and event..." tip="The honest list reveals your true maturity. Don't embellish." color={P.accent4} />
        <div style={{ marginTop: 12 }}>
          <SmartField label="Data-Driven Decision Example" icon="🧠" value={d("8_decision")} onChange={v => u("8_decision", v)} placeholder="We saw [data], decided [action], result was [outcome]" tip="If you can't cite one, you're data-aware but not data-driven." example="We saw that 60% of users dropped off at the template selection screen (Mixpanel funnel), so we added a 'recommended for you' section based on their industry. Drop-off decreased to 35%." color={P.accent4} />
        </div>
        <div style={{ marginTop: 12 }}>
          <SmartField label="Top 3 Blind Spots" icon="🔍" value={d("8_blindSpots")} onChange={v => u("8_blindSpots", v)} placeholder="Critical questions you CAN'T answer with current data" color={P.danger} />
        </div>
        <div style={{ marginTop: 12 }}>
          <SmartField label="Data as Competitive Advantage" icon="🏰" value={d("8_dataAdvantage")} onChange={v => u("8_dataAdvantage", v)} placeholder="How does your data become a moat over time?" tip="Not all products have data moats — be honest if yours doesn't." color={P.accent4} />
        </div>
      </div>
    ),
    assessment: ["I can answer my top 3 business questions with data", "I have a data-driven decision example", "I know my analytics blind spots", "I have a plan for building data capability"],
  },
];

// ─── CROSS-VALIDATION ───
function runXVal(data) {
  const g = (k) => data[k] || "";
  const checks = [
    () => { const a = g("0_advantage"); if (a && /team|passion|hustle|first.?mover/i.test(a)) return { sev:"critical", title:"Not a real moat", msg:"Team/passion/first-mover are not defensible.", fix:"Name a structural advantage." }; },
    () => { const m = g("3_mustHave"); if (m && m.split("\n").filter(s=>s.trim()).length > 3) return { sev:"critical", title:"MVP too big", msg:`${m.split("\n").filter(s=>s.trim()).length} must-haves is not minimal.`, fix:"Cut to ≤3." }; },
    () => { const c = g("5_competitors"); if (c && /none|no comp/i.test(c)) return { sev:"critical", title:"'No competitors' = red flag", msg:"If nobody solves this, maybe it doesn't need solving.", fix:"List alternatives including 'doing nothing'." }; },
    () => { const r = g("4_revenue"); if (r && !/\$|\d/.test(r)) return { sev:"high", title:"No pricing numbers", msg:"Revenue section has no numbers.", fix:"Add: $X per unit per period." }; },
    () => { const p = g("5_pmfScore"); if (p && p.match(/(\d+)/) && parseInt(p.match(/(\d+)/)[1]) < 40) return { sev:"critical", title:"Below PMF threshold", msg:`${p.match(/(\d+)/)[1]}% < 40%. Iterate, don't scale.`, fix:"Talk to 'very disappointed' users. Build for them." }; },
    () => { const q = g("2_quote"); if (!q || q.length < 10) return { sev:"high", title:"No customer quotes", msg:"No verbatim quotes suggests desk research, not real conversations.", fix:"Interview 5+ customers this week." }; },
    () => { const t = g("3_timeline"); if (t && /8\+|too long/i.test(t)) return { sev:"high", title:"MVP timeline too long", msg:"8+ weeks is not an MVP.", fix:"Cut scope until ≤4 weeks." }; },
    () => { const ch = g("6_channel"); if (ch && /,|and|multiple/i.test(ch)) return { sev:"high", title:"Too many channels", msg:"Pick ONE channel. Master it first.", fix:"Choose highest-ROI channel." }; },
  ];
  return checks.map(c => c()).filter(Boolean);
}

// ─── VALIDATION CHECKS (10) ───
const VAL_CHECKS = [
  { id:"market", label:"Market validated", cat:"market", check:d => (d["1_stage"]||"").length > 5 ? {st:"pass",m:"Market stage defined"} : {st:"none",m:"Not started"} },
  { id:"timing", label:"Timing evidence", cat:"market", check:d => (d["1_drivers"]||"").length > 60 ? {st:"pass",m:"Strong timing"} : (d["1_drivers"]||"").length > 0 ? {st:"weak",m:"Needs more"} : {st:"none",m:"—"} },
  { id:"customer", label:"Customer validated", cat:"customer", check:d => (d["2_quote"]||"").length > 20 ? {st:"pass",m:"Customer voice"} : {st:"none",m:"—"} },
  { id:"problem", label:"Problem quantified", cat:"customer", check:d => /\$|\d|hour|week/i.test(d["2_pains"]||"") ? {st:"pass",m:"Pain quantified"} : {st:"none",m:"—"} },
  { id:"solution", label:"MVP scoped", cat:"solution", check:d => (d["3_mustHave"]||"").length > 10 && (d["3_killMetric"]||"").length > 5 ? {st:"pass",m:"MVP+kill defined"} : {st:"none",m:"—"} },
  { id:"bizmodel", label:"Business model", cat:"business", check:d => /\$|\d/.test(d["4_revenue"]||"") ? {st:"pass",m:"Revenue defined"} : {st:"none",m:"—"} },
  { id:"pmf", label:"PMF evidence", cat:"solution", check:d => { const s=d["5_pmfScore"]||""; return s.match(/(\d+)/) && parseInt(s.match(/(\d+)/)[1])>=40 ? {st:"pass",m:"PMF met"} : s ? {st:"weak",m:"Below 40%"} : {st:"none",m:"—"}; }},
  { id:"competition", label:"Competition mapped", cat:"market", check:d => (d["5_competitors"]||"").length > 20 && !/none|no comp/i.test(d["5_competitors"]||"") ? {st:"pass",m:"Mapped"} : {st:"none",m:"—"} },
  { id:"gtm", label:"Go-to-market", cat:"business", check:d => (d["6_channel"]||"").length > 10 ? {st:"pass",m:"Channel set"} : {st:"none",m:"—"} },
  { id:"process", label:"Experiment system", cat:"execution", check:d => (d["7_hypothesis"]||"").length > 20 ? {st:"pass",m:"Hypothesis defined"} : {st:"none",m:"—"} },
];

// ─── NETWORK ───
const PROFILES = [
  { name:"Sarah Chen", role:"Venture Builder", loc:"Singapore", av:"SC", tags:["PMF","Asia","SaaS"], bio:"Built 3 B2B SaaS to $1M ARR." },
  { name:"Marcus Rivera", role:"Angel Investor", loc:"Austin, TX", av:"MR", tags:["Seed","Marketplace"], bio:"25+ seed investments." },
  { name:"Priya Sharma", role:"Product Leader", loc:"Bangalore", av:"PS", tags:["Product","Enterprise"], bio:"VP Product at unicorn." },
  { name:"Aisha Hassan", role:"Venture Builder", loc:"Dubai", av:"AH", tags:["MENA","E-commerce"], bio:"2 ventures in MENA." },
  { name:"Wei Zhang", role:"Tech Cofounder", loc:"San Francisco", av:"WZ", tags:["AI","ML"], bio:"Ex-Google ML. Seeking cofounder." },
  { name:"Fatima Al-Sayed", role:"UX Research", loc:"Riyadh", av:"FA", tags:["UX","Discovery"], bio:"Customer discovery expert." },
];

// ─── SELF ASSESSMENT ───
function Assessment({ stage, scores, setScores, onComplete, xp, isLast }) {
  const items = stage.assessment;
  const getS = i => scores[`${stage.id}_a${i}`] || 1;
  const avg = items.reduce((s,_,i) => s + getS(i), 0) / items.length;
  const pct = ((avg-1)/4)*100;
  const ready = avg >= 3.5;
  const labels = ["","Not at all","Slightly","Somewhat","Mostly","Completely"];
  return (
    <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24, marginTop: 32 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Ready to advance?</div>
      {items.map((q,i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{q}</div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <input type="range" min={1} max={5} value={getS(i)} onChange={e => setScores(p => ({...p,[`${stage.id}_a${i}`]:parseInt(e.target.value)}))} style={{ flex:1, accentColor: P.accent1 }} />
            <span style={{ fontSize:11, color: P.textDim, minWidth:72, textAlign:"right" }}>{labels[getS(i)]}</span>
          </div>
        </div>
      ))}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16 }}>
        <div>
          <div style={{ fontSize:12, color: P.textMuted, fontWeight:600 }}>Readiness: {Math.round(pct)}%</div>
          <div style={{ width:200, height:6, borderRadius:3, background: P.border, marginTop:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background: ready ? P.success : P.warning, borderRadius:3, transition:"width 0.5s" }} />
          </div>
        </div>
        <div style={{ fontSize:12, color: P.xp, fontWeight:700 }}>+{xp} XP</div>
      </div>
      {ready && <button onClick={onComplete} style={{ width:"100%", marginTop:20, padding:14, borderRadius:12, background: isLast ? `linear-gradient(135deg,${P.accent5},#059669)` : P.gradient, border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(249,115,22,0.3)" }}>{isLast ? "🎉 Complete Journey" : "Unlock Next Stage →"}</button>}
      {!ready && <div style={{ marginTop:14, fontSize:12, color: P.textDim, lineHeight:1.5 }}>Score 70%+ to advance.</div>}
    </div>
  );
}

// ─── MAIN APP ───
export default function VenturePath() {
  const [cur, setCur] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [scores, setScores] = useState({});
  const [tab, setTab] = useState("build");
  const [data, setData] = useState({});
  const [xp, setXp] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState(null);
  const xpRef = useRef({});

  const update = useCallback((key, val) => {
    setData(p => {
      if (val.length >= 30 && (p[key]||"").length < 30 && !xpRef.current[key]) {
        xpRef.current[key] = true;
        const sid = parseInt(key.split("_")[0]);
        const earned = STAGES[sid]?.xpPerField || 20;
        setXp(x => x + earned);
        setToast(`+${earned} XP`);
        setTimeout(() => setToast(null), 1500);
      }
      return { ...p, [key]: val };
    });
  }, []);

  const get = useCallback((key) => data[key] || "", [data]);
  const stage = STAGES[cur];
  const isUnlocked = cur <= unlocked;
  const level = getLevel(xp);
  const nextLvl = getNextLevel(xp);
  const lvlPct = nextLvl ? ((xp - level.xp) / (nextLvl.xp - level.xp)) * 100 : 100;
  const valResults = VAL_CHECKS.map(vc => ({ ...vc, result: vc.check(data) }));
  const scoreMap = { pass:100, weak:50, none:0 };
  const ventureHealth = Math.round(valResults.reduce((s,v) => s + scoreMap[v.result.st], 0) / valResults.length);
  const challenges = runXVal(data);
  const stageFieldCount = stage.render ? Object.keys(data).filter(k => k.startsWith(`${stage.id}_`) && data[k].length > 20).length : 0;
  const stageXp = stageFieldCount * stage.xpPerField;

  const handleUnlock = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
    if (unlocked < STAGES.length - 1) {
      setUnlocked(p => Math.max(p, cur + 1));
      setCur(cur + 1);
      setTab("build");
    } else {
      setTab("brief");
    }
  };

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', minHeight:"100vh", background: P.bg, color: P.text, display:"flex" }}>
      <Confetti show={confetti} />
      {toast && <div style={{ position:"fixed", top:24, right:24, background: P.gradient, color:"#fff", padding:"10px 20px", borderRadius:12, fontSize:16, fontWeight:800, zIndex:9999, animation:"fadeIn 0.3s", boxShadow:"0 4px 20px rgba(249,115,22,0.4)" }}>{toast}</div>}

      {/* SIDEBAR */}
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:280, background: P.bgSurface, borderRight:`1px solid ${P.border}`, display:"flex", flexDirection:"column", zIndex:100, overflowY:"auto" }}>
        <div style={{ padding:"24px 20px 16px" }}>
          <div style={{ fontSize:22, fontWeight:800, background: P.gradient, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VenturePath</div>
          <div style={{ fontSize:10, color: P.textDim, letterSpacing:2, fontWeight:700, textTransform:"uppercase", marginTop:2 }}>VALIDATE · CHALLENGE · BUILD</div>
        </div>

        <div style={{ margin:"0 16px 12px", padding:14, background: P.bgCard, borderRadius:12, border:`1px solid ${P.border}`, display:"flex", alignItems:"center", gap:12 }}>
          <Ring pct={lvlPct} size={44} stroke={4} color={level.color}><span style={{ fontSize:16 }}>{level.icon}</span></Ring>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color: level.color }}>Lv{level.level} {level.name}</div>
            <div style={{ fontSize:10, color: P.textDim }}>{xp} XP</div>
          </div>
        </div>

        <div style={{ margin:"0 16px 12px", padding:12, background: P.bgCard, borderRadius:12, border:`1px solid ${P.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, fontWeight:700, color: P.textDim, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Venture Health</div>
          <Ring pct={ventureHealth} size={52} stroke={4} color={ventureHealth>=70?P.success:ventureHealth>=40?P.warning:P.danger}>
            <span style={{ fontSize:14, fontWeight:800, color: ventureHealth>=70?P.success:ventureHealth>=40?P.warning:P.danger }}>{ventureHealth}</span>
          </Ring>
        </div>

        <div style={{ flex:1, padding:"4px 0" }}>
          {STAGES.map(st => {
            const ul = st.id <= unlocked, done = st.id < unlocked, active = cur === st.id;
            return <div key={st.id} onClick={() => { if(ul){setCur(st.id);setTab("build");} }} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", cursor:ul?"pointer":"default", background:active?`${st.color}12`:"transparent", borderLeft:active?`3px solid ${st.color}`:"3px solid transparent", opacity:ul?1:0.3, transition:"all 0.15s" }}>
              <div style={{ width:30, height:30, borderRadius:8, background:done?`${st.color}25`:P.bgCard, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, border:`1px solid ${done?st.color+"40":P.border}` }}>{done?"✓":ul?st.icon:"🔒"}</div>
              <div><div style={{ fontSize:12, fontWeight:600 }}>{st.title}</div><div style={{ fontSize:10, color: P.textDim }}>{done?"Done":ul?"In progress":"Locked"}</div></div>
            </div>;
          })}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft:280, flex:1, minHeight:"100vh" }}>
        <div style={{ display:"flex", borderBottom:`1px solid ${P.border}`, background: P.bgSurface, position:"sticky", top:0, zIndex:50 }}>
          {[
            { id:"build", label:`${stage.icon} Build` },
            { id:"challenges", label:`⚡ Issues${challenges.length?` (${challenges.length})`:""}`},
            { id:"health", label:"🔬 Health" },
            { id:"network", label:"🌐 Network" },
            { id:"brief", label:"📄 Brief" },
          ].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"14px 18px", fontSize:12, fontWeight:600, color:tab===t.id?P.accent1:P.textDim, background:"transparent", borderTop:"none", borderLeft:"none", borderRight:"none", borderBottom:tab===t.id?`2px solid ${P.accent1}`:"2px solid transparent", cursor:"pointer", whiteSpace:"nowrap" }}>{t.label}</button>)}
        </div>

        <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 40px 100px" }}>
          {tab === "build" && isUnlocked && (
            <div>
              <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:`${stage.color}20`, color:stage.color, fontSize:11, fontWeight:700, marginBottom:12, letterSpacing:0.5 }}>STAGE {stage.id}</div>
              <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4, letterSpacing:-0.5 }}>{stage.icon} {stage.title}</h1>
              <p style={{ fontSize:14, color: P.textMuted, lineHeight:1.6, marginBottom:28, maxWidth:560 }}>{stage.desc}</p>
              {stage.render(get, update, challenges)}
              <Assessment stage={stage} scores={scores} setScores={setScores} onComplete={handleUnlock} xp={stageXp} isLast={cur===STAGES.length-1} />
            </div>
          )}
          {tab === "build" && !isUnlocked && (
            <div style={{ textAlign:"center", padding:"80px 40px" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
              <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>{stage.title}</div>
              <div style={{ fontSize:14, color: P.textMuted }}>Complete Stage {cur-1} to unlock.</div>
            </div>
          )}

          {tab === "challenges" && (
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, marginBottom:16 }}>⚡ Cross-Validation</h1>
              {challenges.length === 0 ? <div style={{ textAlign:"center", padding:48, background: P.bgCard, borderRadius:16, border:`1px solid ${P.border}` }}><div style={{ fontSize:40, marginBottom:12 }}>🔍</div><div style={{ fontSize:14, color: P.textMuted }}>Fill in more stages to activate cross-validation.</div></div>
              : challenges.map((ch,i) => (
                <div key={i} style={{ background:ch.sev==="critical"?P.danger+"12":P.warning+"12", border:`1px solid ${ch.sev==="critical"?P.danger+"30":P.warning+"30"}`, borderRadius:12, padding:18, marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:ch.sev==="critical"?P.danger:P.warning, marginBottom:4 }}>{ch.sev==="critical"?"🚨":"⚠️"} {ch.title}</div>
                  <div style={{ fontSize:13, color: P.text, lineHeight:1.6, marginBottom:6 }}>{ch.msg}</div>
                  <div style={{ fontSize:12, color: P.textMuted, fontStyle:"italic" }}>→ {ch.fix}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "health" && (
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, marginBottom:16 }}>🔬 Venture Health</h1>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <Ring pct={ventureHealth} size={100} stroke={7} color={ventureHealth>=70?P.success:ventureHealth>=40?P.warning:P.danger}>
                  <span style={{ fontSize:24, fontWeight:800, color:ventureHealth>=70?P.success:ventureHealth>=40?P.warning:P.danger }}>{ventureHealth}</span>
                </Ring>
              </div>
              {["market","customer","solution","business","execution"].map(cat => {
                const items = valResults.filter(v=>v.cat===cat);
                return <div key={cat} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color: P.textDim, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{cat}</div>
                  {items.map(item => <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, background:item.result.st==="pass"?P.success+"12":P.bgCard, border:`1px solid ${item.result.st==="pass"?P.success+"25":P.border}`, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:item.result.st==="pass"?P.success:item.result.st==="weak"?P.warning:P.textDim }} />
                    <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600 }}>{item.label}</div><div style={{ fontSize:11, color: P.textMuted }}>{item.result.m}</div></div>
                  </div>)}
                </div>;
              })}
            </div>
          )}

          {tab === "network" && (
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, marginBottom:16 }}>🌐 Builder Network</h1>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {PROFILES.map((p,i) => {
                  const cols = [P.accent1,P.accent2,P.accent3,P.accent4,P.accent5,P.accent6];
                  return <div key={i} style={{ background: P.bgCard, borderRadius:14, border:`1px solid ${P.border}`, padding:18 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${cols[i%6]},${cols[(i+1)%6]})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>{p.av}</div>
                      <div><div style={{ fontSize:14, fontWeight:700 }}>{p.name}</div><div style={{ fontSize:11, color:cols[i%6], fontWeight:600 }}>{p.role}</div><div style={{ fontSize:10, color: P.textDim }}>{p.loc}</div></div>
                    </div>
                    <div style={{ fontSize:12, color: P.textMuted, marginTop:8 }}>{p.bio}</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>{p.tags.map(t=><span key={t} style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background: P.bgInput, color: P.textDim }}>{t}</span>)}</div>
                    <button style={{ width:"100%", marginTop:10, padding:8, borderRadius:8, background: P.gradient, border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Request Intro</button>
                  </div>;
                })}
              </div>
            </div>
          )}

          {tab === "brief" && (() => {
            const passCount = valResults.filter(v=>v.result.st==="pass").length;
            const crits = challenges.filter(c=>c.sev==="critical").length;
            const ready = passCount >= 5 && crits === 0;
            if (!ready) return <div style={{ textAlign:"center", padding:48 }}><div style={{ fontSize:48, marginBottom:12 }}>📋</div><div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Not Ready Yet</div><div style={{ fontSize:13, color: P.textMuted }}>Pass 5+ checks with 0 critical issues.</div><div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:16 }}><div style={{ padding:"10px 18px", borderRadius:10, background:passCount>=5?P.success+"15":P.danger+"15", fontSize:13, fontWeight:600 }}>Checks: {passCount}/10</div><div style={{ padding:"10px 18px", borderRadius:10, background:crits===0?P.success+"15":P.danger+"15", fontSize:13, fontWeight:600 }}>Critical: {crits}</div></div></div>;
            const fields = [
              { label:"Vision", k:"0_vision" }, { label:"Contrarian Bet", k:"0_strategy" }, { label:"Why Now", k:"1_drivers" },
              { label:"Customer", k:"2_personaName" }, { label:"Problem", k:"2_pains" }, { label:"Solution", k:"3_core" },
              { label:"Pricing", k:"4_revenue" }, { label:"Moat", k:"5_moat" }, { label:"GTM Channel", k:"6_channel" },
              { label:"OMTM", k:"7_omtm" },
            ].filter(f => data[f.k]);
            return <div><div style={{ textAlign:"center", marginBottom:24 }}><div style={{ fontSize:40 }}>✅</div><div style={{ fontSize:13, color: P.success, fontWeight:600 }}>Validated Business Brief</div></div>
              {fields.map((f,i) => <div key={i} style={{ background: P.bgCard, border:`1px solid ${P.border}`, borderRadius:12, padding:16, marginBottom:8 }}>
                <div style={{ fontSize:10, fontWeight:700, color: P.accent1, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{f.label}</div>
                <div style={{ fontSize:14, lineHeight:1.6 }}>{data[f.k]}</div>
              </div>)}
            </div>;
          })()}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        textarea::placeholder { color: ${P.textDim}; }
        select { cursor: pointer; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${P.bg}; }
        ::-webkit-scrollbar-thumb { background: ${P.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
