import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  addDays,
  daysBetween,
  daysInMonth,
  startOfMonth,
  startOfNextMonth,
  startOfWeek,
  today,
  toISODate,
  WEEKDAYS,
} from "./dates";

/* ------------------------------------------------------------------ */
/* Tipos serializables (sin Decimal) para pasar a componentes cliente */
/* ------------------------------------------------------------------ */

export type CategoryDTO = {
  id: string;
  name: string;
  color: string;
  icon: string;
  group: "NEED" | "WANT" | "SAVING" | "INCOME";
  type: "EXPENSE" | "INCOME";
  isCustom: boolean;
};

export type TransactionDTO = {
  id: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "TRANSFER" | "OTHER";
  isRecurring: boolean;
  tags: string[];
  notes: string | null;
  category: CategoryDTO;
};

export type CategoryTotal = CategoryDTO & { total: number };

const txInclude = { category: true } as const;
type TxWithCategory = Prisma.TransactionGetPayload<{ include: typeof txInclude }>;

function toCategoryDTO(c: TxWithCategory["category"]): CategoryDTO {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    group: c.group,
    type: c.type,
    isCustom: c.userId !== null,
  };
}

function toTransactionDTO(t: TxWithCategory): TransactionDTO {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    date: toISODate(t.date),
    description: t.description,
    paymentMethod: t.paymentMethod,
    isRecurring: t.isRecurring,
    tags: t.tags,
    notes: t.notes,
    category: toCategoryDTO(t.category),
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

export async function getCategories(userId: string): Promise<CategoryDTO[]> {
  const cats = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return cats.map(toCategoryDTO);
}

/* ------------------------------------------------------------------ */
/* Transacciones                                                       */
/* ------------------------------------------------------------------ */

export type TransactionFilters = {
  type?: string;
  categoryId?: string;
  month?: string; // YYYY-MM
  q?: string;
};

export async function getTransactions(userId: string, filters: TransactionFilters = {}) {
  const where: Prisma.TransactionWhereInput = { userId };
  if (filters.type === "EXPENSE" || filters.type === "INCOME") where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.month && /^\d{4}-\d{2}$/.test(filters.month)) {
    const [y, m] = filters.month.split("-").map(Number);
    const from = new Date(Date.UTC(y, m - 1, 1));
    where.date = { gte: from, lt: startOfNextMonth(from) };
  }
  if (filters.q) {
    where.OR = [
      { description: { contains: filters.q, mode: "insensitive" } },
      { notes: { contains: filters.q, mode: "insensitive" } },
      { tags: { has: filters.q.toLowerCase() } },
    ];
  }
  const rows = await prisma.transaction.findMany({
    where,
    include: txInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 500,
  });
  return rows.map(toTransactionDTO);
}

export async function getRecentTransactions(userId: string, take = 6) {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    include: txInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
  });
  return rows.map(toTransactionDTO);
}

async function getRange(userId: string, from: Date, to: Date) {
  const rows = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lt: to } },
    include: txInclude,
  });
  return rows.map(toTransactionDTO);
}

function totals(txs: TransactionDTO[]) {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "INCOME") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense };
}

function byCategory(txs: TransactionDTO[], type: "EXPENSE" | "INCOME" = "EXPENSE"): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const t of txs) {
    if (t.type !== type) continue;
    const cur = map.get(t.category.id) ?? { ...t.category, total: 0 };
    cur.total += t.amount;
    map.set(t.category.id, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/* ------------------------------------------------------------------ */
/* Resumen mensual                                                     */
/* ------------------------------------------------------------------ */

export async function getMonthSummary(userId: string, ref: Date = today()) {
  const from = startOfMonth(ref);
  const to = startOfNextMonth(ref);
  const prevFrom = startOfMonth(addDays(from, -1));

  const [txs, prevTxs] = await Promise.all([getRange(userId, from, to), getRange(userId, prevFrom, from)]);
  const { income, expense } = totals(txs);
  const prev = totals(prevTxs);
  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const isCurrentMonth = from.getTime() === startOfMonth(today()).getTime();
  const elapsedDays = isCurrentMonth ? ref.getUTCDate() : daysInMonth(ref);
  const avgDaily = elapsedDays > 0 ? expense / elapsedDays : 0;

  // Gasto por día de la semana
  const weekdayTotals = Array(7).fill(0) as number[];
  for (const t of txs) {
    if (t.type !== "EXPENSE") continue;
    const dow = (new Date(t.date + "T00:00:00Z").getUTCDay() + 6) % 7;
    weekdayTotals[dow] += t.amount;
  }
  const busiestIdx = weekdayTotals.indexOf(Math.max(...weekdayTotals));
  const weekendShare = expense > 0 ? ((weekdayTotals[5] + weekdayTotals[6]) / expense) * 100 : 0;

  const expenses = txs.filter((t) => t.type === "EXPENSE");
  const biggestExpense = expenses.sort((a, b) => b.amount - a.amount)[0] ?? null;

  // Reparto 50/30/20 sobre ingresos
  const groupTotals = { NEED: 0, WANT: 0, SAVING: 0 };
  for (const t of txs) {
    if (t.type === "EXPENSE" && t.category.group !== "INCOME") groupTotals[t.category.group] += t.amount;
  }

  return {
    month: toISODate(from).slice(0, 7),
    income,
    expense,
    balance,
    savingsRate,
    prevIncome: prev.income,
    prevExpense: prev.expense,
    expenseChange: pctChange(expense, prev.expense),
    incomeChange: pctChange(income, prev.income),
    avgDaily,
    projectedExpense: avgDaily * daysInMonth(ref),
    transactionCount: txs.length,
    byCategory: byCategory(txs),
    weekdayTotals: weekdayTotals.map((total, i) => ({ day: WEEKDAYS[i].slice(0, 3), total })),
    busiestWeekday: expense > 0 ? WEEKDAYS[busiestIdx] : null,
    weekendShare,
    biggestExpense,
    groupTotals,
    recurringTotal: expenses.filter((t) => t.isRecurring).reduce((s, t) => s + t.amount, 0),
  };
}

export type MonthSummary = Awaited<ReturnType<typeof getMonthSummary>>;

/* ------------------------------------------------------------------ */
/* Comparación semana a semana                                         */
/* ------------------------------------------------------------------ */

export async function getWeekComparison(userId: string) {
  const t = today();
  const thisStart = startOfWeek(t);
  const lastStart = addDays(thisStart, -7);
  const elapsed = daysBetween(thisStart, t) + 1; // días transcurridos (1..7)

  const [thisWeek, lastWeek] = await Promise.all([
    getRange(userId, thisStart, addDays(thisStart, 7)),
    getRange(userId, lastStart, thisStart),
  ]);
  // Mismo periodo de la semana pasada (comparación justa)
  const lastWeekSamePeriod = lastWeek.filter((x) => x.date < toISODate(addDays(lastStart, elapsed)));

  const cur = totals(thisWeek);
  const prevFull = totals(lastWeek);
  const prevSame = totals(lastWeekSamePeriod);

  const curCats = byCategory(thisWeek);
  const prevCats = byCategory(lastWeek);
  const allIds = new Set([...curCats.map((c) => c.id), ...prevCats.map((c) => c.id)]);
  const categories = [...allIds]
    .map((id) => {
      const c = curCats.find((x) => x.id === id);
      const p = prevCats.find((x) => x.id === id);
      const base = (c ?? p)!;
      const thisTotal = c?.total ?? 0;
      const lastTotal = p?.total ?? 0;
      return { ...base, thisWeek: thisTotal, lastWeek: lastTotal, change: pctChange(thisTotal, lastTotal) };
    })
    .sort((a, b) => b.thisWeek + b.lastWeek - (a.thisWeek + a.lastWeek));

  return {
    weekStart: toISODate(thisStart),
    elapsedDays: elapsed,
    thisWeekExpense: cur.expense,
    thisWeekIncome: cur.income,
    lastWeekExpense: prevFull.expense,
    lastWeekSamePeriodExpense: prevSame.expense,
    change: pctChange(cur.expense, prevSame.expense),
    categories,
  };
}

export type WeekComparison = Awaited<ReturnType<typeof getWeekComparison>>;

/* ------------------------------------------------------------------ */
/* Tendencia semanal (SQL con date_trunc)                              */
/* ------------------------------------------------------------------ */

export async function getWeeklyTrend(userId: string, weeks = 8) {
  const thisStart = startOfWeek(today());
  const from = addDays(thisStart, -7 * (weeks - 1));

  const rows = await prisma.$queryRaw<{ week: Date; type: "EXPENSE" | "INCOME"; total: Prisma.Decimal }[]>`
    SELECT date_trunc('week', "date")::date AS week, "type", SUM(amount) AS total
    FROM transactions
    WHERE user_id = ${userId} AND "date" >= ${from}::date
    GROUP BY 1, 2
    ORDER BY 1
  `;

  const series = Array.from({ length: weeks }, (_, i) => {
    const start = addDays(from, i * 7);
    return { week: toISODate(start), label: "", expense: 0, income: 0 };
  });
  for (const r of rows) {
    const key = toISODate(r.week);
    const point = series.find((s) => s.week === key);
    if (!point) continue;
    if (r.type === "EXPENSE") point.expense = Number(r.total);
    else point.income = Number(r.total);
  }
  for (const s of series) {
    const d = new Date(s.week + "T00:00:00Z");
    s.label = new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", timeZone: "UTC" }).format(d);
  }
  return series;
}

/* ------------------------------------------------------------------ */
/* Metas de ahorro                                                     */
/* ------------------------------------------------------------------ */

export async function getGoals(userId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    include: { contributions: { orderBy: { date: "desc" } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const t = today();
  return goals.map((g) => {
    const saved = g.contributions.reduce((s, c) => s + Number(c.amount), 0);
    const target = Number(g.targetAmount);
    const remaining = Math.max(target - saved, 0);
    const daysLeft = g.deadline ? daysBetween(t, g.deadline) : null;
    const weeksLeft = daysLeft !== null ? Math.max(daysLeft / 7, 0) : null;
    const weeklyNeeded = weeksLeft !== null && weeksLeft > 0 ? remaining / weeksLeft : null;
    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      target,
      saved,
      remaining,
      progress: target > 0 ? Math.min((saved / target) * 100, 100) : 0,
      deadline: g.deadline ? toISODate(g.deadline) : null,
      daysLeft,
      weeklyNeeded,
      status: g.status,
      contributions: g.contributions.map((c) => ({
        id: c.id,
        amount: Number(c.amount),
        date: toISODate(c.date),
        note: c.note,
      })),
    };
  });
}

export type GoalDTO = Awaited<ReturnType<typeof getGoals>>[number];

/* ------------------------------------------------------------------ */
/* Presupuestos                                                        */
/* ------------------------------------------------------------------ */

export async function getBudgets(userId: string) {
  const from = startOfMonth(today());
  const to = startOfNextMonth(today());
  const [budgets, spent] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, include: { category: true } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
  ]);
  return budgets
    .map((b) => {
      const s = Number(spent.find((x) => x.categoryId === b.categoryId)?._sum.amount ?? 0);
      const limit = Number(b.monthlyLimit);
      const pct = limit > 0 ? (s / limit) * 100 : 0;
      return {
        id: b.id,
        category: toCategoryDTO(b.category),
        limit,
        spent: s,
        remaining: limit - s,
        pct,
        status: pct >= 100 ? "over" : pct >= 80 ? "warning" : "ok",
      } as const;
    })
    .sort((a, b) => b.pct - a.pct);
}

export type BudgetDTO = Awaited<ReturnType<typeof getBudgets>>[number];

export async function getRandomTip() {
  const count = await prisma.tip.count();
  if (count === 0) return null;
  // Consejo "del día": determinista según la fecha
  const idx = Math.floor(today().getTime() / 86_400_000) % count;
  return prisma.tip.findFirst({ skip: idx, orderBy: { title: "asc" } });
}

export async function getAllTips() {
  return prisma.tip.findMany({ orderBy: { category: "asc" } });
}
