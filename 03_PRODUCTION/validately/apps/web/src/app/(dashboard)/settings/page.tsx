"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { PRICING_TIERS, type Plan } from "@validately/shared";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const { user, loading } = useUser();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (user?.hasApiKey) setApiKey("sk-ant-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
  }, [user]);

  async function saveKey() {
    if (!apiKey || apiKey.startsWith("sk-ant-\u2022")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/users/me/api-key", {
        method: "PUT",
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setApiKey("sk-ant-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save API key. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeKey() {
    setSaving(true);
    try {
      const res = await apiFetch("/users/me/api-key", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApiKey("");
      setSaved(false);
    } catch {
      setError("Failed to delete API key.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckout() {
    setBillingLoading(true);
    try {
      const res = await apiFetch("/billing/checkout", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to start checkout.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handlePortal() {
    setBillingLoading(true);
    try {
      const res = await apiFetch("/billing/portal", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Failed to open billing portal.");
    } finally {
      setBillingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-content-subtle animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const plan = (user?.plan || "free") as Plan;
  const planName = PRICING_TIERS[plan]?.name ?? plan.toUpperCase();
  const isPaid = plan !== "free";

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Profile */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold mb-2">Profile</h2>
        <div className="flex items-center gap-3">
          {user?.image && (
            <img
              src={user.image}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <div className="text-sm font-semibold">
              {user?.name || "\u2014"}
            </div>
            <div className="text-xs text-content-subtle">{user?.email}</div>
          </div>
        </div>
      </section>

      {/* API Key */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold mb-2">Anthropic API Key</h2>
        <p className="text-xs text-content-subtle mb-4">
          Enter your own API key for unlimited AI coaching (bypasses plan
          limits).
        </p>
        <label htmlFor="settings-api-key" className="sr-only">
          API Key
        </label>
        <input
          id="settings-api-key"
          type="password"
          value={apiKey}
          onFocus={() => {
            if (apiKey.startsWith("sk-ant-\u2022")) setApiKey("");
          }}
          onChange={(e) => {
            setApiKey(e.target.value);
            setSaved(false);
          }}
          placeholder="sk-ant-..."
          className="w-full py-3 px-4 rounded-lg bg-surface text-content border border-border text-sm mb-3 focus:border-brand focus:outline-none transition-colors"
        />
        <div className="flex gap-2">
          <button
            onClick={saveKey}
            disabled={saving || !apiKey || apiKey.startsWith("sk-ant-\u2022")}
            className="px-6 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
          {user?.hasApiKey && (
            <button
              onClick={removeKey}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg bg-surface-2 text-danger text-sm font-bold hover:bg-danger/10 disabled:opacity-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </section>

      {/* Plan */}
      <section className="bg-surface-1 border border-border rounded-xl p-6">
        <h2 className="text-sm font-bold mb-2">Current Plan</h2>
        <p className="text-xs text-content-subtle mb-4">
          You are on the{" "}
          <span className="font-bold text-brand">{planName}</span> plan.
        </p>
        {isPaid ? (
          <button
            onClick={handlePortal}
            disabled={billingLoading}
            className="px-6 py-2.5 rounded-lg bg-surface-2 border border-brand text-brand text-sm font-bold hover:bg-brand/10 disabled:opacity-50 transition-colors"
          >
            {billingLoading ? "Loading..." : "Manage Billing"}
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={billingLoading}
            className="px-6 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {billingLoading ? "Loading..." : "Upgrade to Pro"}
          </button>
        )}
      </section>
    </div>
  );
}
