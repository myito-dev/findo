export function formatMXN(amount: number, opts: { showSign?: boolean } = {}): string {
  const formatted = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Math.abs(amount));
  if (!opts.showSign) return formatted;
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatDateShort(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
