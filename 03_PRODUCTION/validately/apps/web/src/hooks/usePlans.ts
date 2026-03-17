"use client";
import { useState, useEffect } from "react";
import type { PlanResponse } from "@/app/api/plans/route";

let cachedPlans: PlanResponse[] | null = null;
let fetchPromise: Promise<PlanResponse[]> | null = null;

async function fetchPlans(): Promise<PlanResponse[]> {
  if (cachedPlans) return cachedPlans;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/plans")
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data: PlanResponse[] = await res.json();
      cachedPlans = data;
      return data;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/** Invalidate the client-side plan cache (e.g. after an admin updates plans). */
export function invalidatePlansCache() {
  cachedPlans = null;
}

export function usePlans() {
  const [plans, setPlans] = useState<PlanResponse[]>(cachedPlans || []);
  const [loading, setLoading] = useState(!cachedPlans);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((data) => {
        if (!cancelled) {
          setPlans(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getPlan = (id: string) => plans.find((p) => p.id === id) ?? null;

  return { plans, loading, error, getPlan };
}
