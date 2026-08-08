import { BalanceChips } from "@/components/BalanceChips";
import { MotionLink } from "@/components/MotionLink";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { PeriodSelector } from "@/components/PeriodSelector";
import { Card } from "@/components/ui/Card";
import { CashflowChart } from "@/components/CashflowChart";
import { CategorySummary } from "@/components/CategorySummary";
import { ArrowUpRightIcon, UsersIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { buildCashflowBuckets, cashflowRangeStart, type CashflowPeriod } from "@/lib/cashflowBuckets";
import { formatDateShort, formatMXN } from "@/lib/format";
import { forecastNextExpense } from "@/lib/predictions";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

const CASHFLOW_PERIODS: CashflowPeriod[] = ["semana", "quincena", "mes", "3meses", "ano"];

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function DashboardTabs({ active }: { active: "personal" | "familia" }) {
  return (
    <div className="glass-pill inline-flex items-center gap-1 rounded-full p-1">
      <MotionLink
        href="/"
        whileTap={{ scale: 0.96 }}
        className={cn("rounded-full px-4 py-1.5 text-sm font-medium", active === "personal" ? "bg-accent text-accent-ink" : "text-ink-secondary")}
      >
        Personal
      </MotionLink>
      <MotionLink
        href="/?view=familia"
        whileTap={{ scale: 0.96 }}
        className={cn("rounded-full px-4 py-1.5 text-sm font-medium", active === "familia" ? "bg-accent text-accent-ink" : "text-ink-secondary")}
      >
        Familia
      </MotionLink>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string; period?: string }> }) {
  const { view, period: periodParam } = await searchParams;
  const isFamily = view === "familia";
  const period: CashflowPeriod = CASHFLOW_PERIODS.includes(periodParam as CashflowPeriod) ? (periodParam as CashflowPeriod) : "mes";

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
  const today = new Date().toISOString().slice(0, 10);

  if (isFamily) {
    const { data: householdTotals } = await supabase.rpc("get_household_category_totals", {
      fam_id: familyId,
      from_date: monthStart,
      to_date: today,
    });

    const householdRows = householdTotals ?? [];
    const householdIncome = householdRows.filter((r) => r.kind === "income").reduce((s, r) => s + r.total, 0);
    const householdExpense = householdRows.filter((r) => r.kind === "expense").reduce((s, r) => s + r.total, 0);
    const householdByCategory = householdRows
      .filter((r) => r.kind === "expense")
      .map((r) => ({ category: r.category_name ?? "Sin categoría", amount: -r.total }))
      .sort((a, b) => a.amount - b.amount);

    const { data: sharedGoals } = await supabase
      .from("savings_goals")
      .select("id, name, target_amount")
      .eq("family_id", familyId)
      .eq("is_shared", true);
    const goalIds = (sharedGoals ?? []).map((g) => g.id);
    const contributionsByGoal = new Map<string, number>();
    if (goalIds.length > 0) {
      const { data: contributions } = await supabase.from("savings_contributions").select("goal_id, amount").in("goal_id", goalIds);
      for (const c of contributions ?? []) contributionsByGoal.set(c.goal_id, (contributionsByGoal.get(c.goal_id) ?? 0) + c.amount);
    }

    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Familia</h1>
          <DashboardTabs active="familia" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <Card className="sm:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink">
                <UsersIcon className="h-4 w-4" />
              </span>
              <span className="text-sm text-ink-muted">Compartido este mes</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-muted">Ingresos</p>
                <p className="tabular text-2xl font-bold text-positive">{formatMXN(householdIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Gastos</p>
                <p className="tabular text-2xl font-bold">{formatMXN(householdExpense)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Solo se muestran totales — nunca los movimientos individuales de otros miembros.
            </p>
          </Card>

          <Card>
            <span className="mb-3 block text-sm text-ink-muted">Gasto compartido por categoría</span>
            {householdByCategory.length === 0 ? (
              <p className="text-sm text-ink-secondary">Nadie ha compartido gastos este mes.</p>
            ) : (
              <CategorySummary transactions={householdByCategory} />
            )}
          </Card>
        </div>

        <Card>
          <span className="mb-3 block text-sm text-ink-muted">Metas familiares</span>
          {(sharedGoals ?? []).length === 0 ? (
            <p className="text-sm text-ink-secondary">No hay metas de ahorro familiares todavía.</p>
          ) : (
            <div className="space-y-3">
              {(sharedGoals ?? []).map((g) => {
                const current = contributionsByGoal.get(g.id) ?? 0;
                const target = g.target_amount ?? 0;
                const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{g.name}</span>
                      <span className="tabular text-ink-muted">
                        {formatMXN(current)} / {formatMXN(target)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  }

  const cashflowStart = toISODate(cashflowRangeStart(period));

  const [{ data: cards }, { data: monthTxs }, { data: cashflowTxs }, { data: recentTxs }, { data: categories }, { data: goals }] =
    await Promise.all([
      supabase.from("cards").select("id, name, last4").eq("owner_id", user.id).order("created_at"),
      supabase.from("transactions").select("amount, kind, payment_method, category_id, occurred_at, card_id").eq("owner_id", user.id).gte("occurred_at", monthStart),
      supabase.from("transactions").select("occurred_at, kind, amount").eq("owner_id", user.id).gte("occurred_at", cashflowStart),
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
  // Efectivo and Tarjetas both net income minus expense for their payment
  // method, so no transaction — income included — silently falls out of the total.
  const monthList = monthTxs ?? [];
  const efectivo = monthList
    .filter((t) => t.payment_method === "efectivo")
    .reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);
  const tarjetas = monthList
    .filter((t) => t.payment_method === "tarjeta")
    .reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);

  const goalIds = (goals ?? []).map((g) => g.id);
  let ahorros = 0;
  if (goalIds.length > 0) {
    const { data: contributions } = await supabase.from("savings_contributions").select("amount").in("goal_id", goalIds);
    ahorros = (contributions ?? []).reduce((s, c) => s + c.amount, 0);
  }
  const total = efectivo + tarjetas + ahorros;

  const cashflow = buildCashflowBuckets(period, cashflowTxs ?? []);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hola, {displayName}</h1>
        <DashboardTabs active="personal" />
      </div>

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
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">Flujo de efectivo</span>
                <PeriodSelector current={period} />
              </div>
              <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(cashflow.reduce((s, w) => s + w.expense, 0))}</p>
            </div>
            {forecast && (
              <div className="pill bg-surface px-3 py-1.5 text-right">
                <p className="text-[10px] text-ink-muted">Predicción</p>
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
