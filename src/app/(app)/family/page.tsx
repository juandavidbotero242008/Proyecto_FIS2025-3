import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { AssignBudgetModal, LinkJuniorModal, UnlinkConfirmButton } from "@/components/FamilyModals";
import { AlertCircle, ShieldCheck, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión Familiar",
  description: "Monitorea y asigna presupuestos a los miembros Junior a tu cargo.",
};

export default async function FamilyPage() {
  const user = await getCurrentUser();
  if (user.role !== "SENIOR") {
    redirect("/dashboard");
  }

  // Cuentas Junior vinculadas a este Senior
  const juniors = await prisma.user.findMany({
    where: { seniorId: user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calcular métricas para cada Junior
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const juniorMetrics = await Promise.all(
    juniors.map(async (j) => {
      const allTx = await prisma.transaction.findMany({
        where: { userId: j.id },
        select: { type: true, amount: true, date: true },
      });

      let totalIncome = 0;
      let totalExpense = 0;
      let weeklyExpense = 0;

      for (const t of allTx) {
        const amt = Number(t.amount);
        if (t.type === "INCOME") totalIncome += amt;
        else {
          totalExpense += amt;
          if (new Date(t.date) >= sevenDaysAgo) {
            weeklyExpense += amt;
          }
        }
      }

      return {
        ...j,
        currentBalance: totalIncome - totalExpense,
        weeklyExpense,
      };
    })
  );

  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header row-between" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Gestión Familiar 👨‍👩‍👧</h1>
          <p className="muted">
            Monitorea el consumo, asigna mesadas y configura límites para educar financieramente a tus jóvenes.
          </p>
        </div>
        <LinkJuniorModal />
      </header>

      {/* Tarjeta Informativa de Rol Senior */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.05))",
          borderColor: "rgba(59, 130, 246, 0.25)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(59, 130, 246, 0.15)",
            color: "var(--primary)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 2 }}>Módulo Exclusivo para Perfiles Senior (HU-02 / HU-03)</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Como acudiente principal, las recargas de presupuesto se descuentan de tu balance y se transfieren a la cuenta de tus dependientes con trazabilidad completa.
          </p>
        </div>
      </div>

      {juniorMetrics.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--surface)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              color: "var(--text-dim)",
            }}
          >
            <Users size={28} />
          </div>
          <h3>Aún no tienes cuentas Junior vinculadas</h3>
          <p className="muted" style={{ maxWidth: 460, margin: "8px auto 20px" }}>
            Vincula la cuenta de tus hijos o jóvenes a cargo para asignarles un presupuesto inicial, definir sus límites de gasto y acompañarlos en su educación financiera.
          </p>
          <LinkJuniorModal />
        </div>
      ) : (
        <div className="grid-2">
          {juniorMetrics.map((j) => {
            const weeklyLimit = j.weeklyLimit ? Number(j.weeklyLimit) : 200;
            const weeklyPct = Math.min(100, Math.round((j.weeklyExpense / weeklyLimit) * 100));

            return (
              <div key={j.id} className="card stack" style={{ gap: 16 }}>
                <div className="row-between">
                  <div className="row">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--success)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {j.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 2 }}>{j.name}</h3>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{j.email}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 12,
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--primary)",
                      fontWeight: 600,
                    }}
                  >
                    Score: {j.score}/100
                  </span>
                </div>

                {/* Métricas de Saldo y Consumo */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    padding: 14,
                    background: "var(--bg)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Saldo Disponible
                    </span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                      {formatMoney(j.currentBalance, user.currency)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Gasto Semana
                    </span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: j.weeklyExpense > weeklyLimit ? "var(--danger)" : "var(--text)" }}>
                      {formatMoney(j.weeklyExpense, user.currency)}
                    </div>
                  </div>
                </div>

                {/* Barra de progreso de límite semanal */}
                <div>
                  <div className="row-between" style={{ fontSize: 12, marginBottom: 6 }}>
                    <span className="muted">Consumo semanal vs. Límite</span>
                    <span>
                      {formatMoney(j.weeklyExpense, user.currency)} / {formatMoney(weeklyLimit, user.currency)} ({weeklyPct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--surface)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${weeklyPct}%`,
                        background: weeklyPct >= 100 ? "var(--danger)" : weeklyPct >= 75 ? "var(--warning)" : "var(--primary)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Resumen de Límites configurados */}
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    padding: "6px 0",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span>
                    Diario: <strong>{j.dailyLimit ? formatMoney(Number(j.dailyLimit), user.currency) : "Sin límite"}</strong>
                  </span>
                  <span>
                    Mensual: <strong>{j.monthlyLimit ? formatMoney(Number(j.monthlyLimit), user.currency) : "Sin límite"}</strong>
                  </span>
                </div>

                {/* Acciones */}
                <div className="row-between" style={{ marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <AssignBudgetModal junior={{ id: j.id, name: j.name }} />
                  <UnlinkConfirmButton junior={{ id: j.id, name: j.name }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
