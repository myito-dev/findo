"use client";

import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { addContribution } from "@/lib/actions";
import { springSnappy, tapScaleSmall } from "@/lib/motion";
import { AnimatePresence } from "motion/react";

const inputClass = "w-full rounded-2xl border border-hairline bg-surface px-3 py-2 text-sm outline-none";

/** Compact inline "aportar" control for a single savings goal — its own
 * mini version of AddPanel since it lives inside a goal card, not a page header. */
export function AddContributionForm({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3">
      <motion.button
        type="button"
        whileTap={tapScaleSmall}
        onClick={() => setOpen((o) => !o)}
        className="pill border border-hairline px-3 py-1.5 text-xs font-medium"
      >
        Aportar
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSnappy}
            action={(formData) =>
              startTransition(async () => {
                await addContribution(formData);
                setOpen(false);
              })
            }
            className="mt-2 flex gap-2 overflow-hidden"
          >
            <input type="hidden" name="goalId" value={goalId} />
            <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Monto" className={inputClass} />
            <motion.button
              type="submit"
              disabled={pending}
              whileTap={tapScaleSmall}
              className="pill shrink-0 bg-accent px-3 py-2 text-xs font-semibold text-accent-ink disabled:opacity-50"
            >
              {pending ? "…" : "Guardar"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
