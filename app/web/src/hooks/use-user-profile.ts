import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { BudgetInputData } from "@kazibudget/shared/schemas/budget-input";

export type ProfilePatch = Partial<BudgetInputData>;

export function useUserProfile() {
  const profile = useQuery(api.userProfile.get);
  const patchMutation = useMutation(api.userProfile.patch);

  const patch = useCallback(
    (changes: ProfilePatch) => {
      if (Object.keys(changes).length === 0) return Promise.resolve();
      return patchMutation(changes);
    },
    [patchMutation],
  );

  return {
    profile,
    isLoading: profile === undefined,
    patch,
  };
}
