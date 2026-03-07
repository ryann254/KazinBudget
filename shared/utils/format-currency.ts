const kesFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as Kenyan Shillings.
 * Returns a string like "KES 80,000".
 */
export function formatKES(amount: number): string {
  return kesFormatter.format(amount);
}
