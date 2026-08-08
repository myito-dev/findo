"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { PlusIcon, XIcon } from "../icons";
import { springSnappy, tapScaleSmall } from "@/lib/motion";

/** Shared "+ Agregar" trigger + centered modal — used for cards, movimientos
 * and metas de ahorro. A modal (not an inline-expanding panel) so opening it
 * never pushes or misaligns the page header next to the trigger button. */
export function AddPanel({ label, title, children }: { label: string; title: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileTap={tapScaleSmall}
        onClick={() => setOpen(true)}
        className="pill flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
      >
        <PlusIcon className="h-4 w-4" />
        {label}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={springSnappy}
                className="card pointer-events-auto max-h-[85vh] w-full max-w-md overflow-y-auto p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-base font-semibold">{title}</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-muted"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {children(() => setOpen(false))}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
