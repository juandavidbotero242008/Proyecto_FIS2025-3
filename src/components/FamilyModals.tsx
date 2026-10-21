"use client";

import { useActionState, useState } from "react";
import { DollarSign, Plus, Trash2, UserPlus, X } from "lucide-react";
import { assignBudget, linkJunior, unlinkJunior, updateJuniorLimits } from "@/actions/family";
import { FieldError, FormMessage } from "@/components/FormBits";

export function LinkJuniorModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await linkJunior(prev as never, fd);
    if (res?.ok) setOpen(false);
    return res;
  }, undefined);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="btn-link-junior">
        <UserPlus size={16} /> Vincular cuenta Junior
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Vincular Cuenta Junior</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <form action={action} className="form">
          <div className="field">
            <label className="label">Nombre del joven</label>
            <input className="input" name="name" placeholder="Ej: Juan Botero" required />
            <FieldError errors={state?.errors?.name} />
          </div>
          <div className="field">
            <label className="label">Correo electrónico</label>
            <input className="input" name="email" type="email" placeholder="joven@familia.com" required />
            <FieldError errors={state?.errors?.email} />
          </div>
          <div className="field">
            <label className="label">Contraseña inicial</label>
            <input className="input" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            <FieldError errors={state?.errors?.password} />
          </div>
          <div className="form-row">
            <div className="field">
              <label className="label">Presupuesto inicial ($)</label>
              <input className="input" name="initialBudget" type="number" min="0" step="0.01" defaultValue="100" />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Se descuenta de tu saldo actual</span>
            </div>
            <div className="field">
              <label className="label">Límite Diario ($)</label>
              <input className="input" name="dailyLimit" type="number" min="0" step="0.01" defaultValue="30" />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label className="label">Límite Semanal ($)</label>
              <input className="input" name="weeklyLimit" type="number" min="0" step="0.01" defaultValue="150" />
            </div>
            <div className="field">
              <label className="label">Límite Mensual ($)</label>
              <input className="input" name="monthlyLimit" type="number" min="0" step="0.01" defaultValue="500" />
            </div>
          </div>

          <FormMessage state={state} />

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              <Plus size={16} /> {pending ? "Vinculando..." : "Confirmar y Asignar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AssignBudgetModal({ junior }: { junior: { id: string; name: string } }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await assignBudget(prev as never, fd);
    if (res?.ok) setOpen(false);
    return res;
  }, undefined);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
        <DollarSign size={14} /> Asignar Dinero
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar Presupuesto a {junior.name}</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <form action={action} className="form">
          <input type="hidden" name="juniorId" value={junior.id} />
          <div className="field">
            <label className="label">Monto a transferir ($)</label>
            <input className="input" name="amount" type="number" min="1" step="0.01" placeholder="Ej: 50" required autoFocus />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Se descontará de tu cuenta y se abonará a la cuenta de {junior.name}.
            </span>
            <FieldError errors={state?.errors?.amount} />
          </div>
          <div className="field">
            <label className="label">Motivo o nota (opcional)</label>
            <input className="input" name="note" placeholder="Ej: Mesada de la semana, Transporte" />
          </div>

          <FormMessage state={state} />

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Transfiriendo..." : "Transferir Presupuesto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UnlinkConfirmButton({ junior }: { junior: { id: string; name: string } }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlink = async () => {
    setLoading(true);
    try {
      await unlinkJunior(junior.id);
      setConfirming(false);
    } catch (e) {
      alert("Error al desvincular la cuenta");
    } finally {
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn btn-ghost btn-sm text-danger" title="Desvincular cuenta">
        <Trash2 size={15} /> Desvincular
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setConfirming(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>¿Desvincular a {junior.name}?</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setConfirming(false)}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "12px 0 20px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Esta acción desvinculará a <strong>{junior.name}</strong> de tu cuenta familiar. El usuario conservará su cuenta pero ya no estará bajo tu monitoreo ni gestión de límites.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={handleUnlink} disabled={loading}>
            {loading ? "Desvinculando..." : "Sí, desvincular cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
