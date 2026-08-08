export function formatMXN(amount: number, opts: { showSign?: boolean } = {}): string {
  const formatted = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Math.abs(amount));
  if (!opts.showSign) return formatted;
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatDateShort(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

/** Days until the next occurrence of a day-of-month (e.g. a card's cut-off
 * or payment day), rolling over to next month if it already passed. */
export function daysUntil(day: number | null): number | null {
  if (day == null) return null;
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), day);
  if (target < now) target.setMonth(target.getMonth() + 1);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}
