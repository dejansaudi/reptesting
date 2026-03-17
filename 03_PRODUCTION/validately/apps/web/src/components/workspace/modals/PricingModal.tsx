"use client";
import { usePlans } from "@/hooks/usePlans";
import { apiFetch } from "@/lib/api";
import { Modal } from "../Modal";

export function PricingModal({ currentPlan, onClose }: { currentPlan: string; onClose: () => void }) {
  const { plans, loading } = usePlans();

  async function checkout(planId: string) {
    if (planId === "free" || planId === currentPlan) return;
    try {
      const res = await apiFetch("/billing/checkout", { method: "POST", body: JSON.stringify({ plan: planId }) });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {}
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl" aria-label="Upgrade plan">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Upgrade Your Plan</h2>
          <button onClick={onClose} aria-label="Close pricing" className="text-content-subtle hover:text-content text-lg">{"\u2715"}</button>
        </div>
        {loading ? (
          <div className="text-center text-sm text-content-subtle py-8 animate-pulse">Loading plans...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((tier) => {
              const isCurrent = tier.id === currentPlan;
              const isFree = tier.id === "free";
              return (
                <div key={tier.id} className={`border rounded-xl p-5 flex flex-col ${tier.id === "pro" ? "border-brand bg-brand/5" : "border-border bg-surface-2"}`}>
                  <div className="text-sm font-bold mb-1">{tier.name}</div>
                  <div className="text-lg font-bold text-brand mb-2">{tier.label}</div>
                  <div className="flex-1 mb-4">
                    {tier.features.map((f, idx) => (
                      <div key={idx} className="flex gap-2 items-start mb-2 text-[11px] text-content-muted">
                        <span className="text-sm mt-0.5">{"\u2713"}</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => checkout(tier.id)} disabled={isCurrent || isFree}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold ${isCurrent || isFree ? "bg-surface-3 text-content-subtle cursor-default" : "bg-brand text-white hover:bg-brand-hover"}`}>
                    {isCurrent ? "Current Plan" : isFree ? "Free" : tier.cta || "Select Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
