import { getCurrentUser } from "@/lib/dal";
import { getExtendedDashboardMetrics } from "@/lib/analytics";
import BeHuMiniAssistant from "@/components/BeHuMiniAssistant";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BeHu Mini · Asistente IA",
  description: "Asistente inteligente con recomendaciones dinámicas de ahorro e inversión según tu rol.",
};

export default async function AssistantPage() {
  const user = await getCurrentUser();
  const ext = await getExtendedDashboardMetrics(user.id);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <header className="page-header">
        <div>
          <h1>BeHu Mini Assistant 🤖</h1>
          <p className="muted">
            {user.role === "SENIOR"
              ? "Recomendaciones orientadas a inversión patrimonial, CDTs, diversificación y control familiar."
              : "Educación financiera personalizada, acompañamiento en metas de ahorro y control de límites."}
          </p>
        </div>
      </header>

      <BeHuMiniAssistant
        ctx={{
          name: user.name,
          role: user.role,
          currency: user.currency,
          score: ext.dynamicScore,
          availableBalance: ext.availableBalance,
          thisMonthExpense: ext.thisMonthExpense,
          thisWeekExpense: ext.thisWeekExpense,
          weeklyLimit: ext.weeklyLimit,
          monthlyLimit: ext.monthlyLimit,
          frozenInGoals: ext.frozenInGoals,
        }}
      />
    </div>
  );
}
