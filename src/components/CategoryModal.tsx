"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/settings";
import { CATEGORY_ICON_CHOICES, Icon } from "./CategoryIcon";
import { FieldError, FormMessage, Modal, useOnSuccess, useToast } from "./FormBits";

const PRESET_COLORS = [
  "#34e3a9",
  "#38bdf8",
  "#60a5fa",
  "#818cf8",
  "#a78bfa",
  "#ec4899",
  "#f43f5e",
  "#fb7185",
  "#f59e0b",
  "#fbbf24",
  "#10b981",
  "#14b8a6",
];

function CategoryForm({ onDone }: { onDone: (msg: string) => void }) {
  const [state, action, pending] = useActionState(createCategory, undefined);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState("shopping-bag");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  useOnSuccess(state, onDone);

  return (
    <form action={action} className="form">
      <div className="segmented" role="radiogroup">
        <label className="expense">
          <input
            type="radio"
            name="type"
            value="EXPENSE"
            checked={type === "EXPENSE"}
            onChange={() => setType("EXPENSE")}
          />
          Gasto
        </label>
        <label className="income">
          <input
            type="radio"
            name="type"
            value="INCOME"
            checked={type === "INCOME"}
            onChange={() => setType("INCOME")}
          />
          Ingreso
        </label>
      </div>

      <div className="field">
        <label className="label" htmlFor="cat-name">
          Nombre de la categoría
        </label>
        <input className="input" id="cat-name" name="name" placeholder="Ej: Mascotas, Cursos, Tareas" required />
        <FieldError errors={state?.errors?.name} />
      </div>

      <div className="field">
        <label className="label" htmlFor="cat-group">
          Clasificación (Regla 50/30/20)
        </label>
        <select className="select" id="cat-group" name="group" defaultValue={type === "INCOME" ? "INCOME" : "WANT"}>
          {type === "EXPENSE" ? (
            <>
              <option value="NEED">Necesidad (50 %) - Gastos indispensables</option>
              <option value="WANT">Deseo (30 %) - Estilo de vida y gustos</option>
              <option value="SAVING">Ahorro / Deuda (20 %) - Metas financieras</option>
            </>
          ) : (
            <option value="INCOME">Ingreso</option>
          )}
        </select>
        <FieldError errors={state?.errors?.group} />
      </div>

      <div className="field">
        <span className="label">Color</span>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: c,
                border: color === c ? "2px solid #ffffff" : "2px solid transparent",
                cursor: "pointer",
                boxShadow: color === c ? `0 0 10px ${c}` : "none",
              }}
            />
          ))}
          <input type="hidden" name="color" value={color} />
        </div>
      </div>

      <div className="field">
        <span className="label">Icono</span>
        <input type="hidden" name="icon" value={icon} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
            gap: 6,
            maxHeight: 140,
            overflowY: "auto",
            padding: 4,
          }}
        >
          {CATEGORY_ICON_CHOICES.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className="btn btn-ghost"
              style={{
                padding: 0,
                height: 38,
                borderRadius: 10,
                background: icon === ic ? "var(--surface-strong)" : "transparent",
                color: icon === ic ? color : "var(--text-muted)",
                border: icon === ic ? `1px solid ${color}` : "1px solid transparent",
              }}
            >
              <Icon name={ic} size={18} />
            </button>
          ))}
        </div>
        <FieldError errors={state?.errors?.icon} />
      </div>

      <FormMessage state={state?.ok ? undefined : state} />
      <button className="btn btn-primary btn-block" disabled={pending} id="category-submit">
        {pending ? "Creando..." : "Crear categoría"}
      </button>
    </form>
  );
}

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <>
      {toast}
      <button className="btn btn-primary" onClick={() => setOpen(true)} id="add-category-btn">
        <Plus size={18} /> Nueva categoría
      </button>
      {open && (
        <Modal title="Crear categoría personalizada" onClose={() => setOpen(false)}>
          <CategoryForm
            onDone={(msg) => {
              setOpen(false);
              showToast(msg);
            }}
          />
        </Modal>
      )}
    </>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  return (
    <form action={deleteCategory} onSubmit={(e) => !confirm("¿Eliminar esta categoría?") && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-ghost btn-icon btn-danger" aria-label="Eliminar categoría" title="Eliminar categoría">
        <Trash2 size={16} />
      </button>
    </form>
  );
}
