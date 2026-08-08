/** Start of the current billing cycle for a card. Crédito cards cycle from
 * the day after their cut-off date; débito/cash "cycles" just fall back to
 * the start of the calendar month. */
export function currentCycleStart(cutOffDay: number | null): Date {
  const now = new Date();
  if (cutOffDay == null) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const cutOff = new Date(now.getFullYear(), now.getMonth(), cutOffDay);
  if (cutOff > now) cutOff.setMonth(cutOff.getMonth() - 1);
  cutOff.setDate(cutOff.getDate() + 1);
  return cutOff;
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
