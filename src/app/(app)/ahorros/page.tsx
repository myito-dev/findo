import { AddContributionForm } from "@/components/forms/AddContributionForm";
import { AddSavingsGoalForm } from "@/components/forms/AddSavingsGoalForm";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { Card } from "@/components/ui/Card";
import { formatMXN } from "@/lib/format";
import { forecastGoalCompletion } from "@/lib/predictions";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

export default async function AhorrosPage() {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);

  if (!user) return null;

  if (!familyId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Ahorros</h1>
        <NoFamilyPrompt />
      </div>
    );
  }

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .or(`owner_id.eq.${user.id},and(is_shared.eq.true,family_id.eq.${familyId})`)
    .order("created_at");

  const goalList = goals ?? [];
  const goalIds = goalList.map((g) => g.id);

  const contributionsByGoal = new Map<string, number>();
  const monthsElapsedByGoal = new Map<string, number>();
  if (goalIds.length > 0) {
    const { data: contributions } = await supabase.from("savings_contributions").select("goal_id, amount").in("goal_id", goalIds);
    for (const c of contributions ?? []) {
      contributionsByGoal.set(c.goal_id, (contributionsByGoal.get(c.goal_id) ?? 0) + c.amount);
    }
  }
  for (const g of goalList) {
    const monthsElapsed = Math.max(1, Math.round((new Date().getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    monthsElapsedByGoal.set(g.id, monthsElapsed);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ahorros</h1>
        <AddSavingsGoalForm />
      </div>

      {goalList.length === 0 && (
        <Card>
          <p className="text-sm text-ink-secondary">Todavía no tienes metas de ahorro. Crea una arriba.</p>
        </Card>
      )}

      {goalList.map((goal) => {
        const currentAmount = contributionsByGoal.get(goal.id) ?? 0;
        const target = goal.target_amount ?? 0;
        const pct = target > 0 ? Math.min(100, Math.round((currentAmount / target) * 100)) : 0;
        const forecast = forecastGoalCompletion(currentAmount, target, monthsElapsedByGoal.get(goal.id) ?? 1);

        return (
          <Card key={goal.id}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{goal.name}</p>
              {goal.is_shared && <span className="pill bg-surface px-2.5 py-1 text-xs text-ink-secondary">Familiar</span>}
            </div>
            <p className="tabular text-2xl font-bold tracking-tight">
              {formatMXN(currentAmount)} <span className="text-sm font-normal text-ink-muted">de {formatMXN(target)}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            {forecast.monthsRemaining !== null && forecast.monthsRemaining > 0 && (
              <p className="mt-3 text-xs text-ink-muted">
                A tu ritmo actual, la completas en ~{forecast.monthsRemaining} mes{forecast.monthsRemaining === 1 ? "" : "es"}
                {forecast.onTrack ? "" : " (ritmo lento)"}.
              </p>
            )}
            {goal.owner_id === user.id && <AddContributionForm goalId={goal.id} />}
          </Card>
        );
      })}
    </div>
  );
}
