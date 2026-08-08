import { BalanceChips } from "@/components/BalanceChips";
import { MotionLink } from "@/components/MotionLink";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { Card } from "@/components/ui/Card";
import { CashflowChart } from "@/components/CashflowChart";
import { CategorySummary } from "@/components/CategorySummary";
import { ArrowUpRightIcon } from "@/components/icons";
import { formatDateShort, formatMXN } from "@/lib/format";
import { forecastNextExpense } from "@/lib/predictions";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

/** Monday-anchored start of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
  const displayName = profile?.display_name ?? "";

  if (!familyId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hola, {displayName}</h1>
        <NoFamilyPrompt />
      </div>
    );
  }

  const monthStart = startOfMonthISO();

  const [{ data: cards }, { data: monthTxs }, { data: recentTxs }, { data: categories }, { data: goals }] = await Promise.all([
    supabase.from("cards").select("id, name, last4").eq("owner_id", user.id).order("created_at"),
    supabase.from("transactions").select("amount, kind, payment_method, category_id, occurred_at, card_id").eq("owner_id", user.id).gte("occurred_at", monthStart),
    supabase
      .from("transactions")
      .select("id, amount, kind, description, occurred_at, category_id")
      .eq("owner_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase.from("categories").select("id, name").eq("family_id", familyId),
    supabase.from("savings_goals").select("id").eq("owner_id", user.id),
  ]);

  // Balances (rough MVP model — no stored account balances, derived from transactions).
  const monthList = monthTxs ?? [];
  const efectivo = monthList
    .filter((t) => t.payment_method === "efectivo")
    .reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);
  const tarjetas = monthList.filter((t) => t.payment_method === "tarjeta" && t.kind === "expense").reduce((s, t) => s + t.amount, 0);

  const goalIds = (goals ?? []).map((g) => g.id);
  let ahorros = 0;
  if (goalIds.length > 0) {
    const { data: contributions } = await supabase.from("savings_contributions").select("amount").in("goal_id", goalIds);
    ahorros = (contributions ?? []).reduce((s, c) => s + c.amount, 0);
  }
  const total = efectivo + tarjetas + ahorros;

  // Cashflow — last 4 Monday-anchored weeks, oldest first.
  const now = new Date();
  const weekStarts = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(startOfWeek(now));
    d.setDate(d.getDate() - (3 - i) * 7);
    return d;
  });
  const cashflow = weekStarts.map((weekStart, i) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const expense = monthList
      .filter((t) => t.kind === "expense" && new Date(t.occurred_at) >= weekStart && new Date(t.occurred_at) < weekEnd)
      .reduce((s, t) => s + t.amount, 0);
    return { label: `Sem ${i + 1}`, income: 0, expense, saving: 0 };
  });
  const forecast = forecastNextExpense(cashflow.map((w) => w.expense));

  // Category breakdown (this month, expenses only).
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const categorySummaryInput = monthList
    .filter((t) => t.kind === "expense")
    .map((t) => ({
      category: (t.category_id && categoryNameById.get(t.category_id)) || "Sin categoría",
      amount: -t.amount,
    }));

  // Cards mini-list — total spent this month per card.
  const spentByCard = new Map<string, number>();
  for (const t of monthList) {
    if (t.kind !== "expense" || !t.card_id) continue;
    spentByCard.set(t.card_id, (spentByCard.get(t.card_id) ?? 0) + t.amount);
  }

  const recentList = recentTxs ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hola, {displayName}</h1>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">Balance total</span>
            <span className="pill bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">MXN</span>
          </div>
          <p className="tabular mt-2 text-3xl font-bold tracking-tight">{formatMXN(total)}</p>
          <BalanceChips
            chips={[
              { label: "Efectivo", value: efectivo, icon: "wallet" },
              { label: "Tarjetas", value: tarjetas, icon: "card" },
              { label: "Ahorros", value: ahorros, icon: "piggy" },
            ]}
          />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-ink-muted">Tarjetas</span>
            <MotionLink
              href="/tarjetas"
              aria-label="Ver tarjetas"
              whileTap={{ scale: 0.9 }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-surface"
            >
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </MotionLink>
          </div>
          {(cards ?? []).length === 0 ? (
            <p className="text-sm text-ink-secondary">Todavía no agregas tarjetas.</p>
          ) : (
            <div className="space-y-1">
              {(cards ?? []).map((card, i) => (
                <div key={card.id} className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${i === 0 ? "bg-accent text-accent-ink" : ""}`}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{card.name}</p>
                    <p className={`text-xs ${i === 0 ? "text-accent-ink/70" : "text-ink-muted"}`}>•••• {card.last4 ?? "----"}</p>
                  </div>
                  <span className="tabular shrink-0 text-sm font-semibold">{formatMXN(spentByCard.get(card.id) ?? 0)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <span className="mb-3 block text-sm text-ink-muted">Gasto por categoría</span>
          <CategorySummary transactions={categorySummaryInput} />
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Card className="sm:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-sm text-ink-muted">Flujo de efectivo</span>
              <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(cashflow.reduce((s, w) => s + w.expense, 0))}</p>
            </div>
            {forecast && (
              <div className="pill bg-surface px-3 py-1.5 text-right">
                <p className="text-[10px] text-ink-muted">Próxima semana (predicción)</p>
                <p className="tabular text-xs font-semibold">
                  {formatMXN(forecast.nextValue)}{" "}
                  <span className={forecast.trend === "up" ? "text-negative" : forecast.trend === "down" ? "text-positive" : "text-ink-muted"}>
                    {forecast.trend === "up" ? "▲" : forecast.trend === "down" ? "▼" : "–"}
                    {Math.abs(Math.round(forecast.changePercent))}%
                  </span>
                </p>
              </div>
            )}
          </div>
          <CashflowChart data={cashflow} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-ink-muted">Movimientos</span>
            <MotionLink href="/movimientos" whileTap={{ scale: 0.94 }} className="text-xs font-medium text-accent">
              Ver todos
            </MotionLink>
          </div>
          {recentList.length === 0 ? (
            <p className="text-sm text-ink-secondary">Sin movimientos todavía.</p>
          ) : (
            <div className="space-y-3">
              {recentList.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {t.description || (t.category_id && categoryNameById.get(t.category_id)) || "Movimiento"}
                    </p>
                    <p className="text-xs text-ink-muted">{formatDateShort(t.occurred_at)}</p>
                  </div>
                  <span className={`tabular shrink-0 text-sm font-semibold ${t.kind === "income" ? "text-positive" : "text-ink"}`}>
                    {formatMXN(t.amount, { showSign: t.kind === "income" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
