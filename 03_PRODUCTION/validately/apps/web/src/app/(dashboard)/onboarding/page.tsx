"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";

const STEPS = [
  {
    title: "What stage is your startup?",
    options: [
      { label: "Just an idea", value: "idea", icon: "\u{1F4A1}" },
      { label: "Building MVP", value: "mvp", icon: "\u{1F527}" },
      { label: "Have early users", value: "early", icon: "\u{1F465}" },
      { label: "Revenue stage", value: "revenue", icon: "\u{1F4B0}" },
    ],
  },
  {
    title: "What's your primary goal?",
    options: [
      { label: "Validate my idea", value: "validate", icon: "\u2705" },
      { label: "Prepare for fundraising", value: "fundraise", icon: "\u{1F4C8}" },
      { label: "Find product-market fit", value: "pmf", icon: "\u{1F3AF}" },
      { label: "Scale my business", value: "scale", icon: "\u{1F680}" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { projectId } = useProjectStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if user already has a project (already onboarded)
  useEffect(() => {
    if (projectId) router.replace("/workspace");
  }, [projectId, router]);

  async function completeOnboarding() {
    setLoading(true);
    try {
      // FIX P1: Send stage and goal data to the API (was discarded before)
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          onboardingComplete: true,
          startupStage: answers.stage,
          primaryGoal: answers.goal,
        }),
      });
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: name || "My Startup",
          stage: answers.stage,
          goal: answers.goal,
        }),
      });
      if (res.ok) {
        router.push("/workspace");
      } else {
        router.push("/projects");
      }
    } catch {
      router.push("/projects");
    }
  }

  const isNameStep = step >= STEPS.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[...STEPS, { title: "name" }].map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx <= step ? "bg-brand" : "bg-surface-3"
              }`}
            />
          ))}
        </div>

        {isNameStep ? (
          <div>
            <h1 className="text-xl font-bold mb-2">Name your startup</h1>
            <p className="text-sm text-content-subtle mb-6">
              Don&apos;t worry, you can change this later.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="w-full py-3 px-4 rounded-lg bg-surface-1 text-content border border-border text-sm mb-4 focus:border-brand focus:outline-none transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") completeOnboarding();
              }}
            />
            <button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting up..." : "Get Started \u2192"}
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold mb-6">{STEPS[step].title}</h1>
            <div className="grid grid-cols-2 gap-3">
              {STEPS[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setAnswers({
                      ...answers,
                      [step === 0 ? "stage" : "goal"]: opt.value,
                    });
                    if (step < STEPS.length - 1) setStep(step + 1);
                    else setStep(STEPS.length);
                  }}
                  className="flex flex-col items-center gap-2 p-5 bg-surface-1 border border-border rounded-xl hover:border-brand transition-colors text-center"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 text-xs text-content-subtle hover:text-content transition-colors"
          >
            \u2190 Back
          </button>
        )}
      </div>
    </div>
  );
}
