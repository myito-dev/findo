import { Card } from "@/components/ui/Card";
import { formatMXN } from "@/lib/format";
import { mockSavingsGoals } from "@/lib/mockData";

// Placeholder layout — no reference image for this screen yet.
export default function AhorrosPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ahorros</h1>
      {mockSavingsGoals.map((goal) => {
        const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
        return (
          <Card key={goal.id}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{goal.name}</p>
              {goal.isShared && <span className="pill bg-surface px-2.5 py-1 text-xs text-ink-secondary">Familiar</span>}
            </div>
            <p className="tabular text-2xl font-bold tracking-tight">
              {formatMXN(goal.currentAmount)} <span className="text-sm font-normal text-ink-muted">de {formatMXN(goal.targetAmount)}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
