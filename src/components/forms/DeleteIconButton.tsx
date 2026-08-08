"use client";

import { motion } from "motion/react";
import { useTransition } from "react";
import { XIcon } from "../icons";
import { tapScaleSmall } from "@/lib/motion";

export function DeleteIconButton({ action, id, label }: { action: (id: string) => Promise<void>; id: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={tapScaleSmall}
      disabled={pending}
      onClick={() => startTransition(() => action(id))}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted disabled:opacity-50"
    >
      <XIcon className="h-3.5 w-3.5" />
    </motion.button>
  );
}
