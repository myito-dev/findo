import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { DeleteIconButton } from "@/components/forms/DeleteIconButton";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { Card } from "@/components/ui/Card";
import { deleteTransaction } from "@/lib/actions";
import { formatDateShort, formatMXN } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

export default async function MovimientosPage() {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);

  if (!user) return null;

  if (!familyId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Movimientos</h1>
        <NoFamilyPrompt />
      </div>
    );
  }

  const [{ data: transactions }, { data: categories }, { data: cards }] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, amount, kind, description, occurred_at, category_id")
      .eq("owner_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(100),
    supabase.from("categories").select("id, name, kind").eq("family_id", familyId).order("name"),
    supabase.from("cards").select("id, name").eq("owner_id", user.id).order("name"),
  ]);

  const txList = transactions ?? [];
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Movimientos</h1>
        <AddTransactionForm categories={categories ?? []} cards={cards ?? []} />
      </div>

      <Card>
        {txList.length === 0 ? (
          <p className="text-sm text-ink-secondary">Todavía no registras movimientos. Usa &quot;Agregar&quot; arriba.</p>
        ) : (
          <div className="space-y-3">
            {txList.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {t.description || (t.category_id && categoryNameById.get(t.category_id)) || "Movimiento"}
                  </p>
                  <p className="text-xs text-ink-muted">{formatDateShort(t.occurred_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`tabular text-sm font-semibold ${t.kind === "income" ? "text-positive" : "text-ink"}`}>
                    {formatMXN(t.amount, { showSign: t.kind === "income" })}
                  </span>
                  <DeleteIconButton action={deleteTransaction} id={t.id} label="Eliminar movimiento" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
