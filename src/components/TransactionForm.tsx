"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { saveTransaction } from "@/actions/transactions";
import type { CategoryDTO, TransactionDTO } from "@/lib/analytics";
import { PAYMENT_METHODS } from "@/lib/format";
import { CategoryIcon } from "./CategoryIcon";
import { FieldError, FormMessage, Modal, useOnSuccess, useToast } from "./FormBits";

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TransactionForm({
  categories,
  initial,
  dailyLimit,
  onDone,
}: {
  categories: CategoryDTO[];
  initial?: TransactionDTO;
  dailyLimit?: number | null;
  onDone: (message: string) => void;
}) {
  const [state, action, pending] = useActionState(saveTransaction, undefined);
  const [type, setType] = useState<"EXPENSE" | "INCOME">(initial?.type ?? "EXPENSE");
  const [impulseAlert, setImpulseAlert] = useState<{ amount: number; limit: number } | null>(null);
  const [impulseConfirmed, setImpulseConfirmed] = useState(false);
  useOnSuccess(state, onDone);
  const visible = categories.filter((c) => c.type === type);

  return (
    <>
      <form action={action} className="form">
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <div className="segmented" role="radiogroup" aria-label="Tipo de movimiento">
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
          <label className="label sr-only" htmlFor="tx-amount">
            Monto
          </label>
          <input
            className="input input-amount"
            id="tx-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={initial?.amount}
            autoFocus
            required
          />
          <FieldError errors={state?.errors?.amount} />
        </div>

        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="tx-description">
              Descripción
            </label>
            <input
              className="input"
              id="tx-description"
              name="description"
              placeholder={type === "EXPENSE" ? "Almuerzo con amigos" : "Pago de nómina"}
              defaultValue={initial?.description}
              required
            />
            <FieldError errors={state?.errors?.description} />
          </div>
          <div className="field">
            <label className="label" htmlFor="tx-date">
              Fecha
            </label>
            <input
              className="input"
              id="tx-date"
              name="date"
              type="date"
              defaultValue={initial?.date ?? localToday()}
              required
            />
            <FieldError errors={state?.errors?.date} />
          </div>
        </div>

        <div className="field">
          <span className="label">Categoría</span>
          <div className="chip-grid" role="radiogroup" aria-label="Categoría">
            {visible.map((c, i) => (
              <label key={c.id} className="chip" style={{ "--chip-color": c.color } as React.CSSProperties}>
                <input
                  type="radio"
                  name="categoryId"
                  value={c.id}
                  defaultChecked={initial ? initial.category.id === c.id : i === 0}
                />
                <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                {c.name}
              </label>
            ))}
          </div>
          <FieldError errors={state?.errors?.categoryId} />
        </div>

        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="tx-payment">
              Método de pago
            </label>
            <select
              className="select"
              id="tx-payment"
              name="paymentMethod"
              defaultValue={initial?.paymentMethod ?? (type === "INCOME" ? "TRANSFER" : "DEBIT_CARD")}
            >
              {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tx-tags">
              Etiquetas (separadas por coma)
            </label>
            <input
              className="input"
              id="tx-tags"
              name="tags"
              placeholder="universidad, amigos"
              defaultValue={initial?.tags.join(", ")}
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="tx-notes">
            Notas (opcional)
          </label>
          <textarea className="textarea" id="tx-notes" name="notes" rows={2} defaultValue={initial?.notes ?? ""} />
        </div>

        <label className="checkbox">
          <input type="checkbox" name="isRecurring" defaultChecked={initial?.isRecurring} />
          Es un movimiento recurrente (suscripción, alquiler, nómina…)
        </label>

        {/* Alerta interactiva de Gasto Impulsivo (HU-07) */}
        {impulseAlert && (
          <div
            style={{
              padding: 14,
              borderRadius: "var(--radius)",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              margin: "12px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--warning)", fontWeight: 600, fontSize: 13 }}>
              <span>⚠️</span> Alerta de Detección de Gasto Impulsivo (HU-07)
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "8px 0 12px" }}>
              El monto ingresado (<strong>${impulseAlert.amount}</strong>) supera tu límite diario sugerido de{" "}
              <strong>${impulseAlert.limit}</strong>. ¿Es una compra planificada o podrías postergarla?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setImpulseAlert(null)}
              >
                Cancelar compra
              </button>
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={() => {
                  setImpulseConfirmed(true);
                  setImpulseAlert(null);
                  // Disparar submit
                  setTimeout(() => {
                    const btn = document.getElementById("tx-submit") as HTMLButtonElement;
                    btn?.click();
                  }, 50);
                }}
              >
                Confirmar de todas formas
              </button>
            </div>
          </div>
        )}

        <input type="hidden" name="isImpulsive" value={impulseConfirmed ? "true" : "false"} />

        <FormMessage state={state?.ok ? undefined : state} />
        <button
          className="btn btn-primary btn-block"
          disabled={pending}
          id="tx-submit"
          onClick={(e) => {
            if (type === "EXPENSE" && !impulseConfirmed) {
              const amountInput = document.getElementById("tx-amount") as HTMLInputElement;
              const val = Number(amountInput?.value || 0);
              const limit = dailyLimit ?? 50;
              if (val > limit) {
                e.preventDefault();
                setImpulseAlert({ amount: val, limit });
                return;
              }
            }
          }}
        >
          {pending ? "Guardando…" : initial ? "Guardar cambios" : "Registrar movimiento"}
        </button>
      </form>
    </>
  );
}

export function AddTransactionButton({
  categories,
  label = "Nuevo movimiento",
  dailyLimit,
}: {
  categories: CategoryDTO[];
  label?: string;
  dailyLimit?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();
  return (
    <>
      {toast}
      <button className="btn btn-primary" onClick={() => setOpen(true)} id="add-transaction-btn">
        <Plus size={18} /> {label}
      </button>
      {open && (
        <Modal title="Nuevo movimiento" onClose={() => setOpen(false)}>
          <TransactionForm
            categories={categories}
            dailyLimit={dailyLimit}
            onDone={(m) => {
              setOpen(false);
              showToast(m);
            }}
          />
        </Modal>
      )}
    </>
  );
}

export function EditTransactionButton({ categories, tx }: { categories: CategoryDTO[]; tx: TransactionDTO }) {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();
  return (
    <>
      {toast}
      <button className="btn btn-ghost btn-icon" onClick={() => setOpen(true)} aria-label="Editar" id={`edit-${tx.id}`}>
        <Pencil size={15} />
      </button>
      {open && (
        <Modal title="Editar movimiento" onClose={() => setOpen(false)}>
          <TransactionForm
            categories={categories}
            initial={tx}
            onDone={(m) => {
              setOpen(false);
              showToast(m);
            }}
          />
        </Modal>
      )}
    </>
  );
}
