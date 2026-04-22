import { useEffect, useRef, useState } from "react";

type RecalcCallback = (fingerprint: string) => unknown | Promise<unknown>;

type Options = {
  enabled: boolean;
  delayMs?: number;
};

export function useDebouncedRecalc(
  fingerprint: string,
  callback: RecalcCallback,
  { enabled, delayMs = 600 }: Options,
) {
  const [lastFired, setLastFired] = useState<string | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;
    if (fingerprint === lastFired) return;

    const timer = window.setTimeout(() => {
      setLastFired(fingerprint);
      void callbackRef.current(fingerprint);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fingerprint, enabled, delayMs, lastFired]);

  const isPending = enabled && fingerprint !== lastFired;
  return { isPending };
}
