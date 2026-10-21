"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveBudget, deleteBudget } from "@/actions/settings";
import { FieldError, FormMessage, Modal, useOnSuccess, useToast } from "./FormBits";
import { CategoryIcon } from "./CategoryIcon";
import type { CategoryDTO } from "@/lib/analytics";

function BudgetForm({
  categories,
  onDone,
  initialCategoryId,
  initialLimit,
}: {
  categories: CategoryDTO[];
  onDone: (msg: string) => void;
  initialCategoryId?: string;
  initialLimit?: number;
}) {
  const [state, action, pending] = useActionState(saveBudget, undefined);
  useOnSuccess(state, onDone);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <form action={action} className="form">
      <div className="field">
        <label className="label" htmlFor="budget-cat">
          Categoría de gasto
        </label>
        <select
          className="select"
          id="budget-cat"
          name="categoryId"
          defaultValue={initialCategoryId ?? expenseCategories[0]?.id}
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError errors={state?.errors?.categoryId} />
      </div>

      <div className="field">
        <label className="label" htmlFor="budget-limit">
          Límite mensual máximo
        </label>
        <input
          className="input input-amount"
          id="budget-limit"
          name="monthlyLimit"
          type="number"
          step="0.01"
          min="1"
          placeholder="150.00"
          defaultValue={initialLimit}
          required
        />
        <FieldError errors={state?.errors?.monthlyLimit} />
      </div>

      <p className="dim" style={{ fontSize: 13 }}>
        BeHu te alertará cuando tus gastos en esta categoría alcancen el 80 % y el 100 % del presupuesto mensual fijado.
      </p>

      <FormMessage state={state?.ok ? undefined : state} />
      <button className="btn btn-primary btn-block" disabled={pending} id="budget-submit">
        {pending ? "Guardando..." : "Guardar presupuesto"}
      </button>
    </form>
  );
}

export function AddBudgetButton({ categories }: { categories: CategoryDTO[] }) {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <>
      {toast}
      <button className="btn btn-primary" onClick={() => setOpen(true)} id="add-budget-btn">
        <Plus size={18} /> Asignar presupuesto
      </button>
      {open && (
        <Modal title="Establecer presupuesto mensual" onClose={() => setOpen(false)}>
          <BudgetForm
            categories={categories}
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

export function EditBudgetButton({
  categories,
  categoryId,
  limit,
}: {
  categories: CategoryDTO[];
  categoryId: string;
  limit: number;
}) {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <>
      {toast}
      <button className="btn btn-sm btn-ghost" onClick={() => setOpen(true)} id={`edit-budget-${categoryId}`}>
        Ajustar
      </button>
      {open && (
        <Modal title="Ajustar presupuesto mensual" onClose={() => setOpen(false)}>
          <BudgetForm
            categories={categories}
            initialCategoryId={categoryId}
            initialLimit={limit}
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

export function DeleteBudgetButton({ id }: { id: string }) {
  return (
    <form action={deleteBudget} onSubmit={(e) => !confirm("¿Eliminar este presupuesto?") && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-ghost btn-icon btn-danger" aria-label="Eliminar presupuesto">
        <Trash2 size={16} />
      </button>
    </form>
  );
}
