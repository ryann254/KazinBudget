import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BudgetInputSchema,
  type BudgetInputData,
} from "@kazibudget/shared/schemas/budget-input";

const SHAKE_DURATION_MS = 320;

export function useBudgetForm(defaults: BudgetInputData) {
  const form = useForm<BudgetInputData>({
    resolver: zodResolver(BudgetInputSchema),
    defaultValues: defaults,
    mode: "onChange",
  });

  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), SHAKE_DURATION_MS);
  }, []);

  return {
    form,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    values: form.watch(),
    isShaking,
    triggerShake,
  };
}
