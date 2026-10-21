"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  return (
    <form action={deleteTransaction} onSubmit={(e) => !confirm("¿Eliminar este movimiento?") && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-ghost btn-icon btn-danger" aria-label="Eliminar movimiento" title="Eliminar">
        <Trash2 size={15} />
      </button>
    </form>
  );
}
