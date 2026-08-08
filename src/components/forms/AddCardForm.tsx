"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { AddPanel } from "./AddPanel";
import { addCard } from "@/lib/actions";
import { tapScaleSmall } from "@/lib/motion";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none";

export function AddCardForm() {
  return <AddPanel label="Agregar">{(close) => <CardFields close={close} />}</AddPanel>;
}

function CardFields({ close }: { close: () => void }) {
  const [cardType, setCardType] = useState<"credito" | "debito">("credito");
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await addCard(formData);
          close();
        })
      }
      className="space-y-3"
    >
      <input name="name" required placeholder="Nombre (ej. Nu Mastercard)" className={inputClass} />
      <div className="flex gap-2">
        <select
          name="cardType"
          value={cardType}
          onChange={(e) => setCardType(e.target.value as "credito" | "debito")}
          className={inputClass}
        >
          <option value="credito">Crédito</option>
          <option value="debito">Débito</option>
        </select>
        <input name="last4" maxLength={4} placeholder="Últimos 4 dígitos" className={inputClass} />
      </div>
      {cardType === "credito" && (
        <div className="flex gap-2">
          <input name="cutOffDay" type="number" min={1} max={31} placeholder="Día de corte" className={inputClass} />
          <input name="paymentDueDay" type="number" min={1} max={31} placeholder="Día de pago" className={inputClass} />
        </div>
      )}
      <motion.button
        type="submit"
        disabled={pending}
        whileTap={tapScaleSmall}
        className="pill w-full bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar tarjeta"}
      </motion.button>
    </form>
  );
}
