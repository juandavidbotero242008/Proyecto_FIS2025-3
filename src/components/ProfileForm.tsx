"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/settings";
import { CURRENCIES } from "@/lib/format";
import { FieldError, FormMessage, useOnSuccess, useToast } from "./FormBits";
import type { CurrentUser } from "@/lib/dal";

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [toast, showToast] = useToast();

  useOnSuccess(state, (msg) => {
    showToast(msg);
  });

  return (
    <>
      {toast}
      <form action={action} className="form">
        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="user-name">
              Nombre completo
            </label>
            <input className="input" id="user-name" name="name" defaultValue={user.name} required />
            <FieldError errors={state?.errors?.name} />
          </div>
          <div className="field">
            <label className="label" htmlFor="user-email">
              Correo electrónico
            </label>
            <input className="input" id="user-email" value={user.email} disabled title="El email no puede modificarse" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="user-currency">
              Moneda principal
            </label>
            <select className="select" id="user-currency" name="currency" defaultValue={user.currency}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="user-income">
              Ingreso mensual estimado
            </label>
            <input
              className="input"
              id="user-income"
              name="monthlyIncome"
              type="number"
              step="0.01"
              min="0"
              defaultValue={user.monthlyIncome ?? ""}
              placeholder="Ej: 1200.00"
            />
          </div>
        </div>

        <FormMessage state={state?.ok ? undefined : state} />

        <div style={{ alignSelf: "flex-start", marginTop: 4 }}>
          <button className="btn btn-primary" disabled={pending} id="save-profile-btn">
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </>
  );
}
