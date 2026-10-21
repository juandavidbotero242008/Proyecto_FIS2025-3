import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getCategories, getTransactions } from "@/lib/analytics";
import { formatDate, formatMoney, PAYMENT_METHODS } from "@/lib/format";
import { AddTransactionButton, EditTransactionButton } from "@/components/TransactionForm";
import { DeleteTransactionButton } from "@/components/DeleteTransactionButton";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Movimientos",
  description: "Historial completo de ingresos y gastos.",
};

type Props = {
  searchParams: Promise<{
    type?: string;
    categoryId?: string;
    month?: string;
    q?: string;
  }>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const filters = await searchParams;

  const [categories, transactions] = await Promise.all([
    getCategories(user.id),
    getTransactions(user.id, filters),
  ]);

  const totalFiltered = transactions.reduce((acc, t) => {
    return t.type === "INCOME" ? acc + t.amount : acc - t.amount;
  }, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Movimientos</h1>
          <p>Registra, edita y revisa cada uno de tus gastos e ingresos con todo detalle.</p>
        </div>
        <div className="row">
          <AddTransactionButton categories={categories} dailyLimit={user.dailyLimit} />
        </div>
      </div>

      {/* Barra de Filtros */}
      <form method="GET" className="card filters" style={{ padding: 14 }}>
        <div className="search row" style={{ gap: 8 }}>
          <Search size={16} className="muted" />
          <input
            className="input"
            style={{ border: "none", background: "transparent", height: 36, padding: 0 }}
            name="q"
            placeholder="Buscar por descripción o etiqueta..."
            defaultValue={filters.q ?? ""}
          />
        </div>

        <select className="select" name="type" defaultValue={filters.type ?? ""}>
          <option value="">Todos los tipos</option>
          <option value="EXPENSE">Solo gastos</option>
          <option value="INCOME">Solo ingresos</option>
        </select>

        <select className="select" name="categoryId" defaultValue={filters.categoryId ?? ""}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="input"
          type="month"
          name="month"
          defaultValue={filters.month ?? ""}
          title="Filtrar por mes"
        />

        <button type="submit" className="btn btn-sm btn-ghost">
          Aplicar filtros
        </button>
      </form>

      {/* Resumen de Filtro */}
      <div className="row-between" style={{ margin: "16px 4px 12px" }}>
        <span className="muted" style={{ fontSize: 13 }}>
          {transactions.length} {transactions.length === 1 ? "movimiento encontrado" : "movimientos encontrados"}
        </span>
        <span className="dim" style={{ fontSize: 13 }}>
          Balance mostrado:{" "}
          <strong className={`tabular ${totalFiltered >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(totalFiltered, user.currency)}
          </strong>
        </span>
      </div>

      {/* Lista / Tabla de Movimientos */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {transactions.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Método</th>
                  <th className="text-right">Monto</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className="tabular">{formatDate(tx.date)}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <CategoryIcon icon={tx.category.icon} color={tx.category.color} size="sm" />
                        <span>{tx.category.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{tx.description}</strong>
                        {tx.isRecurring && (
                          <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>
                            Recurrente
                          </span>
                        )}
                        {tx.isImpulsive && (
                          <span
                            className="badge"
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "var(--warning)",
                              borderColor: "rgba(245, 158, 11, 0.3)",
                            }}
                          >
                            ⚠️ Gasto Impulsivo
                          </span>
                        )}
                      </div>
                      {tx.tags.length > 0 && (
                        <div style={{ marginTop: 2 }}>
                          {tx.tags.map((tg) => (
                            <span key={tg} className="tag">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                      {tx.notes && <div className="dim" style={{ fontSize: 12 }}>{tx.notes}</div>}
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {PAYMENT_METHODS[tx.paymentMethod] ?? tx.paymentMethod}
                    </td>
                    <td className="text-right">
                      <span className={`amount ${tx.type === "INCOME" ? "income" : "expense"}`}>
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatMoney(tx.amount, user.currency)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="row" style={{ justifyContent: "flex-end", gap: 4 }}>
                        <EditTransactionButton categories={categories} tx={tx} />
                        <DeleteTransactionButton id={tx.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" style={{ padding: "50px 20px" }}>
            <div className="icon">💳</div>
            <h3>Sin movimientos encontrados</h3>
            <p className="muted">Prueba cambiando los filtros o registra un nuevo movimiento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
