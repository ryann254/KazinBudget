import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";

type Category = "tax" | "rent" | "food" | "transport" | "custom";

type Adder = (next: {
  name: string;
  amount: number;
  category?: Category;
}) => Promise<void>;

type ExpenseLike = {
  items: { id: string | { _tag?: string } }[];
  isLoading: boolean;
  add: Adder;
};

const DEFAULTS: Array<{ name: string; amount: number; category: Category }> = [
  { name: "Rent (1 Bedroom)", amount: 15_000, category: "rent" },
  { name: "Food & Meals", amount: 8_800, category: "food" },
  { name: "Transport (Matatu)", amount: 6_600, category: "transport" },
  { name: "Groceries", amount: 8_000, category: "custom" },
  { name: "Electricity", amount: 2_500, category: "custom" },
  { name: "Water", amount: 800, category: "custom" },
  { name: "Internet / WiFi", amount: 3_000, category: "custom" },
  { name: "Phone (Airtime/Data)", amount: 2_000, category: "custom" },
];

const storageKey = (userId: string) => `kazi_seeded_defaults_${userId}`;

export function useSeedDefaultExpenses(expenseList: ExpenseLike) {
  const { user, isLoaded } = useUser();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (expenseList.isLoading) return;
    if (expenseList.items.length > 0) return;
    if (ranRef.current) return;

    const key = storageKey(user.id);
    try {
      if (localStorage.getItem(key) === "1") return;
    } catch {
      /* storage unavailable */
    }

    ranRef.current = true;
    void (async () => {
      for (const item of DEFAULTS) {
        await expenseList.add(item);
      }
      try {
        localStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    })();
  }, [isLoaded, user, expenseList.isLoading, expenseList.items.length, expenseList]);
}
