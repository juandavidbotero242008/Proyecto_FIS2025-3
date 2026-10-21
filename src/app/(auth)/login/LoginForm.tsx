"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/actions/auth";
import { FieldError, FormMessage } from "@/components/FormBits";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="auth-card">
      <h1>Bienvenido de nuevo 👋</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        Inicia sesión para ver tus finanzas.
      </p>
      <form action={action} className="form">
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
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <FieldError errors={state?.errors?.password} />
        </div>
        <FormMessage state={state} />
        <button className="btn btn-primary btn-block" disabled={pending} id="login-submit">
          <LogIn size={18} /> {pending ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>
      <div className="demo-hint" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: "var(--text)" }}>
          Acceso rápido por perfil (HU-01):
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const emailInput = document.getElementById("email") as HTMLInputElement;
              const passInput = document.getElementById("password") as HTMLInputElement;
              if (emailInput && passInput) {
                emailInput.value = "demo@behu.app";
                passInput.value = "Demo1234";
              }
            }}
          >
            👨‍👩‍👧 Perfil Senior
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const emailInput = document.getElementById("email") as HTMLInputElement;
              const passInput = document.getElementById("password") as HTMLInputElement;
              if (emailInput && passInput) {
                emailInput.value = "estudiante@prueba.com";
                passInput.value = "Prueba123";
              }
            }}
          >
            🎓 Perfil Junior
          </button>
        </div>
      </div>
      <p className="switch">
        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
      </p>
    </div>
  );
}
