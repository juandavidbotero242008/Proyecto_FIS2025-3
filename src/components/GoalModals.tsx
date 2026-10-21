"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Plus, PiggyBank, Trash2 } from "lucide-react";
import { saveGoal, addContribution, deleteGoal } from "@/actions/goals";
import { FieldError, FormMessage, Modal, useOnSuccess, useToast } from "./FormBits";
import type { GoalDTO } from "@/lib/analytics";

function GoalForm({ onDone, initial }: { onDone: (msg: string) => void; initial?: GoalDTO }) {
  const [state, action, pending] = useActionState(saveGoal, undefined);
  useOnSuccess(state, onDone);

  return (
    <form action={action} className="form">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="form-row">
        <div className="field" style={{ maxWidth: 90 }}>
          <label className="label" htmlFor="goal-emoji">
            Emoji
          </label>
          <input
            className="input"
            id="goal-emoji"
            name="emoji"
            defaultValue={initial?.emoji ?? "🎯"}
            maxLength={4}
            style={{ textAlign: "center", fontSize: 20 }}
          />
          <FieldError errors={state?.errors?.emoji} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="label" htmlFor="goal-name">
            Nombre de la meta
          </label>
          <input
            className="input"
            id="goal-name"
            name="name"
            placeholder="Ej: Viaje de vacaciones, Fondo de emergencia"
            defaultValue={initial?.name}
            required
          />
          <FieldError errors={state?.errors?.name} />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="goal-target">
            Monto objetivo
          </label>
          <input
            className="input"
            id="goal-target"
            name="targetAmount"
            type="number"
            step="0.01"
            min="1"
            placeholder="500.00"
            defaultValue={initial?.target}
            required
          />
          <FieldError errors={state?.errors?.targetAmount} />
        </div>
        <div className="field">
          <label className="label" htmlFor="goal-deadline">
            Fecha límite (opcional)
          </label>
          <input
            className="input"
            id="goal-deadline"
            name="deadline"
            type="date"
            defaultValue={initial?.deadline ?? ""}
          />
          <FieldError errors={state?.errors?.deadline} />
        </div>
      </div>

      <FormMessage state={state?.ok ? undefined : state} />
      <button className="btn btn-primary btn-block" disabled={pending} id="goal-submit">
        {pending ? "Guardando..." : initial ? "Actualizar meta" : "Crear meta de ahorro"}
      </button>
    </form>
  );
}

function ContributionForm({ goal, onDone }: { goal: GoalDTO; onDone: (msg: string) => void }) {
  const [state, action, pending] = useActionState(addContribution, undefined);
  useOnSuccess(state, onDone);

  const localToday = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="form">
      <input type="hidden" name="goalId" value={goal.id} />
      <p className="muted" style={{ fontSize: 14 }}>
        Añade un ahorro a tu meta <strong>{goal.emoji} {goal.name}</strong>.
      </p>

      <div className="field">
        <label className="label" htmlFor="contrib-amount">
          Monto a aportar
        </label>
        <input
          className="input input-amount"
          id="contrib-amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          autoFocus
          required
        />
        <FieldError errors={state?.errors?.amount} />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="contrib-date">
            Fecha
          </label>
          <input className="input" id="contrib-date" name="date" type="date" defaultValue={localToday} required />
          <FieldError errors={state?.errors?.date} />
        </div>
        <div className="field">
          <label className="label" htmlFor="contrib-note">
            Nota (opcional)
          </label>
          <input className="input" id="contrib-note" name="note" placeholder="Ej: Ahorro de la semana" />
        </div>
      </div>

      <FormMessage state={state?.ok ? undefined : state} />
      <button className="btn btn-primary btn-block" disabled={pending} id="contrib-submit">
        {pending ? "Aportando..." : "Registrar aporte"}
      </button>
    </form>
  );
}

export function AddGoalButton() {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <>
      {toast}
      <button className="btn btn-primary" onClick={() => setOpen(true)} id="add-goal-btn">
        <Plus size={18} /> Nueva meta
      </button>
      {open && (
        <Modal title="Nueva meta de ahorro" onClose={() => setOpen(false)}>
          <GoalForm
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

export function AddContributionButton({ goal }: { goal: GoalDTO }) {
  const [open, setOpen] = useState(false);
  const [toast, showToast] = useToast();

  return (
    <>
      {toast}
      <button className="btn btn-sm btn-primary" onClick={() => setOpen(true)} id={`contrib-btn-${goal.id}`}>
        <PiggyBank size={15} /> Aportar
      </button>
      {open && (
        <Modal title="Aportar a meta" onClose={() => setOpen(false)}>
          <ContributionForm
            goal={goal}
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

export function DeleteGoalButton({ id }: { id: string }) {
  return (
    <form action={deleteGoal} onSubmit={(e) => !confirm("¿Eliminar esta meta de ahorro?") && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-ghost btn-icon btn-danger" aria-label="Eliminar meta" title="Eliminar meta">
        <Trash2 size={16} />
      </button>
    </form>
  );
}
