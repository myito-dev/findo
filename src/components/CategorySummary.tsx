import { formatMXN } from "@/lib/format";

interface CategoryTotal {
  category: string;
  amount: number;
  percent: number;
}

function summarizeByCategory(transactions: { category: string; amount: number }[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  let grandTotal = 0;
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const amount = Math.abs(t.amount);
    totals.set(t.category, (totals.get(t.category) ?? 0) + amount);
    grandTotal += amount;
  }
  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount, percent: grandTotal > 0 ? amount / grandTotal : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

/** Mini expense breakdown by category — fills the Dashboard slot that used
 * to hold the (never-built) Asistente Findo placeholder. */
export function CategorySummary({ transactions }: { transactions: { category: string; amount: number }[] }) {
  const totals = summarizeByCategory(transactions);

  return (
    <div className="space-y-3">
      {totals.length === 0 ? (
        <p className="text-sm text-ink-muted">Sin gastos categorizados todavía.</p>
      ) : (
        totals.map((c, i) => (
          <div key={c.category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{c.category}</span>
              <span className="tabular font-semibold">{formatMXN(c.amount)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full"
                style={{ width: `${c.percent * 100}%`, background: i === 0 ? "var(--accent)" : "var(--ink-muted)" }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
