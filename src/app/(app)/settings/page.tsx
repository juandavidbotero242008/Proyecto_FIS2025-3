import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getCategories } from "@/lib/analytics";
import { ProfileForm } from "@/components/ProfileForm";
import { AddCategoryButton, DeleteCategoryButton } from "@/components/CategoryModal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Settings, Tag, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Ajustes",
  description: "Configura tu perfil, moneda preferida y categorías de gastos.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const allCategories = await getCategories(user.id);

  const customCategories = allCategories.filter((c) => c.isCustom);
  const systemCategories = allCategories.filter((c) => !c.isCustom);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ajustes y Configuración</h1>
          <p>Personaliza tu experiencia, moneda y categorías personalizadas.</p>
        </div>
      </div>

      <div className="stack" style={{ gap: 28 }}>
        {/* 1. Perfil del Usuario */}
        <div className="card">
          <div className="card-header">
            <div className="row">
              <span className="stat-icon">
                <User size={16} />
              </span>
              <div>
                <h2 className="card-title">Perfil y Preferencias</h2>
                <p className="card-subtitle">Tu información y moneda para los reportes financieros</p>
              </div>
            </div>
          </div>
          <ProfileForm user={user} />
        </div>

        {/* 2. Categorías personalizadas */}
        <div className="card">
          <div className="card-header">
            <div className="row">
              <span className="stat-icon">
                <Tag size={16} />
              </span>
              <div>
                <h2 className="card-title">Categorías personalizadas</h2>
                <p className="card-subtitle">Crea tus propias categorías para clasificar gastos e ingresos a tu gusto</p>
              </div>
            </div>
            <AddCategoryButton />
          </div>

          {customCategories.length > 0 ? (
            <div className="grid grid-3">
              {customCategories.map((c) => (
                <div key={c.id} className="card card-lift" style={{ padding: 12, background: "var(--surface-strong)" }}>
                  <div className="row-between">
                    <div className="row">
                      <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div className="dim" style={{ fontSize: 11 }}>
                          {c.type === "EXPENSE" ? "Gasto" : "Ingreso"} · {c.group}
                        </div>
                      </div>
                    </div>
                    <DeleteCategoryButton id={c.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ background: "var(--surface-strong)", textAlign: "center", padding: "24px 16px" }}>
              <p className="muted" style={{ fontSize: 14 }}>
                No has creado ninguna categoría personalizada aún. Puedes añadir las que necesites (ej. Mascotas, Cursos, Tareas).
              </p>
            </div>
          )}

          {/* Categorías del sistema */}
          <div style={{ marginTop: 24 }}>
            <span className="dim" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Categorías predefinidas del sistema ({systemCategories.length}):
            </span>
            <div className="grid grid-3 mt" style={{ gap: 10 }}>
              {systemCategories.map((c) => (
                <div key={c.id} className="row" style={{ padding: "8px 12px", borderRadius: 10, background: "var(--surface)" }}>
                  <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                  <span style={{ fontSize: 13 }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
