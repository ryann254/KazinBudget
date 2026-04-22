import { useEffect, useRef, useState } from "react";
import { Plus, Check, X } from "lucide-react";

const COLORS = {
  black: "#0D1B2A",
  muted: "#457B9D",
  white: "#FFFFFF",
  yellow: "#F4D35E",
} as const;

type Props = {
  onAdd: (next: { name: string; amount: number }) => void | Promise<void>;
};

export function AddExpenseRow({ onAdd }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) nameInputRef.current?.focus();
  }, [isEditing]);

  const reset = () => {
    setName("");
    setAmount("");
    setIsEditing(false);
  };

  const commit = async () => {
    const parsedAmount = Number(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return;
    }
    await onAdd({ name: name.trim(), amount: parsedAmount });
    reset();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      reset();
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="w-full flex justify-center items-center gap-2 px-5 py-3 font-bold text-xs uppercase"
        style={{
          borderLeft: `3px solid ${COLORS.muted}`,
          borderBottom: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
          color: COLORS.muted,
          fontFamily: "'Work Sans', sans-serif",
          letterSpacing: "0.15em",
          cursor: "pointer",
        }}
      >
        <Plus size={14} />
        Add item
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-5 py-3"
      style={{
        borderLeft: `3px solid ${COLORS.muted}`,
        borderBottom: `2px solid ${COLORS.black}`,
        backgroundColor: COLORS.yellow,
        fontFamily: "'Work Sans', sans-serif",
      }}
    >
      <input
        ref={nameInputRef}
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKey}
        className="flex-1 px-2 py-1 text-xs font-bold uppercase outline-none"
        style={{
          border: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
          letterSpacing: "0.05em",
        }}
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={100}
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={handleKey}
        className="w-28 px-2 py-1 text-xs font-bold text-right outline-none"
        style={{
          border: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
        }}
      />
      <button
        type="button"
        onClick={() => void commit()}
        aria-label="Add"
        className="p-1"
        style={{
          border: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Cancel"
        className="p-1"
        style={{
          border: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.white,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
