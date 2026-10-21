"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { register } from "@/actions/auth";
import { CURRENCIES } from "@/lib/format";
import { FieldError, FormMessage } from "@/components/FormBits";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="auth-card">
      <h1>Crea tu cuenta ✨</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        Empieza a entender tu dinero en menos de un minuto.
      </p>
      <form action={action} className="form">
        <div className="field">
          <label className="label" htmlFor="name">
            Nombre
          </label>
          <input className="input" id="name" name="name" placeholder="Laura García" autoComplete="name" />
          <FieldError errors={state?.errors?.name} />
        </div>
        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" placeholder="tu@email.com" autoComplete="email" />
          <FieldError errors={state?.errors?.email} />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres, letras y números"
            autoComplete="new-password"
          />
          <FieldError errors={state?.errors?.password} />
        </div>
        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="currency">
              Moneda
            </label>
            <select className="select" id="currency" name="currency" defaultValue="USD">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="monthlyIncome">
              Ingreso mensual (opcional)
            </label>
            <input className="input" id="monthlyIncome" name="monthlyIncome" type="number" min="0" step="0.01" placeholder="800" />
          </div>
        </div>
        <FormMessage state={state} />
        <button className="btn btn-primary btn-block" disabled={pending} id="register-submit">
          <UserPlus size={18} /> {pending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="switch">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
