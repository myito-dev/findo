// Placeholder data so every screen renders something representative before
// Supabase is wired up with real queries. Swap each of these for a real
// fetch once auth + the schema are live — shapes match the DB types.

export const mockUser = { displayName: "Steven" };

export const mockBalances = {
  efectivo: 5710,
  tarjetas: 13792,
  ahorros: 24558,
};

export const mockCards = [
  { id: "1", name: "Nu Mastercard", cardType: "credito" as const, last4: "4821", spentThisCycle: 3530, cutOffDay: 18, paymentDueDay: 5 },
  { id: "2", name: "BBVA Débito", cardType: "debito" as const, last4: "9012", spentThisCycle: 8450, cutOffDay: null, paymentDueDay: null },
  { id: "3", name: "Amex Gold", cardType: "credito" as const, last4: "1234", spentThisCycle: 1260, cutOffDay: 22, paymentDueDay: 10 },
];

export const mockCashflow = [
  { label: "Sem 1", income: 0, expense: 1200, saving: 0 },
  { label: "Sem 2", income: 24000, expense: 3400, saving: 5000 },
  { label: "Sem 3", income: 0, expense: 16021, saving: 0 },
  { label: "Sem 4", income: 0, expense: 2100, saving: 0 },
];

export const mockTransactions = [
  { id: "1", description: "PlayStation Network", category: "Suscripciones", amount: -44.48, occurredAt: "2026-03-29" },
  { id: "2", description: "Nómina", category: "Ingreso", amount: 280.0, occurredAt: "2026-03-28" },
  { id: "3", description: "Spotify", category: "Suscripciones", amount: -12.98, occurredAt: "2026-03-27" },
  { id: "4", description: "Amazon", category: "Compras", amount: -128.24, occurredAt: "2026-03-25" },
  { id: "5", description: "Freelance", category: "Ingreso", amount: 280.0, occurredAt: "2026-03-28" },
];

export const mockSavingsGoals = [
  { id: "1", name: "Viaje familiar", targetAmount: 50000, currentAmount: 20000, isShared: true },
  { id: "2", name: "Fondo de emergencia", targetAmount: 30000, currentAmount: 24558, isShared: false },
];
