/**
 * Extracts a result from a PromiseSettledResult, providing fallback data
 * and source/confidence metadata.
 */
export function extractResult<T>(
  settled: PromiseSettledResult<T>,
  fallback: T,
  fallbackSource: string
): { data: T; source: string; confidence: string } {
  if (settled.status === "fulfilled") {
    return {
      data: settled.value,
      source: "live",
      confidence: "high",
    };
  }

  return {
    data: fallback,
    source: fallbackSource,
    confidence: "low",
  };
}

/**
 * Wraps a promise with a timeout. If the promise does not resolve
 * within the specified duration, it rejects with a TimeoutError.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TimeoutError: Operation timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
