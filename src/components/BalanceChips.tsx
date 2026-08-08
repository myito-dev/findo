"use client";

import { motion } from "motion/react";
import { CardIcon, PiggyBankIcon, WalletIcon } from "./icons";
import { cn } from "@/lib/utils";
import { formatMXN } from "@/lib/format";
import { springSmooth } from "@/lib/motion";

const CHIP_ICONS = { wallet: WalletIcon, card: CardIcon, piggy: PiggyBankIcon };

export interface BalanceChip {
  label: string;
  value: number;
  icon: keyof typeof CHIP_ICONS;
}

/** The three balance chips (Efectivo / Tarjetas / Ahorros) linked by a lime
 * connector line, with the featured (middle) chip larger and glowing —
 * matches the reference's "connected circles" balance visual. Reusable
 * wherever the balance breakdown appears (Dashboard, Ahorros, etc). */
export function BalanceChips({ chips, featuredIndex = 1 }: { chips: BalanceChip[]; featuredIndex?: number }) {
  return (
    <div className="relative mt-6">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ ...springSmooth, delay: 0.15 }}
        className="pointer-events-none absolute top-7 h-px"
        style={{
          left: `${100 / chips.length / 2}%`,
          right: `${100 / chips.length / 2}%`,
          transformOrigin: "center",
          background: "linear-gradient(90deg, transparent, var(--accent) 50%, transparent)",
        }}
      />
      <div className="relative flex items-start justify-between">
        {chips.map((chip, i) => {
          const featured = i === featuredIndex;
          const Icon = CHIP_ICONS[chip.icon];
          return (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...springSmooth, delay: i * 0.08 }}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <motion.div
                animate={
                  featured
                    ? {
                        boxShadow: [
                          "0 0 0 6px color-mix(in oklab, var(--accent) 18%, transparent), 0 0 24px -4px var(--accent)",
                          "0 0 0 6px color-mix(in oklab, var(--accent) 24%, transparent), 0 0 36px -4px var(--accent)",
                          "0 0 0 6px color-mix(in oklab, var(--accent) 18%, transparent), 0 0 24px -4px var(--accent)",
                        ],
                      }
                    : undefined
                }
                transition={featured ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                className={cn(
                  "flex items-center justify-center rounded-full",
                  featured ? "h-14 w-14 bg-accent text-accent-ink" : "h-11 w-11 bg-surface text-ink-secondary"
                )}
              >
                <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} />
              </motion.div>
              <div className="text-center">
                <p className="tabular text-xs font-bold sm:text-sm">{formatMXN(chip.value)}</p>
                <p className="text-[10px] text-ink-muted">{chip.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
