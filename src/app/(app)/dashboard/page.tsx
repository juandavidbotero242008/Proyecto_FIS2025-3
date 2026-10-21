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
  getExtendedDashboardMetrics,
  CategoryTotal,
  GoalDTO,
  TransactionDTO,
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
  const [categories, month, week, weeklyTrend, goals, recentTx, randomTip, budgets, ext] = await Promise.all([
    getCategories(user.id),
    getMonthSummary(user.id),
    getWeekComparison(user.id),
    getWeeklyTrend(user.id, 8),
    getGoals(user.id),
    getRecentTransactions(user.id, 6),
    getRandomTip(),
    getBudgets(user.id),
    getExtendedDashboardMetrics(user.id),
  ]);

  const insights = generateInsights({
    month,
    week,
    goals,
    budgets,
    currency: user.currency,
  });

  const featuredInsight = insights[0];
  const isSenior = user.role === "SENIOR";

  return (
    <div>
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1>
              Hola, <span className="gradient-text">{user.name.split(" ")[0]}</span> 👋
            </h1>
            <span
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 12,
                background: isSenior ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: isSenior ? "#60a5fa" : "#34d399",
                fontWeight: 600,
              }}
            >
              {isSenior ? "Perfil Senior · Acudiente" : "Perfil Junior · Joven"}
            </span>
          </div>
          <p>
            {isSenior
              ? "Supervisión de finanzas familiares, asignación de presupuestos e inversiones."
              : ext.senior
              ? `Acompañado por tu acudiente: ${ext.senior.name}. Aprende a gestionar tus límites.`
              : "Controla tu saldo personal, respeta tus límites y haz crecer tu Score BeHu."}
          </p>
        </div>
        <div className="row">
          <AddTransactionButton categories={categories} dailyLimit={ext.dailyLimit} />
        </div>
      </div>

      {/* Tarjeta de Score BeHu y Salud Financiera (HU-08) */}
      <div
        className="card animate-in"
        style={{
          marginBottom: 20,
          background: "linear-gradient(135deg, rgba(17, 23, 38, 0.9), rgba(15, 20, 34, 0.95))",
          border: "1px solid var(--border-strong)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: `conic-gradient(${ext.scoreColor} ${ext.dynamicScore * 3.6}deg, var(--surface) 0deg)`,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              padding: 4,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--bg-elevated)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 16,
                color: ext.scoreColor,
              }}
            >
              {ext.dynamicScore}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <h3 style={{ fontSize: 16 }}>Score BeHu de Salud Financiera</h3>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 7px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  color: ext.scoreColor,
                  fontWeight: 600,
                }}
              >
                {ext.scoreTier === "excellent" ? "Excelente" : ext.scoreTier === "good" ? "Saludable" : "En riesgo"}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              {isSenior
                ? "Basado en tu diversificación, ahorro constante y monitoreo del presupuesto del hogar."
                : "Tus buenos hábitos de ahorro y evitar gastos impulsivos construyen tu historial crediticio a futuro."}
            </p>
          </div>
        </div>

        {/* Sección de Saldo Disponible vs Congelado (HU-06) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "10px 14px",
            background: "var(--surface)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" }}>
              Saldo Disponible (Gasto)
            </span>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              {formatMoney(ext.availableBalance, user.currency)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" }}>
              Ahorro Reservado en Metas
            </span>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
              {formatMoney(ext.frozenInGoals, user.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Para perfil Junior: Panel Exclusivo de Límites de Gasto */}
      {!isSenior && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15 }}>Tus Límites de Gasto</h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Monitoreo activo para evitar compras impulsivas y mantener tu consumo responsable.
              </p>
            </div>
            <Link href="/learn" className="btn btn-secondary btn-sm">
              <Lightbulb size={14} /> Micro-Learning
            </Link>
          </div>

          <div className="grid-2">
            {/* Límite Semanal */}
            <div
              style={{
                padding: 14,
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="row-between" style={{ marginBottom: 6, fontSize: 13 }}>
                <span className="muted">Consumo Semanal</span>
                <span style={{ fontWeight: 600 }}>
                  {formatMoney(ext.thisWeekExpense, user.currency)} /{" "}
                  {formatMoney(ext.weeklyLimit ?? 200, user.currency)}
                </span>
              </div>
              <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.round((ext.thisWeekExpense / (ext.weeklyLimit ?? 200)) * 100))}%`,
                    background:
                      ext.thisWeekExpense > (ext.weeklyLimit ?? 200)
                        ? "var(--danger)"
                        : ext.thisWeekExpense > (ext.weeklyLimit ?? 200) * 0.8
                        ? "var(--warning)"
                        : "var(--success)",
                  }}
                />
              </div>
            </div>

            {/* Límite Mensual */}
            <div
              style={{
                padding: 14,
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="row-between" style={{ marginBottom: 6, fontSize: 13 }}>
                <span className="muted">Consumo Mensual</span>
                <span style={{ fontWeight: 600 }}>
                  {formatMoney(ext.thisMonthExpense, user.currency)} /{" "}
                  {formatMoney(ext.monthlyLimit ?? 600, user.currency)}
                </span>
              </div>
              <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.round((ext.thisMonthExpense / (ext.monthlyLimit ?? 600)) * 100))}%`,
                    background:
                      ext.thisMonthExpense > (ext.monthlyLimit ?? 600)
                        ? "var(--danger)"
                        : ext.thisMonthExpense > (ext.monthlyLimit ?? 600) * 0.8
                        ? "var(--warning)"
                        : "var(--primary)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Para perfil Senior: Tarjeta Rápida de Gestión Familiar (HU-02) */}
      {isSenior && (
        <div
          className="card animate-in"
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "rgba(59, 130, 246, 0.05)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div>
            <h4 style={{ fontSize: 15, marginBottom: 2 }}>Módulo de Gestión Familiar</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Tienes <strong>{ext.juniorsCount} cuenta(s) Junior</strong> vinculada(s) para asignar presupuesto y monitorear límites.
            </p>
          </div>
          <Link href="/family" className="btn btn-primary btn-sm">
            Ver cuentas Junior y asignar dinero <ArrowRight size={14} />
          </Link>
        </div>
      )}

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
          <Link href="/assistant" className="btn btn-sm btn-ghost" style={{ alignSelf: "center" }}>
            Consultar a BeHu Mini <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Fila de Estadísticas Clave */}
      <div className="grid grid-4 animate-in">
        {/* Balance Global */}
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
                data={month.byCategory.map((c: CategoryTotal) => ({ name: c.name, color: c.color, total: c.total }))}
                currency={user.currency}
              />
              <div className="stack" style={{ marginTop: 14, maxHeight: 150, overflowY: "auto" }}>
                {month.byCategory.slice(0, 4).map((c: CategoryTotal) => (
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
              {goals.slice(0, 3).map((g: GoalDTO) => (
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
              {recentTx.map((tx: TransactionDTO) => (
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
