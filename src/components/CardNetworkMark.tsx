import type { CardNetwork } from "@/lib/cardBrands";
import { cn } from "@/lib/utils";

/** Simple redrawn network marks (geometric shapes / stylized wordmarks, not
 * official logo assets) — enough for a card face to read as "this is a
 * Mastercard/Visa/Amex" at a glance. */
export function CardNetworkMark({ network, className }: { network: CardNetwork; className?: string }) {
  if (network === "mastercard") {
    return (
      <div className={cn("flex items-center", className)} aria-label="Mastercard">
        <div className="h-6 w-6 rounded-full" style={{ background: "#eb001b" }} />
        <div className="-ml-2.5 h-6 w-6 rounded-full" style={{ background: "#f79e1b", opacity: 0.88 }} />
      </div>
    );
  }
  if (network === "visa") {
    return (
      <span className={cn("text-base font-bold italic tracking-tight", className)} aria-label="Visa">
        VISA
      </span>
    );
  }
  return (
    <span
      className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide", className)}
      style={{ background: "color-mix(in oklab, currentColor 15%, transparent)" }}
      aria-label="American Express"
    >
      AMEX
    </span>
  );
}
