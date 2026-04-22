import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import "@/lib/session-recovery";
import "./index.css";
import App from "./App.tsx";
import { AuthGate } from "@/components/auth/auth-gate";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
);
const clerkPublishableKey = import.meta.env
  .VITE_CLERK_PUBLISHABLE_KEY as string;
  
if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthGate>
          <App />
        </AuthGate>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
);
