import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import {
  getAllTips,
  getBudgets,
  getGoals,
  getMonthSummary,
  getWeekComparison,
} from "@/lib/analytics";
import { generateInsights } from "@/lib/insights";
import { formatMoney, formatPercent } from "@/lib/format";
import { WeekCompareChart, WeekdayChart } from "@/components/Charts";
import { CategoryIcon, Icon } from "@/components/CategoryIcon";
import { Sparkles, ArrowRight, Lightbulb, PieChart, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Análisis y Consejos",
  description: "Análisis comparativo de gastos semana a semana y recomendaciones inteligentes.",
};

export default async function InsightsPage() {
  const user = await getCurrentUser();
  const [month, week, goals, budgets, allTips] = await Promise.all([
    getMonthSummary(user.id),
    getWeekComparison(user.id),
    getGoals(user.id),
    getBudgets(user.id),
    getAllTips(),
  ]);

  const insights = generateInsights({
    month,
    week,
    goals,
    budgets,
    currency: user.currency,
  });

  // Cálculo de porcentajes para la regla 50/30/20
  const incomeBase = month.income > 0 ? month.income : 1;
  const needsPct = (month.groupTotals.NEED / incomeBase) * 100;
  const wantsPct = (month.groupTotals.WANT / incomeBase) * 100;
  const savingsPct = month.income > 0 ? Math.max((month.balance / incomeBase) * 100, 0) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Análisis y Consejos</h1>
          <p>Descubre patrones en tus hábitos de consumo y consejos para optimizar tu dinero.</p>
        </div>
      </div>

      {/* 1. SECCIÓN: CONSEJOS INTELIGENTES AUTOMÁTICOS */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="row">
            <span className="stat-icon">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="card-title">Consejos personalizados para ti</h2>
              <p className="card-subtitle">Generados a partir de tus gastos e ingresos registrados</p>
            </div>
          </div>
        </div>

        <div className="stack">
          {insights.length > 0 ? (
            insights.map((ins) => (
              <div key={ins.id} className={`insight ${ins.tone} animate-in`}>
                <div className="icon">
                  <Icon name={ins.icon} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4>{ins.title}</h4>
                  <p>{ins.body}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              <p>Continúa registrando gastos para generar más consejos a tu medida.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECCIÓN: COMPARATIVA SEMANA A SEMANA */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="row">
              <span className="stat-icon">
                <CalendarDays size={16} />
              </span>
              <div>
                <h2 className="card-title">Esta semana vs. Semana anterior</h2>
                <p className="card-subtitle">Comparación de gasto por categoría</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: "var(--surface-strong)", padding: 14, marginBottom: 16 }}>
            <div className="row-between">
              <div>
                <span className="dim" style={{ fontSize: 12 }}>Gasto esta semana ({week.elapsedDays} días transcurridos)</span>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{formatMoney(week.thisWeekExpense, user.currency)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="dim" style={{ fontSize: 12 }}>Mismo periodo semana anterior</span>
                <div style={{ fontSize: 16, fontWeight: 600 }} className="muted">
                  {formatMoney(week.lastWeekSamePeriodExpense, user.currency)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {week.change !== null ? (
                <span className={`delta ${week.change <= 0 ? "good" : "bad"}`}>
                  Variación: {formatPercent(week.change, true)}
                </span>
              ) : null}
            </div>
          </div>

          {week.categories.length > 0 ? (
            <WeekCompareChart
              data={week.categories.slice(0, 6).map((c) => ({
                name: c.name,
                thisWeek: c.thisWeek,
                lastWeek: c.lastWeek,
              }))}
              currency={user.currency}
            />
          ) : (
            <div className="empty">
              <p>Sin suficientes datos semanales aún.</p>
            </div>
          )}
        </div>

        {/* Gasto por día de la semana */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Gasto por día de la semana</h2>
              <p className="card-subtitle">Identifica en qué días concentras más compras</p>
            </div>
          </div>

          <WeekdayChart data={month.weekdayTotals} currency={user.currency} />

          <div className="stack" style={{ marginTop: 14 }}>
            <div className="row-between" style={{ fontSize: 13 }}>
              <span className="muted">Día de mayor gasto:</span>
              <strong>{month.busiestWeekday ?? "N/A"}</strong>
            </div>
            <div className="row-between" style={{ fontSize: 13 }}>
              <span className="muted">Porcentaje gastado en fin de semana:</span>
              <strong className="tabular">{formatPercent(month.weekendShare)}</strong>
            </div>
            {month.biggestExpense && (
              <div className="row-between" style={{ fontSize: 13 }}>
                <span className="muted">Mayor gasto individual:</span>
                <strong className="tabular">
                  {month.biggestExpense.description} ({formatMoney(month.biggestExpense.amount, user.currency)})
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: REGLA 50/30/20 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="row">
            <span className="stat-icon">
              <PieChart size={16} />
            </span>
            <div>
              <h2 className="card-title">Distribución según la regla 50/30/20</h2>
              <p className="card-subtitle">
                Evalúa si tus gastos se alinean con la recomendación financiera clásica sobre tus ingresos ({formatMoney(month.income, user.currency)})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-3">
          {/* Necesidades (50%) */}
          <div className="card" style={{ background: "var(--surface-strong)", padding: 18 }}>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Necesidades (50 %)</span>
              <span className={`badge ${needsPct <= 50 ? "success" : "warning"}`}>{formatPercent(needsPct)}</span>
            </div>
            <div className="dim" style={{ fontSize: 12, marginBottom: 12 }}>
              Vivienda, mercado, servicios, transporte
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {formatMoney(month.groupTotals.NEED, user.currency)}
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(needsPct, 100)}%`,
                  "--bar": needsPct > 55 ? "var(--warning)" : "var(--primary)",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Deseos (30%) */}
          <div className="card" style={{ background: "var(--surface-strong)", padding: 18 }}>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Deseos (30 %)</span>
              <span className={`badge ${wantsPct <= 30 ? "success" : "danger"}`}>{formatPercent(wantsPct)}</span>
            </div>
            <div className="dim" style={{ fontSize: 12, marginBottom: 12 }}>
              Restaurantes, salidas, cine, ropa
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {formatMoney(month.groupTotals.WANT, user.currency)}
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(wantsPct, 100)}%`,
                  "--bar": wantsPct > 35 ? "var(--danger)" : "var(--secondary)",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Ahorro (20%) */}
          <div className="card" style={{ background: "var(--surface-strong)", padding: 18 }}>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Ahorro / Metas (20 %)</span>
              <span className={`badge ${savingsPct >= 20 ? "success" : "warning"}`}>{formatPercent(savingsPct)}</span>
            </div>
            <div className="dim" style={{ fontSize: 12, marginBottom: 12 }}>
              Fondo de emergencia, aportes a metas
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {formatMoney(Math.max(month.balance, 0), user.currency)}
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(savingsPct, 100)}%`,
                  "--bar": "var(--primary)",
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN: GUÍA DE EDUCACIÓN FINANCIERA */}
      <div className="card">
        <div className="card-header">
          <div className="row">
            <span className="stat-icon">
              <Lightbulb size={16} />
            </span>
            <div>
              <h2 className="card-title">Conceptos clave de finanzas personales</h2>
              <p className="card-subtitle">Principios que todo estudiante y profesional debe conocer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          {allTips.map((t) => (
            <div key={t.id} className="card card-lift" style={{ background: "var(--surface-strong)", padding: 16 }}>
              <span className="badge" style={{ marginBottom: 8 }}>
                {t.category}
              </span>
              <h3 style={{ fontSize: 15, marginBottom: 6 }}>{t.title}</h3>
              <p className="muted" style={{ fontSize: 13.5 }}>
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
