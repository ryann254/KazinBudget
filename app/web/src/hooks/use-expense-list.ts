import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@backend/_generated/api";
import type { Doc, Id } from "@backend/_generated/dataModel";
import { readJSON, writeJSON } from "@/lib/local-storage-store";

const DEFAULT_SESSION_ID = "default";
const LOCAL_EXPENSES_KEY = "kazibudget.expenses";

export type ExpenseCategory = "tax" | "rent" | "food" | "transport" | "custom";

export type ExpenseListItem = {
  id: Id<"expenses">;
  name: string;
  amount: number;
  category: ExpenseCategory;
  isAuto: boolean;
};

type LocalExpense = {
  _id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  user_session_id: "default";
};

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useExpenseList() {
  const { isSignedIn } = useUser();
  const isAuthed = isSignedIn === true;

  const rows = useQuery(
    api.expenses.listBySession,
    isAuthed ? { user_session_id: DEFAULT_SESSION_ID } : "skip",
  ) as Doc<"expenses">[] | undefined;
  const createMutation = useMutation(api.expenses.create);
  const updateMutation = useMutation(api.expenses.update);
  const removeMutation = useMutation(api.expenses.remove);

  const [localRows, setLocalRows] = useState<LocalExpense[]>(() =>
    readJSON<LocalExpense[]>(LOCAL_EXPENSES_KEY, []),
  );

  const persistLocal = useCallback((next: LocalExpense[]) => {
    setLocalRows(next);
    writeJSON(LOCAL_EXPENSES_KEY, next);
  }, []);

  const items: ExpenseListItem[] = isAuthed
    ? (rows ?? []).map((row) => ({
        id: row._id,
        name: row.name,
        amount: row.amount,
        category: row.category,
        isAuto: row.is_auto,
      }))
    : localRows.map((row) => ({
        id: row._id as Id<"expenses">,
        name: row.name,
        amount: row.amount,
        category: row.category,
        isAuto: false,
      }));

  const isLoading = isAuthed ? rows === undefined : false;

  const add = useCallback(
    async (next: {
      name: string;
      amount: number;
      category?: ExpenseCategory;
    }) => {
      if (isAuthed) {
        await createMutation({
          user_session_id: DEFAULT_SESSION_ID,
          name: next.name,
          amount: next.amount,
          category: next.category ?? "custom",
        });
        return;
      }
      const current = readJSON<LocalExpense[]>(LOCAL_EXPENSES_KEY, []);
      const row: LocalExpense = {
        _id: generateId(),
        name: next.name,
        amount: next.amount,
        category: next.category ?? "custom",
        user_session_id: DEFAULT_SESSION_ID,
      };
      persistLocal([...current, row]);
    },
    [isAuthed, createMutation, persistLocal],
  );

  const update = useCallback(
    async (id: Id<"expenses">, next: { name: string; amount: number }) => {
      if (isAuthed) {
        await updateMutation({
          id,
          name: next.name,
          amount: next.amount,
        });
        return;
      }
      const current = readJSON<LocalExpense[]>(LOCAL_EXPENSES_KEY, []);
      const updated = current.map((row) =>
        row._id === (id as unknown as string)
          ? { ...row, name: next.name, amount: next.amount }
          : row,
      );
      persistLocal(updated);
    },
    [isAuthed, updateMutation, persistLocal],
  );

  const remove = useCallback(
    async (id: Id<"expenses">) => {
      if (isAuthed) {
        await removeMutation({ id });
        return;
      }
      const current = readJSON<LocalExpense[]>(LOCAL_EXPENSES_KEY, []);
      const filtered = current.filter(
        (row) => row._id !== (id as unknown as string),
      );
      persistLocal(filtered);
    },
    [isAuthed, removeMutation, persistLocal],
  );

  return { items, isLoading, add, update, remove };
}
