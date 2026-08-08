"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { tapScaleSmall } from "@/lib/motion";

/** Plain `<button>` with the app's standard tap feedback — used from Server
 * Component pages that can't hold `motion.button` directly. */
export function TapButton({ className, children, ...rest }: HTMLMotionProps<"button">) {
  return (
    <motion.button type="button" whileTap={tapScaleSmall} className={className} {...rest}>
      {children}
    </motion.button>
  );
}
