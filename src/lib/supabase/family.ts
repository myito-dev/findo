import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Resolves the signed-in user and their family_id in one round trip —
 * shared by every page and Server Action that needs to scope a query/write
 * to "my family". Returns familyId: null if the user hasn't created or
 * joined one yet (callers should prompt them to Configuración). */
export async function getUserAndFamily(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, familyId: null as string | null };

  const { data: membership } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).maybeSingle();

  return { user, familyId: membership?.family_id ?? null };
}
