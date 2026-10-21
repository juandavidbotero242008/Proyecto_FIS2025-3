import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getBudgets, getCategories } from "@/lib/analytics";
import { formatMoney, formatPercent } from "@/lib/format";
import { AddBudgetButton, EditBudgetButton, DeleteBudgetButton } from "@/components/BudgetModal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AlertCircle, CheckCircle, ShieldAlert, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Presupuestos Mensuales",
  description: "Establece topes de gasto por categoría y mantén tus finanzas bajo control.",
};

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  const [categories, budgets] = await Promise.all([
    getCategories(user.id),
    getBudgets(user.id),
  ]);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Presupuestos Mensuales</h1>
          <p>Define límites máximos de gasto para evitar sorpresas a fin de mes.</p>
        </div>
        <div className="row">
          <AddBudgetButton categories={categories} />
        </div>
      </div>

      {/* Resumen de Presupuestos */}
      <div className="card stat-card" style={{ marginBottom: 24 }}>
        <div className="row-between">
          <div>
            <span className="stat-label">
              <span className="stat-icon">
                <WalletCards size={15} />
              </span>
              Límite total presupuestado este mes
            </span>
            <div className="stat-value" style={{ margin: "10px 0 4px" }}>
              {formatMoney(totalSpent, user.currency)}{" "}
              <span className="dim" style={{ fontSize: 18, fontWeight: 500 }}>
                / {formatMoney(totalLimit, user.currency)}
              </span>
            </div>
          </div>
          <span
            className={`badge ${
              overallPct >= 100 ? "danger" : overallPct >= 80 ? "warning" : "success"
            }`}
            style={{ fontSize: 14, padding: "6px 12px" }}
          >
            {formatPercent(overallPct)} consumido
          </span>
        </div>

        <div className="progress" style={{ height: 12, marginTop: 12 }}>
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(overallPct, 100)}%`,
              "--bar":
                overallPct >= 100 ? "var(--danger)" : overallPct >= 80 ? "var(--warning)" : "var(--primary)",
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Lista de Presupuestos por Categoría */}
      {budgets.length > 0 ? (
        <div className="grid grid-2">
          {budgets.map((b) => {
            const isOver = b.status === "over";
            const isWarn = b.status === "warning";

            return (
              <div
                key={b.id}
                className="card card-lift"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  borderColor: isOver ? "rgba(251, 113, 133, 0.4)" : isWarn ? "rgba(251, 191, 36, 0.4)" : undefined,
                }}
              >
                <div>
                  <div className="row-between">
                    <div className="row">
                      <CategoryIcon icon={b.category.icon} color={b.category.color} />
                      <div>
                        <h3 style={{ fontSize: 16 }}>{b.category.name}</h3>
                        <span className="dim" style={{ fontSize: 12 }}>
                          {b.category.group === "NEED"
                            ? "Necesidad"
                            : b.category.group === "WANT"
                            ? "Deseo"
                            : "Ahorro"}
                        </span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <EditBudgetButton categories={categories} categoryId={b.category.id} limit={b.limit} />
                      <DeleteBudgetButton id={b.id} />
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div className="row-between" style={{ marginBottom: 8, fontSize: 13 }}>
                      <span className="muted">Gastado:</span>
                      <strong className="tabular">
                        {formatMoney(b.spent, user.currency)}{" "}
                        <span className="dim">({formatPercent(b.pct)})</span>
                      </strong>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(b.pct, 100)}%`,
                          "--bar": isOver ? "var(--danger)" : isWarn ? "var(--warning)" : "var(--primary)",
                        } as React.CSSProperties}
                      />
                    </div>

                    <div className="row-between" style={{ marginTop: 8, fontSize: 12 }}>
                      <span className="dim">Límite: {formatMoney(b.limit, user.currency)}</span>
                      <span
                        className={isOver ? "text-danger" : isWarn ? "text-warning" : "text-success"}
                        style={{ fontWeight: 600 }}
                      >
                        {isOver
                          ? `Excedido por ${formatMoney(Math.abs(b.remaining), user.currency)}`
                          : `Disponible: ${formatMoney(b.remaining, user.currency)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="row"
                  style={{
                    fontSize: 12,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 10,
                    gap: 6,
                  }}
                >
                  {isOver ? (
                    <>
                      <ShieldAlert size={14} className="text-danger" />
                      <span className="text-danger">¡Has superado el presupuesto mensual!</span>
                    </>
                  ) : isWarn ? (
                    <>
                      <AlertCircle size={14} className="text-warning" />
                      <span className="text-warning">Atención: estás cerca del límite mensual.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-success" />
                      <span className="muted">Gasto dentro de los límites esperados.</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty">
          <div className="icon">💳</div>
          <h3>No has fijado ningún presupuesto</h3>
          <p className="muted" style={{ maxWidth: 440, margin: "6px auto 18px" }}>
            Asigna un límite mensual a categorías como Alimentación, Restaurantes u Ocio para recibir advertencias antes de excederte.
          </p>
          <AddBudgetButton categories={categories} />
        </div>
      )}
    </div>
  );
}
