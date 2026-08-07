"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";
import { formatMXN } from "@/lib/format";

export interface CashflowWeek {
  label: string;
  income: number;
  expense: number;
  saving: number;
}

/** Weekly expense bars, with the highest one highlighted in the accent color
 * and its value floating above it in a small pill — matches the reference's
 * "raised bar + value bubble" cashflow chart. */
export function CashflowChart({ data }: { data: CashflowWeek[] }) {
  const highlightIndex = data.reduce((maxI, d, i) => (d.expense > data[maxI].expense ? i : maxI), 0);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--ink-muted)", fontSize: 11 }} />
          <Bar dataKey="expense" radius={[10, 10, 10, 10]} maxBarSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === highlightIndex ? "var(--accent)" : "var(--surface)"} />
            ))}
            <LabelList
              dataKey="expense"
              position="top"
              content={(props) => {
                const { x, y, width, value, index } = props;
                if (index !== highlightIndex || typeof x !== "number" || typeof width !== "number" || typeof y !== "number") return null;
                return (
                  <g>
                    <rect x={x + width / 2 - 34} y={y - 26} width={68} height={20} rx={10} fill="var(--ink)" />
                    <text x={x + width / 2} y={y - 12} textAnchor="middle" fontSize={10} fill="var(--page)">
                      {formatMXN(Number(value))}
                    </text>
                  </g>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
