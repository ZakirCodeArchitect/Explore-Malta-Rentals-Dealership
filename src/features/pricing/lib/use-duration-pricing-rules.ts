"use client";

import { useEffect, useState } from "react";

import type { DurationPricingRuleDto } from "@/lib/pricing/duration-pricing";

type UseDurationPricingRulesResult = {
  rules: DurationPricingRuleDto[];
  isLoading: boolean;
  error: string | null;
};

let cachedRules: DurationPricingRuleDto[] | null = null;
let cachedPromise: Promise<DurationPricingRuleDto[]> | null = null;

async function loadDurationPricingRules(): Promise<DurationPricingRuleDto[]> {
  if (cachedRules) {
    return cachedRules;
  }

  if (!cachedPromise) {
    cachedPromise = fetch("/api/pricing/duration-rules", {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 60 },
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          success?: boolean;
          rules?: DurationPricingRuleDto[];
          message?: string;
        };
        if (!response.ok || !body.success || !Array.isArray(body.rules)) {
          throw new Error(body.message ?? "Unable to load duration pricing rules.");
        }
        cachedRules = body.rules;
        return body.rules;
      })
      .finally(() => {
        cachedPromise = null;
      });
  }

  return cachedPromise;
}

export function useDurationPricingRules(enabled = true): UseDurationPricingRulesResult {
  const [rules, setRules] = useState<DurationPricingRuleDto[]>(cachedRules ?? []);
  const [isLoading, setIsLoading] = useState(enabled && !cachedRules);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadDurationPricingRules()
      .then((loaded) => {
        if (!cancelled) {
          setRules(loaded);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Unable to load duration pricing rules.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { rules, isLoading, error };
}
