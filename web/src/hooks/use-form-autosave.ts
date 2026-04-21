import { useEffect, useRef } from "react";
import type { BudgetInputData } from "@kazibudget/shared/schemas/budget-input";

type Key = keyof BudgetInputData;

function computeDiff(
  next: Partial<BudgetInputData>,
  last: Partial<BudgetInputData>,
): Partial<BudgetInputData> {
  const diff: Partial<BudgetInputData> = {};
  const keys: Key[] = [
    "fullName",
    "company",
    "jobTitle",
    "workLocation",
    "homeArea",
    "grossSalary",
    "experienceYears",
  ];
  for (const key of keys) {
    const nv = next[key];
    const lv = last[key];
    if (nv === undefined) continue;
    if (typeof nv === "number" && !Number.isFinite(nv)) continue;
    if (typeof nv === "string" && nv.trim().length === 0) continue;
    if (nv !== lv) {
      // Use a typed branch so TS preserves the value type per key.
      (diff as Record<Key, unknown>)[key] = nv;
    }
  }
  return diff;
}

type Options = {
  enabled: boolean;
  delayMs?: number;
};

export function useFormAutosave(
  values: Partial<BudgetInputData>,
  save: (diff: Partial<BudgetInputData>) => void | Promise<unknown>,
  { enabled, delayMs = 500 }: Options,
) {
  const lastSavedRef = useRef<Partial<BudgetInputData>>({});
  const valuesRef = useRef(values);
  const saveRef = useRef(save);

  useEffect(() => {
    valuesRef.current = values;
    saveRef.current = save;
  });

  const fieldSignature = [
    values.fullName,
    values.company,
    values.jobTitle,
    values.workLocation,
    values.homeArea,
    values.grossSalary,
    values.experienceYears,
  ].join("␟");

  useEffect(() => {
    if (!enabled) return;
    const diff = computeDiff(valuesRef.current, lastSavedRef.current);
    if (Object.keys(diff).length === 0) return;

    const timer = window.setTimeout(() => {
      const diffNow = computeDiff(valuesRef.current, lastSavedRef.current);
      if (Object.keys(diffNow).length === 0) return;
      const snapshot = { ...lastSavedRef.current, ...diffNow };
      lastSavedRef.current = snapshot;
      void Promise.resolve(saveRef.current(diffNow)).catch(() => {
        for (const key of Object.keys(diffNow) as Key[]) {
          delete (lastSavedRef.current as Record<Key, unknown>)[key];
        }
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [enabled, delayMs, fieldSignature]);

  return {
    primeBaseline(baseline: Partial<BudgetInputData>) {
      lastSavedRef.current = { ...baseline };
    },
  };
}
