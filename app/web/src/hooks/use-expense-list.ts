import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

const DEFAULT_SESSION_ID = "default";

export type ExpenseListItem = {
  id: Id<"expenses">;
  name: string;
  amount: number;
  category: "tax" | "rent" | "food" | "transport" | "custom";
  isAuto: boolean;
};

export function useExpenseList() {
  const rows = useQuery(api.expenses.listBySession, {
    user_session_id: DEFAULT_SESSION_ID,
  }) as Doc<"expenses">[] | undefined;
  const createMutation = useMutation(api.expenses.create);
  const updateMutation = useMutation(api.expenses.update);
  const removeMutation = useMutation(api.expenses.remove);

  const items: ExpenseListItem[] = (rows ?? []).map((row) => ({
    id: row._id,
    name: row.name,
    amount: row.amount,
    category: row.category,
    isAuto: row.is_auto,
  }));

  const isLoading = rows === undefined;

  const add = useCallback(
    async (next: {
      name: string;
      amount: number;
      category?: "tax" | "rent" | "food" | "transport" | "custom";
    }) => {
      await createMutation({
        user_session_id: DEFAULT_SESSION_ID,
        name: next.name,
        amount: next.amount,
        category: next.category ?? "custom",
      });
    },
    [createMutation],
  );

  const update = useCallback(
    async (id: Id<"expenses">, next: { name: string; amount: number }) => {
      await updateMutation({
        id,
        name: next.name,
        amount: next.amount,
      });
    },
    [updateMutation],
  );

  const remove = useCallback(
    async (id: Id<"expenses">) => {
      await removeMutation({ id });
    },
    [removeMutation],
  );

  return { items, isLoading, add, update, remove };
}
