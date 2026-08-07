import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CashflowChart } from "@/components/CashflowChart";
import { ArrowUpRightIcon, SparkleIcon } from "@/components/icons";
import { formatDateShort, formatMXN } from "@/lib/format";
import { mockBalances, mockCards, mockCashflow, mockTransactions, mockUser } from "@/lib/mockData";

export default function DashboardPage() {
  const total = mockBalances.efectivo + mockBalances.tarjetas + mockBalances.ahorros;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hola, {mockUser.displayName}</h1>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {/* Balance total — 3 connected chips (efectivo / tarjetas / ahorros), like the reference's Visa/Mastercard/Savings row. */}
        <Card className="sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">Balance total</span>
            <span className="pill bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">MXN</span>
          </div>
          <p className="tabular mt-2 text-3xl font-bold tracking-tight">{formatMXN(total)}</p>
          <div className="mt-5 flex items-center justify-between gap-2">
            {[
              { label: "Efectivo", value: mockBalances.efectivo },
              { label: "Tarjetas", value: mockBalances.tarjetas, featured: true },
              { label: "Ahorros", value: mockBalances.ahorros },
            ].map((chip) => (
              <div
                key={chip.label}
                className={`flex flex-1 flex-col items-center gap-1 rounded-full py-3 text-center ${
                  chip.featured ? "bg-accent text-accent-ink" : "bg-surface text-ink"
                }`}
              >
                <span className="tabular text-sm font-bold">{formatMXN(chip.value)}</span>
                <span className={`text-[10px] ${chip.featured ? "text-accent-ink/70" : "text-ink-muted"}`}>{chip.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" className="pill flex-1 border border-hairline py-2.5 text-sm font-medium">
              Recibir
            </button>
            <button type="button" className="pill flex-1 border border-hairline py-2.5 text-sm font-medium">
              Enviar
            </button>
          </div>
        </Card>

        {/* Tarjetas — stands in for the reference's "Investments" slot. */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-ink-muted">Tarjetas</span>
            <Link href="/tarjetas" aria-label="Ver tarjetas" className="flex h-7 w-7 items-center justify-center rounded-full bg-surface">
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-1">
            {mockCards.map((card, i) => (
              <div key={card.id} className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${i === 1 ? "bg-accent text-accent-ink" : ""}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{card.name}</p>
                  <p className={`text-xs ${i === 1 ? "text-accent-ink/70" : "text-ink-muted"}`}>•••• {card.last4}</p>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold">{formatMXN(card.spentThisCycle)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Asistente IA — visual placeholder for now, not wired up yet. */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink">
              <SparkleIcon className="h-4 w-4" />
            </span>
            <span className="text-sm text-ink-muted">Asistente Findo</span>
          </div>
          <p className="mb-4 text-sm text-ink-secondary">¿En qué te ayudo hoy?</p>
          <div className="pill flex items-center justify-between border border-hairline px-3 py-2.5 text-sm text-ink-muted">
            Pregunta algo…
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Card className="sm:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-sm text-ink-muted">Flujo de efectivo</span>
              <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(mockCashflow.reduce((s, w) => s + w.expense, 0))}</p>
            </div>
          </div>
          <CashflowChart data={mockCashflow} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-ink-muted">Movimientos</span>
            <Link href="/movimientos" className="text-xs font-medium text-accent">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {mockTransactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-ink-muted">{formatDateShort(t.occurredAt)}</p>
                </div>
                <span className={`tabular shrink-0 text-sm font-semibold ${t.amount > 0 ? "text-positive" : "text-ink"}`}>
                  {formatMXN(t.amount, { showSign: true })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
