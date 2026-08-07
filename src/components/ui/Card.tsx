import { cn } from "@/lib/utils";

export function Card({ className, accent, children }: { className?: string; accent?: boolean; children: React.ReactNode }) {
  return <div className={cn(accent ? "card-accent" : "card", "p-5 sm:p-6", className)}>{children}</div>;
}
