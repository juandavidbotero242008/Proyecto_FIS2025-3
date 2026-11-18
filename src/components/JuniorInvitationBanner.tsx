"use client";

import { useState } from "react";
import { UserCheck, UserX, Users } from "lucide-react";
import { acceptFamilyInvitation, rejectFamilyInvitation } from "@/actions/family";
import { formatMoney } from "@/lib/format";

type InvitationItem = {
  id: string;
  initialBudget: number;
  weeklyLimit: number | null;
  senior: {
    name: string;
    email: string;
  };
  currency: string;
};

export default function JuniorInvitationBanner({
  invitations,
}: {
  invitations: InvitationItem[];
}) {
  const [items, setItems] = useState<InvitationItem[]>(invitations);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    const res = await acceptFamilyInvitation(id);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      window.location.reload();
    } else {
      alert(res.message);
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const res = await rejectFamilyInvitation(id);
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      alert(res.message);
    }
    setLoadingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {items.map((inv) => (
        <div
          key={inv.id}
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            borderRadius: "var(--radius-lg)",
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(59, 130, 246, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
                  Solicitud de Vinculación Familiar
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  <strong>{inv.senior.name}</strong> ({inv.senior.email}) te ha invitado a su grupo familiar como dependiente.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={loadingId === inv.id}
                onClick={() => handleReject(inv.id)}
              >
                <UserX size={15} /> Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loadingId === inv.id}
                onClick={() => handleAccept(inv.id)}
              >
                <UserCheck size={15} /> {loadingId === inv.id ? "Procesando…" : "Aceptar invitación"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: 12.5,
              color: "var(--text-dim)",
              paddingTop: 8,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {inv.initialBudget > 0 && (
              <div>
                Mesada inicial ofrecida:{" "}
                <strong style={{ color: "var(--success)" }}>{formatMoney(inv.initialBudget, inv.currency)}</strong>
              </div>
            )}
            {inv.weeklyLimit && (
              <div>
                Límite de gasto semanal sugerido:{" "}
                <strong style={{ color: "var(--text)" }}>{formatMoney(inv.weeklyLimit, inv.currency)}</strong>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
