import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Lightbulb,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import {
  getCategories,
  getGoals,
  getMonthSummary,
  getRecentTransactions,
  getWeekComparison,
  getWeeklyTrend,
  getRandomTip,
  getBudgets,
} from "@/lib/analytics";
import { generateInsights } from "@/lib/insights";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { AddTransactionButton } from "@/components/TransactionForm";
import { CategoryIcon, Icon } from "@/components/CategoryIcon";
import { CategoryDonut, WeeklyTrendChart } from "@/components/Charts";

export const metadata: Metadata = {
  title: "Resumen",
  description: "Panel principal de tus finanzas personales en BeHu.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [categories, month, week, weeklyTrend, goals, recentTx, randomTip, budgets] = await Promise.all([
    getCategories(user.id),
    getMonthSummary(user.id),
    getWeekComparison(user.id),
    getWeeklyTrend(user.id, 8),
    getGoals(user.id),
    getRecentTransactions(user.id, 6),
    getRandomTip(),
    getBudgets(user.id),
  ]);

  const insights = generateInsights({
    month,
    week,
    goals,
    budgets,
    currency: user.currency,
  });

  const featuredInsight = insights[0];

  return (
    <div>
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1>
            Hola, <span className="gradient-text">{user.name.split(" ")[0]}</span> 👋
          </h1>
          <p>Este es el estado de tus finanzas personales este mes.</p>
        </div>
        <div className="row">
          <AddTransactionButton categories={categories} />
        </div>
      </div>

      {/* Tarjeta de consejo principal / recomendación activa */}
      {featuredInsight && (
        <div className={`insight ${featuredInsight.tone} animate-in`} style={{ marginBottom: 20 }}>
          <div className="icon">
            <Icon name={featuredInsight.icon} size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>{featuredInsight.title}</h4>
            <p>{featuredInsight.body}</p>
          </div>
          <Link href="/insights" className="btn btn-sm btn-ghost" style={{ alignSelf: "center" }}>
            Ver análisis <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Fila de Estadísticas Clave */}
      <div className="grid grid-4 animate-in">
        {/* Balance */}
        <div className="card stat-card">
          <div className="row-between">
            <span className="stat-label">
              <span className="stat-icon">
                <Wallet size={15} />
              </span>
              Balance del mes
            </span>
          </div>
          <div className={`stat-value ${month.balance >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(month.balance, user.currency)}
          </div>
          <div className="row">
            <span className={`delta ${month.balance >= 0 ? "good" : "bad"}`}>
              {month.balance >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {month.income > 0 ? `${formatPercent(month.savingsRate)} ahorrado` : "Sin ingresos aún"}
            </span>
          </div>
        </div>

        {/* Gastos del mes */}
        <div className="card stat-card">
          <div className="row-between">
            <span className="stat-label">
              <span className="stat-icon">
                <ArrowDownRight size={15} />
              </span>
              Gastos acumulados
            </span>
          </div>
          <div className="stat-value">{formatMoney(month.expense, user.currency)}</div>
          <div className="row">
            {month.expenseChange !== null ? (
              <span className={`delta ${month.expenseChange <= 0 ? "good" : "bad"}`}>
                {formatPercent(month.expenseChange, true)} vs mes anterior
              </span>
            ) : (
              <span className="delta neutral">Primer mes</span>
            )}
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="card stat-card">
          <div className="row-between">
            <span className="stat-label">
              <span className="stat-icon">
                <ArrowUpRight size={15} />
              </span>
              Ingresos del mes
            </span>
          </div>
          <div className="stat-value">{formatMoney(month.income, user.currency)}</div>
          <div className="row">
            <span className="dim" style={{ fontSize: 12 }}>
              Promedio diario: <strong>{formatMoney(month.avgDaily, user.currency)}</strong>
            </span>
          </div>
        </div>

        {/* Comparación Semana a Semana */}
        <div className="card stat-card">
          <div className="row-between">
            <span className="stat-label">
              <span className="stat-icon">
                <Calendar size={15} />
              </span>
              Esta semana
            </span>
          </div>
          <div className="stat-value">{formatMoney(week.thisWeekExpense, user.currency)}</div>
          <div className="row">
            {week.change !== null ? (
              <span className={`delta ${week.change <= 0 ? "good" : "bad"}`}>
                {formatPercent(week.change, true)} vs semana previa
              </span>
            ) : (
              <span className="delta neutral">Primer registro</span>
            )}
          </div>
        </div>
      </div>

      {/* Grilla Principal: Tendencia Semanal + Dona de Categorías */}
      <div className="grid grid-main mt">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Tendencia de gastos e ingresos</h2>
              <p className="card-subtitle">Evolución de las últimas 8 semanas</p>
            </div>
            <Link href="/insights" className="btn btn-sm btn-ghost">
              Detalles
            </Link>
          </div>
          <WeeklyTrendChart data={weeklyTrend} currency={user.currency} />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Gastos por categoría</h2>
              <p className="card-subtitle">Distribución del mes actual</p>
            </div>
          </div>
          {month.byCategory.length > 0 ? (
            <>
              <CategoryDonut
                data={month.byCategory.map((c) => ({ name: c.name, color: c.color, total: c.total }))}
                currency={user.currency}
              />
              <div className="stack" style={{ marginTop: 14, maxHeight: 150, overflowY: "auto" }}>
                {month.byCategory.slice(0, 4).map((c) => (
                  <div key={c.id} className="row-between" style={{ fontSize: 13 }}>
                    <div className="row">
                      <span className="legend-dot" style={{ background: c.color }} />
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                    <span className="tabular">{formatMoney(c.total, user.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: "30px 10px" }}>
              <p>Aún no has registrado gastos este mes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fila Inferior: Metas de ahorro + Movimientos recientes */}
      <div className="grid grid-2 mt">
        {/* Metas de ahorro */}
        <div className="card">
          <div className="card-header">
            <div className="row">
              <span className="stat-icon" style={{ "--icon-color": "var(--primary)", "--icon-bg": "rgba(52, 227, 169, 0.12)" } as React.CSSProperties}>
                <PiggyBank size={18} />
              </span>
              <div>
                <h2 className="card-title">Metas de ahorro</h2>
                <p className="card-subtitle">Tus objetivos activos</p>
              </div>
            </div>
            <Link href="/goals" className="btn btn-sm btn-ghost">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {goals.length > 0 ? (
            <div className="stack">
              {goals.slice(0, 3).map((g) => (
                <div key={g.id} className="card" style={{ padding: 14, background: "var(--surface-strong)" }}>
                  <div className="row-between">
                    <div className="row">
                      <span style={{ fontSize: 24 }}>{g.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                        <div className="dim" style={{ fontSize: 12 }}>
                          {formatMoney(g.saved, user.currency)} de {formatMoney(g.target, user.currency)}
                        </div>
                      </div>
                    </div>
                    <span className="badge success">{formatPercent(g.progress)}</span>
                  </div>
                  <div className="progress" style={{ marginTop: 10 }}>
                    <div className="progress-bar" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>No tienes metas de ahorro activas.</p>
              <Link href="/goals" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>
                Crear una meta
              </Link>
            </div>
          )}
        </div>

        {/* Movimientos recientes */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Últimos movimientos</h2>
              <p className="card-subtitle">Tus transacciones más recientes</p>
            </div>
            <Link href="/transactions" className="btn btn-sm btn-ghost">
              Ver historial <ArrowRight size={14} />
            </Link>
          </div>

          {recentTx.length > 0 ? (
            <div className="tx-list">
              {recentTx.map((tx) => (
                <div key={tx.id} className="tx-item">
                  <CategoryIcon icon={tx.category.icon} color={tx.category.color} size="sm" />
                  <div className="info">
                    <div className="title">{tx.description}</div>
                    <div className="meta">
                      {formatDate(tx.date)} · {tx.category.name}
                    </div>
                  </div>
                  <div className={`amount ${tx.type === "INCOME" ? "income" : "expense"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatMoney(tx.amount, user.currency)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>No tienes movimientos registrados todavía.</p>
            </div>
          )}
        </div>
      </div>

      {/* Consejo del día */}
      {randomTip && (
        <div className="card tip-card mt animate-in">
          <div className="row">
            <span className="stat-icon" style={{ "--icon-color": "var(--primary)", "--icon-bg": "rgba(52, 227, 169, 0.2)" } as React.CSSProperties}>
              <Lightbulb size={18} />
            </span>
            <div>
              <div className="badge" style={{ marginBottom: 4 }}>
                Consejo financiero · {randomTip.category}
              </div>
              <h3 style={{ fontSize: 16 }}>{randomTip.title}</h3>
              <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                {randomTip.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
