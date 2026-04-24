/**
 * Small typed localStorage helpers used by unauthenticated users.
 *
 * All operations swallow SecurityError / QuotaExceededError (and any other
 * storage failure) and fall back to an in-memory noop so Safari private
 * mode, embedded frames with disabled storage, or exceeded quotas cannot
 * crash the app.
 */

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* swallow SecurityError / QuotaExceededError */
  }
}

export function removeKey(key: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* swallow SecurityError */
  }
}
