"use client";

import { useActionState, useState } from "react";
import { DollarSign, Plus, Trash2, UserPlus, X } from "lucide-react";
import { assignBudget, linkJunior, unlinkJunior, updateJuniorLimits } from "@/actions/family";
import { FieldError, FormMessage } from "@/components/FormBits";

export function LinkJuniorModal() {
  const [open, setOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  const [state, action, pending] = useActionState(async (prev: unknown, fd: FormData) => {
    const res = await linkJunior(prev as never, fd);
    if (res?.ok) {
      setOpen(false);
      setCreateMode(false);
      setEmailValue("");
    } else if (res?.message === "NOT_FOUND") {
      // Si la cuenta no existe en el sistema, activamos la vista para crearla
      setCreateMode(true);
    }
    return res;
  }, undefined);

  const handleClose = () => {
    setOpen(false);
    setCreateMode(false);
    setEmailValue("");
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary" id="btn-link-junior">
        <UserPlus size={16} /> Vincular cuenta Junior
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{createMode ? "Crear y Configurar Cuenta Junior" : "Vincular Cuenta Junior"}</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {createMode && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              marginBottom: 16,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            ℹ️ No existe un usuario registrado con el correo <strong>{emailValue}</strong>. Completa el nombre y una contraseña temporal para crearle la cuenta y vincularlo de inmediato.
          </div>
        )}

        <form action={action} className="form">
          <input type="hidden" name="mode" value={createMode ? "CREATE_NEW" : "LINK_EXISTING"} />

          {/* Si está en modo crear cuenta nueva, pedimos nombre */}
          {createMode && (
            <div className="field">
              <label className="label">Nombre del joven</label>
              <input className="input" name="name" placeholder="Ej: Esteban Cantillo" required autoFocus />
              <FieldError errors={state?.errors?.name} />
            </div>
          )}

          <div className="field">
            <label className="label">Correo electrónico del Junior</label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="estebantst@email.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              required
            />
            <FieldError errors={state?.errors?.email} />
          </div>

          {/* Si está en modo crear cuenta nueva, pedimos la contraseña */}
          {createMode && (
            <div className="field">
              <label className="label">Contraseña inicial para el joven</label>
              <input className="input" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
              <FieldError errors={state?.errors?.password} />
            </div>
          )}

          <div className="form-row">
            <div className="field">
              <label className="label">Mesada / Presupuesto inicial ($)</label>
              <input className="input" name="initialBudget" type="number" min="0" step="0.01" defaultValue="100" />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Se transfiere desde tu saldo actual</span>
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

          {state?.message && state.message !== "NOT_FOUND" && <FormMessage state={state} />}

          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            {createMode ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCreateMode(false)}
                disabled={pending}
              >
                ← Volver a ingresar correo
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={pending}
              >
                Cancelar
              </button>
            )}

            <button type="submit" className="btn btn-primary" disabled={pending}>
              <Plus size={16} /> {pending ? "Procesando..." : createMode ? "Crear y Vincular Cuenta" : "Enviar Solicitud"}
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
