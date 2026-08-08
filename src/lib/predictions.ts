export interface ExpenseForecast {
  nextValue: number;
  trend: "up" | "down" | "flat";
  changePercent: number;
}

/** Simple linear regression (least squares) over weekly expense history,
 * projecting the next period. Works on as few as 2 data points — accuracy
 * improves once real transactions replace the mock history. Designed now,
 * ahead of real data, so it's ready to wire to live Supabase queries. */
export function forecastNextExpense(weeklyExpenses: number[]): ExpenseForecast | null {
  const n = weeklyExpenses.length;
  if (n < 2) return null;

  const meanX = (n - 1) / 2;
  const meanY = weeklyExpenses.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - meanX) * (weeklyExpenses[i] - meanY);
    denominator += (i - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  const nextValue = Math.max(0, intercept + slope * n);
  const lastValue = weeklyExpenses[n - 1];
  const changePercent = lastValue > 0 ? ((nextValue - lastValue) / lastValue) * 100 : 0;
  const trend = Math.abs(changePercent) < 3 ? "flat" : changePercent > 0 ? "up" : "down";

  return { nextValue, trend, changePercent };
}

export interface GoalForecast {
  monthsRemaining: number | null;
  onTrack: boolean;
}

/** Projects months remaining to hit a savings goal, assuming the current
 * progress ratio continues at a steady monthly pace. `monthsElapsed` is how
 * long the goal has existed — pass real goal-creation dates once available;
 * mock data uses a placeholder until then. */
export function forecastGoalCompletion(currentAmount: number, targetAmount: number, monthsElapsed: number): GoalForecast {
  if (currentAmount >= targetAmount) return { monthsRemaining: 0, onTrack: true };
  if (monthsElapsed <= 0 || currentAmount <= 0) return { monthsRemaining: null, onTrack: false };

  const monthlyRate = currentAmount / monthsElapsed;
  const remaining = targetAmount - currentAmount;
  const monthsRemaining = Math.ceil(remaining / monthlyRate);

  return { monthsRemaining, onTrack: monthsRemaining <= 12 };
}
