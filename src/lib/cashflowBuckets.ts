export type CashflowPeriod = "semana" | "quincena" | "mes" | "3meses" | "ano";

interface Bucketable {
  occurred_at: string;
  kind: "income" | "expense";
  amount: number;
}

export interface CashflowBucket {
  label: string;
  income: number;
  expense: number;
  saving: number;
}

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Start date each period looks back from (inclusive), used both to scope
 * the DB query and to build buckets. */
export function cashflowRangeStart(period: CashflowPeriod): Date {
  const start = startOfDay(new Date());
  switch (period) {
    case "semana":
      start.setDate(start.getDate() - 6);
      break;
    case "quincena":
      start.setDate(start.getDate() - 14);
      break;
    case "mes":
      start.setDate(start.getDate() - 27);
      break;
    case "3meses":
      start.setDate(start.getDate() - 90);
      break;
    case "ano": {
      // First of the month, 11 months back, so the 12 monthly buckets below
      // land exactly on [11 months ago .. current month] inclusive.
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }
  }
  return start;
}

function dailyBuckets(start: Date, days: number, txs: Bucketable[]): CashflowBucket[] {
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dayEnd = new Date(day);
    dayEnd.setDate(day.getDate() + 1);
    const expense = txs
      .filter((t) => t.kind === "expense" && new Date(t.occurred_at) >= day && new Date(t.occurred_at) < dayEnd)
      .reduce((s, t) => s + t.amount, 0);
    return { label: WEEKDAY_SHORT[day.getDay()], income: 0, expense, saving: 0 };
  });
}

function weeklyBuckets(start: Date, weeks: number, txs: Bucketable[]): CashflowBucket[] {
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const expense = txs
      .filter((t) => t.kind === "expense" && new Date(t.occurred_at) >= weekStart && new Date(t.occurred_at) < weekEnd)
      .reduce((s, t) => s + t.amount, 0);
    return { label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`, income: 0, expense, saving: 0 };
  });
}

function monthlyBuckets(start: Date, months: number, txs: Bucketable[]): CashflowBucket[] {
  return Array.from({ length: months }, (_, i) => {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 1);
    const expense = txs
      .filter((t) => t.kind === "expense" && new Date(t.occurred_at) >= monthStart && new Date(t.occurred_at) < monthEnd)
      .reduce((s, t) => s + t.amount, 0);
    return { label: MONTH_SHORT[monthStart.getMonth()], income: 0, expense, saving: 0 };
  });
}

export function buildCashflowBuckets(period: CashflowPeriod, txs: Bucketable[]): CashflowBucket[] {
  const start = cashflowRangeStart(period);
  switch (period) {
    case "semana":
      return dailyBuckets(start, 7, txs);
    case "quincena":
      return dailyBuckets(start, 15, txs);
    case "mes":
      return weeklyBuckets(start, 4, txs);
    case "3meses":
      return weeklyBuckets(start, 13, txs);
    case "ano":
      return monthlyBuckets(start, 12, txs);
  }
}
