import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

const CLERK_SESSION_PATH = /\/v1\/client\/sessions\/sess_/;
const INSTALLED_FLAG = "__kaziSessionRecoveryInstalled";

type SignOutFn = () => Promise<void>;

let recovered = false;
let pendingRecovery = false;
let signOutHandler: SignOutFn | null = null;

function clearClerkStorage() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("__clerk_") || key.startsWith("clerk-"))) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* localStorage unavailable (e.g. private mode) */
  }
}

function fireRecovery() {
  if (recovered) return;
  recovered = true;
  clearClerkStorage();
  if (signOutHandler) {
    signOutHandler().catch(() => window.location.reload());
  } else {
    pendingRecovery = true;
  }
}

function installInterceptor() {
  const w = window as typeof window & { [INSTALLED_FLAG]?: boolean };
  if (w[INSTALLED_FLAG]) return;
  w[INSTALLED_FLAG] = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const response = await originalFetch(input, init);
    if (!recovered && response.status === 404) {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (CLERK_SESSION_PATH.test(url)) fireRecovery();
    }
    return response;
  };
}

if (typeof window !== "undefined") installInterceptor();

export function useClerkSessionRecovery() {
  const clerk = useClerk();
  useEffect(() => {
    signOutHandler = () =>
      clerk.signOut({ redirectUrl: window.location.pathname });
    if (pendingRecovery) {
      pendingRecovery = false;
      signOutHandler().catch(() => window.location.reload());
    }
  }, [clerk]);
}
