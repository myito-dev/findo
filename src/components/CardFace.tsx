import { CardNetworkMark } from "./CardNetworkMark";
import { detectBankBrand, detectNetwork } from "@/lib/cardBrands";
import { formatMXN } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Detects the issuing bank / network from the card's free-text name and
 * renders a matching brand-colored face. Unrecognized cards fall back to the
 * app's plain card style, still showing the name/last4/amount. */
export function CardFace({
  name,
  cardType,
  last4,
  spentThisCycle,
}: {
  name: string;
  cardType: "credito" | "debito";
  last4: string;
  spentThisCycle: number;
}) {
  const brand = detectBankBrand(name);
  const network = detectNetwork(name);
  const muted = brand ? "opacity-70" : "text-ink-muted";

  return (
    <div
      className={cn("rounded-3xl p-5", !brand && "card")}
      style={brand ? { background: brand.gradient, color: brand.ink } : undefined}
    >
      <div className="mb-8 flex items-center justify-between">
        <span className={cn("text-xs", muted)}>{cardType === "credito" ? "Crédito" : "Débito"}</span>
        <span className="text-xs font-medium">•••• {last4}</span>
      </div>
      <p className={cn("text-xs", muted)}>Gastado este ciclo</p>
      <p className="tabular text-2xl font-bold tracking-tight">{formatMXN(spentThisCycle)}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="truncate text-sm font-semibold">{name}</p>
        {network && <CardNetworkMark network={network} className="shrink-0" />}
      </div>
    </div>
  );
}
