import { useEffect, useRef, useState } from "react";
import { MoreVertical, Check, X, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLORS = {
  black: "#0D1B2A",
  red: "#E63946",
  yellow: "#F4D35E",
  white: "#FFFFFF",
} as const;

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export type ExpenseRowData = {
  id: string;
  name: string;
  amount: number;
  isAuto: boolean;
};

type Props = {
  row: ExpenseRowData;
  accentColor: string;
  onSave: (next: { name: string; amount: number }) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

export function ExpenseRow({ row, accentColor, onSave, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(row.name);
  const [amountDraft, setAmountDraft] = useState(String(row.amount));
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) nameInputRef.current?.focus();
  }, [isEditing]);

  const beginEdit = () => {
    setNameDraft(row.name);
    setAmountDraft(String(row.amount));
    setIsEditing(true);
  };

  const commit = async () => {
    const parsedAmount = Number(amountDraft);
    if (!nameDraft.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return;
    }
    await onSave({ name: nameDraft.trim(), amount: parsedAmount });
    setIsEditing(false);
  };

  const cancel = () => {
    setIsEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          borderLeft: `3px solid ${accentColor}`,
          borderBottom: `2px solid ${COLORS.black}`,
          backgroundColor: COLORS.yellow,
          fontFamily: "'Work Sans', sans-serif",
        }}
      >
        <input
          ref={nameInputRef}
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
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
          value={amountDraft}
          onChange={(e) => setAmountDraft(e.target.value)}
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
          aria-label="Save"
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
          onClick={cancel}
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

  return (
    <div
      className="group flex justify-between items-center px-5 py-3 font-semibold text-sm"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        borderBottom: `2px solid ${COLORS.black}`,
        backgroundColor: COLORS.white,
        fontFamily: "'Work Sans', sans-serif",
      }}
    >
      <span className="uppercase font-bold text-xs" style={{ letterSpacing: "0.05em" }}>
        &mdash; {row.name}
      </span>
      <div className="flex items-center gap-3">
        <span className="font-bold">{CURRENCY_FORMATTER.format(row.amount)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Row actions"
              className="p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              style={{
                border: `2px solid ${COLORS.black}`,
                backgroundColor: COLORS.white,
              }}
            >
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            style={{
              border: `3px solid ${COLORS.black}`,
              boxShadow: `4px 4px 0 ${COLORS.black}`,
              backgroundColor: COLORS.white,
              borderRadius: 0,
              padding: 0,
              minWidth: "10rem",
            }}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                beginEdit();
              }}
              className="font-bold uppercase text-xs"
              style={{
                letterSpacing: "0.15em",
                borderRadius: 0,
                fontFamily: "'Work Sans', sans-serif",
              }}
            >
              <Pencil size={14} />
              Edit
            </DropdownMenuItem>
            {!row.isAuto && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  void onDelete();
                }}
                className="font-bold uppercase text-xs"
                style={{
                  letterSpacing: "0.15em",
                  color: COLORS.red,
                  borderRadius: 0,
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                <Trash2 size={14} />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
