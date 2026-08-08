"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { PlusIcon } from "../icons";
import { tapScaleSmall } from "@/lib/motion";

/** Shared "+ Agregar" trigger + centered modal — used for cards, movimientos
 * and metas de ahorro. */
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

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        {children(() => setOpen(false))}
      </Modal>
    </>
  );
}
