import { SignInButton } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = {
  black: "#0D1B2A",
  yellow: "#F4D35E",
  white: "#FFFFFF",
} as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
};

export function LoginPromptDialog({ open, onOpenChange, feature }: Props) {
  const featureLabel = feature.trim() === "" ? "This feature" : `Your ${feature}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-none border-0 p-0"
        style={{
          border: `3px solid ${COLORS.black}`,
          boxShadow: `8px 8px 0 ${COLORS.black}`,
          backgroundColor: COLORS.white,
          padding: "24px",
          fontFamily: "'Work Sans', sans-serif",
          borderRadius: 0,
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="uppercase"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 900,
              letterSpacing: "0.1em",
              fontSize: "1.25rem",
              color: COLORS.black,
            }}
          >
            Sign in to continue
          </DialogTitle>
          <DialogDescription
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              color: COLORS.black,
              opacity: 0.85,
              fontSize: "0.875rem",
            }}
          >
            {featureLabel} needs an account so we can save your data and sync
            across devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs uppercase"
            style={{
              border: `2px solid ${COLORS.black}`,
              backgroundColor: COLORS.white,
              color: COLORS.black,
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 800,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            Keep editing inputs
          </button>
          <SignInButton mode="modal">
            <button
              type="button"
              className="px-5 py-2 text-xs uppercase"
              style={{
                border: `3px solid ${COLORS.black}`,
                boxShadow: `4px 4px 0 ${COLORS.black}`,
                backgroundColor: COLORS.yellow,
                color: COLORS.black,
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 900,
                letterSpacing: "0.15em",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
