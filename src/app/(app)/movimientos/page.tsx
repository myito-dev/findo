import { Card } from "@/components/ui/Card";
import { formatDateShort, formatMXN } from "@/lib/format";
import { mockTransactions } from "@/lib/mockData";

// Placeholder layout — no reference image for this screen yet, so this stays
// simple/functional rather than guessing at a design to match "later".
export default function MovimientosPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Movimientos</h1>
      <Card>
        <div className="divide-y divide-hairline">
          {mockTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.description}</p>
                <p className="text-xs text-ink-muted">
                  {t.category} · {formatDateShort(t.occurredAt)}
                </p>
              </div>
              <span className={`tabular shrink-0 text-sm font-semibold ${t.amount > 0 ? "text-positive" : "text-ink"}`}>
                {formatMXN(t.amount, { showSign: true })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
