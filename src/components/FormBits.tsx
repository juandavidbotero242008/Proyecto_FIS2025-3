"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ActionState } from "@/lib/definitions";

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <span className="field-error">{errors[0]}</span>;
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return <div className={`form-message ${state.ok ? "success" : "error"}`}>{state.message}</div>;
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Toast efímero. Devuelve el nodo a renderizar y la función para mostrarlo. */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="toast" role="status">
      ✓ {msg}
    </div>
  ) : null;
  return [node, setMsg] as const;
}

/** Ejecuta `cb` cada vez que una Server Action termina con éxito */
export function useOnSuccess(state: ActionState, cb: (message: string) => void) {
  useEffect(() => {
    if (state?.ok) cb(state.message ?? "Guardado");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
