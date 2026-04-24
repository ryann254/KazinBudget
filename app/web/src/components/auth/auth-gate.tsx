import type { ReactNode } from "react";
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

      <Unauthenticated>{children}</Unauthenticated>

      <Authenticated>{children}</Authenticated>
    </>
  );
}
