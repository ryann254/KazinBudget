import { useCallback, useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  createBudgetFingerprint,
  type BudgetFingerprintInput,
} from "@kazibudget/shared/lib/budget-fingerprint";
import {
  calculateKenyanDeductions,
  type TaxBreakdown,
} from "@kazibudget/shared/lib/kenya-tax-calculator";

export type BudgetCalcResult = {
  fingerprint: string;
  tax: TaxBreakdown;
  computedAt: number;
  fromCache: boolean;
};

export function useBudgetCalculation() {
  const convex = useConvex();
  const upsert = useMutation(api.budget.upsertByFingerprint);
  const [lastResult, setLastResult] = useState<BudgetCalcResult | null>(null);
  const localCacheRef = useRef<Map<string, BudgetCalcResult>>(new Map());

  const calculate = useCallback(
    async (input: BudgetFingerprintInput): Promise<BudgetCalcResult> => {
      const fingerprint = createBudgetFingerprint(input);
      const cache = localCacheRef.current;

      const localHit = cache.get(fingerprint);
      if (localHit) {
        setLastResult(localHit);
        return localHit;
      }

      const remote = await convex.query(api.budget.getByFingerprint, {
        fingerprint,
      });
      if (remote) {
        try {
          const parsed = JSON.parse(remote.payload) as { tax: TaxBreakdown };
          const cached: BudgetCalcResult = {
            fingerprint,
            tax: parsed.tax,
            computedAt: remote.createdAt,
            fromCache: true,
          };
          cache.set(fingerprint, cached);
          setLastResult(cached);
          return cached;
        } catch {
          /* fall through to recompute */
        }
      }

      const tax = calculateKenyanDeductions(Math.max(0, input.grossSalary));
      const result: BudgetCalcResult = {
        fingerprint,
        tax,
        computedAt: Date.now(),
        fromCache: false,
      };
      cache.set(fingerprint, result);
      setLastResult(result);

      void upsert({
        fingerprint,
        payload: JSON.stringify({ tax, input }),
      });

      return result;
    },
    [convex, upsert],
  );

  return { calculate, lastResult };
}
