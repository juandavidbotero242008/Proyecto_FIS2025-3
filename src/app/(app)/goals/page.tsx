import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getGoals } from "@/lib/analytics";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { AddGoalButton, AddContributionButton, DeleteGoalButton } from "@/components/GoalModals";
import { Calendar, CheckCircle2, Clock, PiggyBank, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Metas de Ahorro",
  description: "Crea objetivos financieros y registra tus avances.",
};

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const goals = await getGoals(user.id);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Metas de Ahorro</h1>
          <p>Convierte tus sueños en planes tangibles y calcula cuánto ahorrar paso a paso.</p>
        </div>
        <div className="row">
          <AddGoalButton />
        </div>
      </div>

      {/* Resumen General de Ahorro */}
      <div className="card stat-card" style={{ marginBottom: 24 }}>
        <div className="row-between">
          <div>
            <span className="stat-label">
              <span className="stat-icon">
                <PiggyBank size={15} />
              </span>
              Progreso acumulado de todas las metas
            </span>
            <div className="stat-value" style={{ margin: "10px 0 4px" }}>
              {formatMoney(totalSaved, user.currency)}{" "}
              <span className="dim" style={{ fontSize: 18, fontWeight: 500 }}>
                / {formatMoney(totalTarget, user.currency)}
              </span>
            </div>
          </div>
          <span className="badge success" style={{ fontSize: 14, padding: "6px 12px" }}>
            {formatPercent(overallProgress)} completado
          </span>
        </div>

        <div className="progress" style={{ height: 12, marginTop: 12 }}>
          <div className="progress-bar" style={{ width: `${Math.min(overallProgress, 100)}%` }} />
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <span style={{ color: "var(--primary)" }}>🔒</span>
          <span>
            <strong>Ahorro protegido:</strong> Los {formatMoney(totalSaved, user.currency)} ahorrados están reservados y separados de tu saldo disponible diario para protegerlos de compras impulsivas.
          </span>
        </div>
      </div>

      {/* Lista de Metas */}
      {goals.length > 0 ? (
        <div className="grid grid-2">
          {goals.map((g) => {
            const isCompleted = g.status === "COMPLETED" || g.progress >= 100;
            return (
              <div
                key={g.id}
                className={`card card-lift goal-card ${isCompleted ? "border-success" : ""}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  borderColor: isCompleted ? "rgba(52, 227, 169, 0.4)" : undefined,
                }}
              >
                <div>
                  <div className="row-between" style={{ alignItems: "flex-start" }}>
                    <div className="row" style={{ gap: 12 }}>
                      <span className="emoji">{g.emoji}</span>
                      <div>
                        <h3 style={{ fontSize: 18 }}>{g.name}</h3>
                        <div className="dim" style={{ fontSize: 12 }}>
                          {isCompleted ? (
                            <span className="text-success" style={{ fontWeight: 600 }}>
                              ✓ ¡Meta alcanzada!
                            </span>
                          ) : g.deadline ? (
                            <span>Límite: {formatDate(g.deadline)}</span>
                          ) : (
                            <span>Sin fecha límite</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DeleteGoalButton id={g.id} />
                  </div>

                  {/* Números y Progreso */}
                  <div style={{ marginTop: 18 }}>
                    <div className="row-between" style={{ marginBottom: 8, fontSize: 13 }}>
                      <span className="muted">Ahorrado:</span>
                      <strong className="tabular">
                        {formatMoney(g.saved, user.currency)}{" "}
                        <span className="dim">({formatPercent(g.progress)})</span>
                      </strong>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(g.progress, 100)}%`,
                          "--bar": isCompleted ? "var(--success)" : "var(--gradient)",
                        } as React.CSSProperties}
                      />
                    </div>

                    <div className="row-between" style={{ marginTop: 8, fontSize: 12 }}>
                      <span className="dim">Objetivo: {formatMoney(g.target, user.currency)}</span>
                      {!isCompleted && (
                        <span className="dim">Faltan: {formatMoney(g.remaining, user.currency)}</span>
                      )}
                    </div>
                  </div>

                  {/* Sugerencia inteligente de ahorro semanal */}
                  {!isCompleted && g.weeklyNeeded !== null && g.weeklyNeeded > 0 && (
                    <div
                      className="card"
                      style={{
                        background: "var(--surface-strong)",
                        padding: "10px 12px",
                        marginTop: 14,
                        fontSize: 12.5,
                      }}
                    >
                      <div className="row" style={{ gap: 6 }}>
                        <Clock size={14} className="text-secondary" />
                        <span>
                          Para alcanzarla a tiempo, ahorra{" "}
                          <strong className="text-secondary">
                            {formatMoney(g.weeklyNeeded, user.currency)} cada semana
                          </strong>{" "}
                          ({Math.ceil((g.daysLeft ?? 0) / 7)} semanas restantes).
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Historial de aportes */}
                  {g.contributions.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <span className="dim" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Últimos aportes:
                      </span>
                      <div className="stack" style={{ gap: 6, marginTop: 6, maxHeight: 110, overflowY: "auto" }}>
                        {g.contributions.slice(0, 3).map((c) => (
                          <div key={c.id} className="row-between" style={{ fontSize: 12, padding: "2px 0" }}>
                            <span className="muted">
                              {formatDate(c.date)} {c.note ? `· ${c.note}` : ""}
                            </span>
                            <strong className="text-success tabular">+{formatMoney(c.amount, user.currency)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="row-between" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <span className="dim" style={{ fontSize: 12 }}>
                    {g.contributions.length} {g.contributions.length === 1 ? "aporte" : "aportes"}
                  </span>
                  {!isCompleted && <AddContributionButton goal={g} />}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty">
          <div className="icon">🎯</div>
          <h3>Aún no tienes metas de ahorro</h3>
          <p className="muted" style={{ maxWidth: 440, margin: "6px auto 18px" }}>
            Crea tu primera meta (por ejemplo: un fondo para imprevistos o un viaje) y BeHu te calculará cuánto apartar semana a semana.
          </p>
          <AddGoalButton />
        </div>
      )}
    </div>
  );
}
