"use client";

import { Bar } from "./charts/bar";
import { BarChart } from "./charts/bar-chart";
import { BarValueAxis } from "./charts/bar-value-axis";
import { BarXAxis } from "./charts/bar-x-axis";
import { Grid } from "./charts/grid";
import { ChartTooltip } from "./charts/tooltip";
import { formatMXN } from "@/lib/format";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useIsMobile } from "@/lib/useIsMobile";

export interface CashflowWeek {
  label: string;
  income: number;
  expense: number;
  saving: number;
}

/** Weekly expense bars — reuses garmin-coach's bklit/@visx chart system for
 * visual consistency across both apps. */
export function CashflowChart({ data }: { data: CashflowWeek[] }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const isMobile = useIsMobile();

  return (
    <div ref={ref}>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        aspectRatio={isMobile ? "4 / 3" : "16 / 7"}
        barGap={0.4}
        status={inView ? "ready" : "loading"}
      >
        <Grid horizontal strokeDasharray="4,4" />
        <Bar dataKey="expense" fill="var(--accent)" />
        <BarXAxis maxLabels={isMobile ? 4 : 4} />
        <BarValueAxis format={(v) => formatMXN(v)} />
        <ChartTooltip
          rows={(point) => [{ color: "var(--accent)", label: "Gasto", value: formatMXN(Number(point.expense)) }]}
        />
      </BarChart>
    </div>
  );
}
