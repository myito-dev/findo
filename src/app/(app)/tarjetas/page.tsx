import { Card } from "@/components/ui/Card";
import { PlusIcon } from "@/components/icons";
import { formatMXN } from "@/lib/format";
import { mockCards } from "@/lib/mockData";

function daysUntil(day: number | null): number | null {
  if (day == null) return null;
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), day);
  if (target < now) target.setMonth(target.getMonth() + 1);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export default function TarjetasPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis tarjetas</h1>
        <button type="button" className="pill flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          <PlusIcon className="h-4 w-4" />
          Agregar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCards.map((card, i) => {
          const cutOffIn = daysUntil(card.cutOffDay);
          const paymentIn = daysUntil(card.paymentDueDay);
          return (
            <div key={card.id} className="space-y-3">
              {/* Card face — first card featured in lime, matching the reference's balance card. */}
              <div className={`rounded-3xl p-5 ${i === 0 ? "bg-accent text-accent-ink" : "card"}`}>
                <div className="mb-8 flex items-center justify-between">
                  <span className={`text-xs ${i === 0 ? "text-accent-ink/70" : "text-ink-muted"}`}>
                    {card.cardType === "credito" ? "Crédito" : "Débito"}
                  </span>
                  <span className="text-xs font-medium">•••• {card.last4}</span>
                </div>
                <p className={`text-xs ${i === 0 ? "text-accent-ink/70" : "text-ink-muted"}`}>Gastado este ciclo</p>
                <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(card.spentThisCycle)}</p>
                <p className="mt-3 text-sm font-semibold">{card.name}</p>
              </div>

              {/* Statement dates — only meaningful for crédito. */}
              {card.cardType === "credito" ? (
                <Card className="!p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-ink-muted">Corte</p>
                      <p className="font-semibold">Día {card.cutOffDay}</p>
                      {cutOffIn !== null && <p className="text-xs text-ink-muted">en {cutOffIn} días</p>}
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">Pago</p>
                      <p className="font-semibold">Día {card.paymentDueDay}</p>
                      {paymentIn !== null && <p className="text-xs text-ink-muted">en {paymentIn} días</p>}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="!p-4">
                  <p className="text-xs text-ink-muted">Tarjeta de débito — sin fecha de corte/pago.</p>
                </Card>
              )}
            </div>
          );
        })}

        {/* Efectivo — not a real "card" row, but part of "¿en cuál tarjeta o en efectivo gasté?". */}
        <div className="rounded-3xl border border-dashed border-hairline p-5">
          <p className="text-xs text-ink-muted">Método</p>
          <p className="mb-8 text-sm font-semibold">Efectivo</p>
          <p className="text-xs text-ink-muted">Gastado este ciclo</p>
          <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(0)}</p>
        </div>
      </div>
    </div>
  );
}
