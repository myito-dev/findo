import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getUserAndFamily } from "@/lib/supabase/family";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);

  let cardAlerts: { name: string; cutOffDay: number | null; paymentDueDay: number | null }[] = [];
  let displayName = "";
  let avatarUrl: string | null = null;
  let familyName: string | null = null;

  if (user) {
    const [{ data: cards }, { data: profile }] = await Promise.all([
      supabase.from("cards").select("name, cut_off_day, payment_due_day").eq("owner_id", user.id).eq("card_type", "credito"),
      supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single(),
    ]);
    cardAlerts = (cards ?? []).map((c) => ({ name: c.name, cutOffDay: c.cut_off_day, paymentDueDay: c.payment_due_day }));
    displayName = profile?.display_name ?? "";
    avatarUrl = profile?.avatar_url ?? null;

    if (familyId) {
      const { data: family } = await supabase.from("families").select("name").eq("id", familyId).single();
      familyName = family?.name ?? null;
    }
  }

  return (
    <div className="min-h-full">
      <NavBar cardAlerts={cardAlerts} account={{ displayName, avatarUrl, familyName }} />
      <main className="pb-[calc(env(safe-area-inset-bottom)+112px)] sm:pb-10">{children}</main>
    </div>
  );
}
