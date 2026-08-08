import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { TransactionRow } from "@/components/forms/TransactionRow";
import { NoFamilyPrompt } from "@/components/NoFamilyPrompt";
import { Card } from "@/components/ui/Card";
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
      .select("id, amount, kind, description, occurred_at, category_id, payment_method, card_id, is_shared")
      .eq("owner_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(100),
    supabase.from("categories").select("id, name, kind").eq("family_id", familyId).order("name"),
    supabase.from("cards").select("id, name").eq("owner_id", user.id).order("name"),
  ]);

  const txList = transactions ?? [];
  const categoryList = categories ?? [];
  const cardList = cards ?? [];
  const categoryNameById = new Map(categoryList.map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Movimientos</h1>
        <AddTransactionForm categories={categoryList} cards={cardList} />
      </div>

      <Card>
        {txList.length === 0 ? (
          <p className="text-sm text-ink-secondary">Todavía no registras movimientos. Usa &quot;Agregar&quot; arriba.</p>
        ) : (
          <div className="space-y-3">
            {txList.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                fallbackLabel={(t.category_id && categoryNameById.get(t.category_id)) || "Movimiento"}
                categories={categoryList}
                cards={cardList}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
