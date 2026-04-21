import type { ReactNode } from "react";
import { SignInButton } from "@clerk/clerk-react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useClerkSessionRecovery } from "@/lib/session-recovery";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  useClerkSessionRecovery();
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm w-full rounded-lg border bg-card p-6 text-center">
            <h1 className="text-lg font-semibold mb-2">Sign in required</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to access your KAZI&amp;BUDGET workspace.
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground"
              >
                Sign in with Clerk
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>{children}</Authenticated>
    </>
  );
}
