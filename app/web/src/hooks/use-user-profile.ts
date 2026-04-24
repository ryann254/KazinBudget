import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@backend/_generated/api";
import type { BudgetInputData } from "@kazibudget/shared/schemas/budget-input";
import { readJSON, writeJSON } from "@/lib/local-storage-store";

export type ProfilePatch = Partial<BudgetInputData>;

const LOCAL_PROFILE_KEY = "kazibudget.profile";

type ProfileResult = Partial<BudgetInputData> | null | undefined;

export function useUserProfile() {
  const { isSignedIn } = useUser();
  const isAuthed = isSignedIn === true;

  const convexProfile = useQuery(api.userProfile.get, isAuthed ? {} : "skip");
  const patchMutation = useMutation(api.userProfile.patch);

  const patch = useCallback(
    (changes: ProfilePatch) => {
      if (Object.keys(changes).length === 0) return Promise.resolve();
      if (isAuthed) {
        return patchMutation(changes);
      }
      const existing = readJSON<Partial<BudgetInputData>>(LOCAL_PROFILE_KEY, {});
      const next: Partial<BudgetInputData> = { ...existing, ...changes };
      writeJSON(LOCAL_PROFILE_KEY, next);
      return Promise.resolve();
    },
    [isAuthed, patchMutation],
  );

  const profile: ProfileResult = isAuthed
    ? convexProfile
    : readJSON<Partial<BudgetInputData> | null>(LOCAL_PROFILE_KEY, null);

  return {
    profile,
    isLoading: isAuthed ? convexProfile === undefined : false,
    patch,
  };
}
