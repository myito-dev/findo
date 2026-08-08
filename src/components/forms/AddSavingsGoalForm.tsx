"use client";

import { motion } from "motion/react";
import { useTransition } from "react";
import { AddPanel } from "./AddPanel";
import { addSavingsGoal } from "@/lib/actions";
import { tapScaleSmall } from "@/lib/motion";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none";

export function AddSavingsGoalForm() {
  return (
    <AddPanel label="Nueva meta" title="Nueva meta de ahorro">
      {(close) => <GoalFields close={close} />}
    </AddPanel>
  );
}

function GoalFields({ close }: { close: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await addSavingsGoal(formData);
          close();
        })
      }
      className="space-y-3"
    >
      <input name="name" required placeholder="Nombre de la meta" className={inputClass} />
      <input name="targetAmount" type="number" step="0.01" min="1" required placeholder="Monto objetivo" className={inputClass} />
      <input name="targetDate" type="date" className={inputClass} />
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input type="checkbox" name="isShared" />
        Meta familiar (visible para todos)
      </label>
      <motion.button
        type="submit"
        disabled={pending}
        whileTap={tapScaleSmall}
        className="pill w-full bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Crear meta"}
      </motion.button>
    </form>
  );
}
