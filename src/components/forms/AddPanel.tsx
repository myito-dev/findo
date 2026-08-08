"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { PlusIcon } from "../icons";
import { springSnappy, tapScaleSmall } from "@/lib/motion";

/** Shared "+ Agregar" trigger + collapsible form panel — used for cards,
 * movimientos, metas de ahorro and contribuciones so each only has to
 * define its own fields. */
export function AddPanel({ label, children }: { label: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <motion.button
        type="button"
        whileTap={tapScaleSmall}
        onClick={() => setOpen((o) => !o)}
        className="pill flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
      >
        <PlusIcon className="h-4 w-4" />
        {label}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSnappy}
            className="overflow-hidden"
          >
            <div className="card mt-3 p-4">{children(() => setOpen(false))}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
