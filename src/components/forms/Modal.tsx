"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { XIcon } from "../icons";
import { springSnappy } from "@/lib/motion";

/** Generic centered modal shell (backdrop + card) — controlled by the
 * caller's own open state. Shared by AddPanel (create) and edit modals. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-muted"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
