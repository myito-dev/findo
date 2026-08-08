"use client";

import { motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";
import { AddPanel } from "./AddPanel";
import { addTransaction } from "@/lib/actions";
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

export function AddTransactionForm({ categories, cards }: { categories: CategoryOption[]; cards: CardOption[] }) {
  return <AddPanel label="Agregar">{(close) => <TransactionFields categories={categories} cards={cards} close={close} />}</AddPanel>;
}

function TransactionFields({
  categories,
  cards,
  close,
}: {
  categories: CategoryOption[];
  cards: CardOption[];
  close: () => void;
}) {
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">("efectivo");
  const [pending, startTransition] = useTransition();
  const filteredCategories = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await addTransaction(formData);
          close();
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
      <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Monto" className={inputClass} />
      <input name="description" placeholder="Descripción" className={inputClass} />
      <select name="categoryId" className={inputClass} defaultValue="">
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
        <input name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
      </div>
      {paymentMethod === "tarjeta" && (
        <select name="cardId" className={inputClass} defaultValue="">
          <option value="">Selecciona tarjeta</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input type="checkbox" name="isShared" />
        Compartido con la familia
      </label>
      <motion.button
        type="submit"
        disabled={pending}
        whileTap={tapScaleSmall}
        className="pill w-full bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar movimiento"}
      </motion.button>
    </form>
  );
}
