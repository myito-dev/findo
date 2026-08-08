"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { CardFace } from "../CardFace";
import { Modal } from "./Modal";
import { deleteCard, updateCard } from "@/lib/actions";
import { tapScaleSmall } from "@/lib/motion";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none";

interface CardData {
  id: string;
  name: string;
  card_type: "credito" | "debito";
  last4: string | null;
  cut_off_day: number | null;
  payment_due_day: number | null;
}

/** A tarjeta face that opens an edit modal on click, pre-filled with its
 * current data, plus a delete option — same pattern as TransactionRow. */
export function EditCardTile({
  card,
  amountLabel,
  amount,
}: {
  card: CardData;
  amountLabel: string;
  amount: number;
}) {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<"credito" | "debito">(card.card_type);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
        <CardFace name={card.name} cardType={card.card_type} last4={card.last4 ?? "----"} amountLabel={amountLabel} amount={amount} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Editar tarjeta">
        <form
          action={(formData) =>
            startTransition(async () => {
              await updateCard(card.id, formData);
              setOpen(false);
            })
          }
          className="space-y-3"
        >
          <input name="name" required defaultValue={card.name} placeholder="Nombre (ej. Nu Mastercard)" className={inputClass} />
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
            <input name="last4" maxLength={4} defaultValue={card.last4 ?? ""} placeholder="Últimos 4 dígitos" className={inputClass} />
          </div>
          {cardType === "credito" && (
            <div className="flex gap-2">
              <input
                name="cutOffDay"
                type="number"
                min={1}
                max={31}
                defaultValue={card.cut_off_day ?? ""}
                placeholder="Día de corte"
                className={inputClass}
              />
              <input
                name="paymentDueDay"
                type="number"
                min={1}
                max={31}
                defaultValue={card.payment_due_day ?? ""}
                placeholder="Día de pago"
                className={inputClass}
              />
            </div>
          )}
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
                await deleteCard(card.id);
                setOpen(false);
              })
            }
            className="pill w-full border border-hairline py-2.5 text-sm font-medium text-negative disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar tarjeta"}
          </motion.button>
        </div>
      </Modal>
    </>
  );
}
