"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springSmooth } from "@/lib/motion";

export function Card({ className, accent, children }: { className?: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={springSmooth}
      className={cn(accent ? "card-accent" : "card", "p-5 sm:p-6", className)}
    >
      {children}
    </motion.div>
  );
}
