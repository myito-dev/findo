"use client";

import { motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";
import { Modal } from "./Modal";
import { deleteTransaction, updateTransaction } from "@/lib/actions";
import { formatDateShort, formatMXN } from "@/lib/format";
import { tapScaleSmall } from "@/lib/motion";
import { cn } from "@/lib/utils";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none";

interface CategoryOption {
  id: string;
  name: string;
  kind: "income" | "expense";
}
interface CardOption {
  id: string;
  name: string;
}
interface TransactionData {
  id: string;
  amount: number;
  kind: "income" | "expense";
  description: string | null;
  category_id: string | null;
  payment_method: "efectivo" | "tarjeta";
  card_id: string | null;
  occurred_at: string;
  is_shared: boolean;
}

/** A movimientos row that opens an edit modal on click — same fields as
 * adding one, pre-filled, plus a delete option. Replaces the old
 * row + separate delete-icon pattern. */
export function TransactionRow({
  transaction,
  fallbackLabel,
  categories,
  cards,
}: {
  transaction: TransactionData;
  fallbackLabel: string;
  categories: CategoryOption[];
  cards: CardOption[];
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"income" | "expense">(transaction.kind);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(transaction.payment_method);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const filteredCategories = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-2 text-left">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{transaction.description || fallbackLabel}</p>
          <p className="text-xs text-ink-muted">{formatDateShort(transaction.occurred_at)}</p>
        </div>
        <span className={cn("tabular shrink-0 text-sm font-semibold", transaction.kind === "income" ? "text-positive" : "text-ink")}>
          {formatMXN(transaction.amount, { showSign: transaction.kind === "income" })}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Editar movimiento">
        <form
          action={(formData) =>
            startTransition(async () => {
              await updateTransaction(transaction.id, formData);
              setOpen(false);
            })
          }
          className="space-y-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind("expense")}
              className={cn("pill flex-1 py-2 text-sm font-medium", kind === "expense" ? "bg-accent text-accent-ink" : "border border-hairline")}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setKind("income")}
              className={cn("pill flex-1 py-2 text-sm font-medium", kind === "income" ? "bg-accent text-accent-ink" : "border border-hairline")}
            >
              Ingreso
            </button>
          </div>
          <input type="hidden" name="kind" value={kind} />
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={transaction.amount}
            placeholder="Monto"
            className={inputClass}
          />
          <input name="description" defaultValue={transaction.description ?? ""} placeholder="Descripción" className={inputClass} />
          <select name="categoryId" className={inputClass} defaultValue={transaction.category_id ?? ""}>
            <option value="">Sin categoría</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "efectivo" | "tarjeta")}
              className={inputClass}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
            <input name="occurredAt" type="date" defaultValue={transaction.occurred_at} className={inputClass} />
          </div>
          {paymentMethod === "tarjeta" && (
            <select name="cardId" className={inputClass} defaultValue={transaction.card_id ?? ""}>
              <option value="">Selecciona tarjeta</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" name="isShared" defaultChecked={transaction.is_shared} />
            Compartido con la familia
          </label>
          <motion.button
            type="submit"
            disabled={pending}
            whileTap={tapScaleSmall}
            className="pill w-full bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </motion.button>
        </form>

        <div className="mt-3 border-t border-hairline pt-3">
          <motion.button
            type="button"
            disabled={deleting}
            whileTap={tapScaleSmall}
            onClick={() =>
              startDeleteTransition(async () => {
                await deleteTransaction(transaction.id);
                setOpen(false);
              })
            }
            className="pill w-full border border-hairline py-2.5 text-sm font-medium text-negative disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar movimiento"}
          </motion.button>
        </div>
      </Modal>
    </>
  );
}
