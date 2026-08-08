"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BellIcon, CardIcon } from "./icons";
import { cn } from "@/lib/utils";
import { daysUntil } from "@/lib/format";
import { springSnappy, tapScaleSmall } from "@/lib/motion";

export interface CardAlertSource {
  name: string;
  cutOffDay: number | null;
  paymentDueDay: number | null;
}

interface CardAlert {
  cardName: string;
  type: "corte" | "pago";
  days: number;
}

const URGENT_THRESHOLD = 5;

function buildCardAlerts(cards: CardAlertSource[]): CardAlert[] {
  const alerts: CardAlert[] = [];
  for (const card of cards) {
    const cutOffIn = daysUntil(card.cutOffDay);
    const paymentIn = daysUntil(card.paymentDueDay);
    if (cutOffIn !== null) alerts.push({ cardName: card.name, type: "corte", days: cutOffIn });
    if (paymentIn !== null) alerts.push({ cardName: card.name, type: "pago", days: paymentIn });
  }
  return alerts.sort((a, b) => a.days - b.days);
}

/** Bell button + dropdown — v1 only surfaces upcoming card corte/pago dates
 * (the one alert type with real, unambiguous data behind it already).
 * Sobregasto / metas / gasto compartido can layer in once real Supabase
 * data exists to detect them from. */
export function AlertsBell({ cards }: { cards: CardAlertSource[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const alerts = buildCardAlerts(cards);
  const urgentCount = alerts.filter((a) => a.days <= URGENT_THRESHOLD).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        aria-label="Alertas"
        onClick={() => setOpen((o) => !o)}
        whileTap={tapScaleSmall}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-secondary"
      >
        <motion.span animate={open ? { rotate: [0, -12, 10, -6, 0] } : {}} transition={{ duration: 0.4 }}>
          <BellIcon className="h-4 w-4" />
        </motion.span>
        {urgentCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-ink">
            {urgentCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={springSnappy}
            style={{ transformOrigin: "top right" }}
            className="card absolute right-0 top-11 z-50 w-72 !p-2 shadow-xl"
          >
            <p className="px-2 py-1.5 text-xs font-semibold text-ink-muted">Alertas de tarjetas</p>
            {alerts.length === 0 ? (
              <p className="px-2 py-3 text-sm text-ink-muted">Sin alertas por ahora.</p>
            ) : (
              <div className="space-y-0.5">
                {alerts.map((a) => (
                  <div key={`${a.cardName}-${a.type}`} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        a.days <= URGENT_THRESHOLD ? "bg-accent text-accent-ink" : "bg-surface text-ink-secondary"
                      )}
                    >
                      <CardIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.cardName}</p>
                      <p className="text-xs text-ink-muted">
                        {a.type === "corte" ? "Corte" : "Pago"} en {a.days} día{a.days === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
