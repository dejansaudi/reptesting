"use client";
import { useState } from "react";
import { PRICING_TIERS } from "@validately/shared";
import { apiFetch } from "@/lib/api";
import { Modal } from "../Modal";

const tiers = Object.values(PRICING_TIERS);

export function PricingModal({ currentPlan, onClose }: { currentPlan: string; onClose: () => void }) {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  async function checkout(planId: string) {
    if (planId === "free" || planId === currentPlan || checkoutLoading) return;
    setCheckoutLoading(planId);
    try {
      const res = await apiFetch("/billing/checkout", { method: "POST", body: JSON.stringify({ plan: planId }) });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl" aria-label="Upgrade plan">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Upgrade Your Plan</h2>
          <button onClick={onClose} aria-label="Close pricing" className="text-content-subtle hover:text-content text-lg">{"\u2715"}</button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((tier) => {
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
                <button onClick={() => checkout(tier.id)} disabled={isCurrent || isFree || !!checkoutLoading}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold ${isCurrent || isFree || checkoutLoading ? "bg-surface-3 text-content-subtle cursor-default" : "bg-brand text-white hover:bg-brand-hover"}`}>
                  {checkoutLoading === tier.id ? "Redirecting..." : isCurrent ? "Current Plan" : isFree ? "Free" : tier.cta || "Select Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
