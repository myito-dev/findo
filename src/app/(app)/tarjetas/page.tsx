import { AddCardForm } from "@/components/forms/AddCardForm";
import { EditCardTile } from "@/components/forms/EditCardTile";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { Card } from "@/components/ui/Card";
import { currentCycleStart, toISODate } from "@/lib/cycles";
import { daysUntil, formatMXN } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

export default async function TarjetasPage() {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);

  if (!user) return null;

  if (!familyId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Mis tarjetas</h1>
        <NoFamilyPrompt />
      </div>
    );
  }

  const { data: cards } = await supabase.from("cards").select("*").eq("owner_id", user.id).order("created_at");
  const cardList = cards ?? [];

  // Crédito: "Gastado este ciclo" — expense only, scoped to the statement
  // cycle (matches how a credit card actually works, it's debt not a balance).
  // Débito: "Tienes" — a real net balance (income minus expense, all time),
  // same idea as cash.
  const cardAmounts = new Map<string, { label: string; amount: number }>();
  for (const card of cardList) {
    if (card.card_type === "credito") {
      const cycleStart = toISODate(currentCycleStart(card.cut_off_day));
      const { data: txs } = await supabase
        .from("transactions")
        .select("amount")
        .eq("card_id", card.id)
        .eq("kind", "expense")
        .gte("occurred_at", cycleStart);
      cardAmounts.set(card.id, { label: "Gastado este ciclo", amount: (txs ?? []).reduce((s, t) => s + t.amount, 0) });
    } else {
      const { data: txs } = await supabase.from("transactions").select("amount, kind").eq("card_id", card.id);
      const balance = (txs ?? []).reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);
      cardAmounts.set(card.id, { label: "Tienes", amount: balance });
    }
  }

  const { data: cashTxs } = await supabase
    .from("transactions")
    .select("amount, kind")
    .eq("owner_id", user.id)
    .eq("payment_method", "efectivo");
  const cashBalance = (cashTxs ?? []).reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis tarjetas</h1>
        <AddCardForm />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardList.map((card) => {
          const cutOffIn = daysUntil(card.cut_off_day);
          const paymentIn = daysUntil(card.payment_due_day);
          return (
            <div key={card.id} className="space-y-3">
              <EditCardTile
                card={card}
                amountLabel={cardAmounts.get(card.id)?.label ?? "Gastado este ciclo"}
                amount={cardAmounts.get(card.id)?.amount ?? 0}
              />

              {card.card_type === "credito" ? (
                <Card className="!p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-ink-muted">Corte</p>
                      <p className="font-semibold">{card.cut_off_day ? `Día ${card.cut_off_day}` : "—"}</p>
                      {cutOffIn !== null && <p className="text-xs text-ink-muted">en {cutOffIn} días</p>}
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted">Pago</p>
                      <p className="font-semibold">{card.payment_due_day ? `Día ${card.payment_due_day}` : "—"}</p>
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

        {cardList.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-ink-secondary">Todavía no agregas tarjetas. Usa &quot;Agregar&quot; arriba para empezar.</p>
          </Card>
        )}

        <div className="rounded-3xl border border-dashed border-hairline p-5">
          <p className="text-xs text-ink-muted">Método</p>
          <p className="mb-8 text-sm font-semibold">Efectivo</p>
          <p className="text-xs text-ink-muted">Tienes</p>
          <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(cashBalance)}</p>
        </div>
      </div>
    </div>
  );
}
