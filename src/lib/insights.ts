import type { BudgetDTO, GoalDTO, MonthSummary, WeekComparison } from "./analytics";
import { formatMoney, formatPercent } from "./format";

export type Insight = {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  icon: string; // nombre de icono (ver CategoryIcon)
  title: string;
  body: string;
};

/**
 * Motor de reglas de consejos personalizados.
 * Cada regla analiza los datos del usuario y, si aplica, genera un consejo accionable.
 */
export function generateInsights(input: {
  month: MonthSummary;
  week: WeekComparison;
  goals: GoalDTO[];
  budgets: BudgetDTO[];
  currency: string;
}): Insight[] {
  const { month, week, goals, budgets, currency } = input;
  const $ = (n: number) => formatMoney(n, currency);
  const out: Insight[] = [];

  // 1. Sin registros
  if (month.transactionCount === 0) {
    out.push({
      id: "empty",
      tone: "info",
      icon: "sparkles",
      title: "Empieza registrando tus movimientos",
      body: "Registra tus gastos e ingresos durante una semana. Con esos datos BeHu podrá darte consejos personalizados.",
    });
    return out;
  }

  // 2. Variación semanal
  if (week.change !== null && week.lastWeekSamePeriodExpense > 0) {
    if (week.change > 20) {
      out.push({
        id: "week-up",
        tone: "warning",
        icon: "trending-up",
        title: `Gastas ${formatPercent(week.change)} más que la semana pasada`,
        body: `Llevas ${$(week.thisWeekExpense)} esta semana frente a ${$(week.lastWeekSamePeriodExpense)} en el mismo periodo de la semana anterior. Revisa qué gastos podrías posponer.`,
      });
    } else if (week.change < -10) {
      out.push({
        id: "week-down",
        tone: "success",
        icon: "trending-down",
        title: `¡Bien! Gastas ${formatPercent(week.change)} menos que la semana pasada`,
        body: `Has ahorrado ${$(week.lastWeekSamePeriodExpense - week.thisWeekExpense)} respecto al mismo periodo de la semana anterior. Considera mover esa diferencia a una meta.`,
      });
    }
  }

  // 3. Categoría que más creció
  const growing = week.categories
    .filter((c) => c.lastWeek > 0 && c.change !== null && c.change > 30 && c.thisWeek - c.lastWeek > 0)
    .sort((a, b) => b.thisWeek - b.lastWeek - (a.thisWeek - a.lastWeek))[0];
  if (growing) {
    out.push({
      id: "cat-growth",
      tone: "warning",
      icon: growing.icon,
      title: `${growing.name}: ${formatPercent(growing.change!, true)} esta semana`,
      body: `Has gastado ${$(growing.thisWeek)} en ${growing.name.toLowerCase()} frente a ${$(growing.lastWeek)} la semana pasada.`,
    });
  }

  // 4. Tasa de ahorro
  if (month.income > 0) {
    if (month.savingsRate < 0) {
      out.push({
        id: "negative",
        tone: "danger",
        icon: "alert-triangle",
        title: "Este mes gastas más de lo que ingresas",
        body: `Tu balance es ${$(month.balance)}. Identifica 2 o 3 gastos de la categoría "Deseos" que puedas recortar este mes.`,
      });
    } else if (month.savingsRate < 10) {
      out.push({
        id: "low-savings",
        tone: "warning",
        icon: "piggy-bank",
        title: `Tu tasa de ahorro es del ${formatPercent(month.savingsRate)}`,
        body: "Los expertos recomiendan ahorrar al menos el 20 % de tus ingresos. Prueba a «pagarte primero»: aparta el ahorro el mismo día que cobras.",
      });
    } else if (month.savingsRate >= 20) {
      out.push({
        id: "great-savings",
        tone: "success",
        icon: "award",
        title: `¡Ahorras el ${formatPercent(month.savingsRate)} de tus ingresos!`,
        body: "Superas la recomendación del 20 %. Si aún no tienes un fondo de emergencia de 3–6 meses de gastos, es buen momento para crearlo.",
      });
    }

    // 5. Regla 50/30/20
    const wantsPct = (month.groupTotals.WANT / month.income) * 100;
    const needsPct = (month.groupTotals.NEED / month.income) * 100;
    if (wantsPct > 30) {
      out.push({
        id: "wants",
        tone: "warning",
        icon: "shopping-bag",
        title: `Los deseos suponen el ${formatPercent(wantsPct)} de tus ingresos`,
        body: `La regla 50/30/20 sugiere un máximo del 30 %. Reducirlo al 30 % liberaría ${$(month.groupTotals.WANT - month.income * 0.3)} este mes.`,
      });
    }
    if (needsPct > 60) {
      out.push({
        id: "needs",
        tone: "info",
        icon: "home",
        title: `Tus necesidades ocupan el ${formatPercent(needsPct)} de tus ingresos`,
        body: "Revisa gastos fijos como plan de móvil, suscripciones o transporte: a veces hay alternativas más baratas.",
      });
    }
  }

  // 6. Presupuestos
  for (const b of budgets) {
    if (b.status === "over") {
      out.push({
        id: `budget-over-${b.id}`,
        tone: "danger",
        icon: b.category.icon,
        title: `Superaste el presupuesto de ${b.category.name}`,
        body: `Has gastado ${$(b.spent)} de ${$(b.limit)} (${formatPercent(b.pct)}).`,
      });
    } else if (b.status === "warning") {
      out.push({
        id: `budget-warn-${b.id}`,
        tone: "warning",
        icon: b.category.icon,
        title: `Estás al ${formatPercent(b.pct)} del presupuesto de ${b.category.name}`,
        body: `Te quedan ${$(b.remaining)} para el resto del mes.`,
      });
    }
  }

  // 7. Meta + recorte sugerido
  const goal = goals.find((g) => g.status === "ACTIVE" && g.remaining > 0);
  const topWant = month.byCategory.find((c) => c.group === "WANT");
  if (goal && topWant) {
    const weeklyCut = (topWant.total * 0.2) / 4.3;
    const weeksSaved = goal.weeklyNeeded && goal.weeklyNeeded > 0 ? goal.remaining / goal.weeklyNeeded - goal.remaining / (goal.weeklyNeeded + weeklyCut) : null;
    out.push({
      id: "goal-cut",
      tone: "info",
      icon: "target",
      title: `Acelera tu meta "${goal.name}"`,
      body:
        `Si reduces un 20 % lo que gastas en ${topWant.name.toLowerCase()}, ahorrarías unos ${$(weeklyCut)} por semana` +
        (weeksSaved && weeksSaved >= 1 ? ` y alcanzarías tu meta ~${Math.round(weeksSaved)} semanas antes.` : "."),
    });
  }

  // 8. Gastos recurrentes
  if (month.recurringTotal > 0 && month.expense > 0 && month.recurringTotal / month.expense > 0.15) {
    out.push({
      id: "recurring",
      tone: "info",
      icon: "repeat",
      title: `Tus gastos recurrentes suman ${$(month.recurringTotal)}`,
      body: "Representan más del 15 % de tus gastos. Revisa si sigues usando todas tus suscripciones.",
    });
  }

  // 9. Fines de semana
  if (month.weekendShare > 45) {
    out.push({
      id: "weekend",
      tone: "info",
      icon: "calendar",
      title: `El ${formatPercent(month.weekendShare)} de tu gasto ocurre en fin de semana`,
      body: "Planifica tus salidas con un presupuesto fijo para el fin de semana y evita compras impulsivas.",
    });
  }

  // 10. Proyección del mes
  if (month.income > 0 && month.projectedExpense > month.income) {
    out.push({
      id: "projection",
      tone: "warning",
      icon: "gauge",
      title: "A este ritmo superarás tus ingresos",
      body: `Proyección de gasto del mes: ${$(month.projectedExpense)} frente a ${$(month.income)} de ingresos.`,
    });
  }

  const order = { danger: 0, warning: 1, success: 2, info: 3 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}
