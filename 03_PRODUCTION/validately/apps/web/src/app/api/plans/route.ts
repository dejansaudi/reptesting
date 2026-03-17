import { NextResponse } from "next/server";
import { PRICING_TIERS, TIER_LIMITS } from "@validately/shared";
import type { PricingTier, TierLimit } from "@validately/shared";

/**
 * GET /api/plans — returns all available plans with pricing and limits.
 *
 * Currently seeds from the shared constants as defaults, but designed
 * for easy migration to a database-backed store. To switch to DB:
 *   1. Replace `getPlans()` internals with a DB query
 *   2. Add admin-only POST/PUT/DELETE handlers below
 *
 * The external API at NEXT_PUBLIC_API_URL can also override plans
 * by setting PLANS_SOURCE=api in env.
 */

export interface PlanResponse {
  id: string;
  name: string;
  price: number;
  label: string;
  features: string[];
  cta?: string;
  limits: TierLimit;
}

async function getPlans(): Promise<PlanResponse[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const plansSource = process.env.PLANS_SOURCE;

  // If configured to fetch from external API, do so
  if (plansSource === "api" && apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/plans`, {
        next: { revalidate: 300 }, // cache for 5 minutes
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall through to defaults
    }
  }

  // Default: build from shared constants
  return Object.values(PRICING_TIERS).map((tier: PricingTier) => ({
    id: tier.id,
    name: tier.name,
    price: tier.price,
    label: tier.label,
    features: tier.features,
    ...(tier.cta ? { cta: tier.cta } : {}),
    limits: TIER_LIMITS[tier.id],
  }));
}

export async function GET() {
  const plans = await getPlans();
  return NextResponse.json(plans, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
