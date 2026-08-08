import { ProfileForm } from "@/components/forms/ProfileForm";
import { Card } from "@/components/ui/Card";
import { signOut } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Perfil</h1>

      <Card>
        <ProfileForm displayName={profile?.display_name ?? ""} avatarUrl={profile?.avatar_url ?? null} email={user.email ?? ""} />
      </Card>

      <Card>
        <form action={signOut}>
          <button type="submit" className="pill w-full border border-hairline py-2.5 text-sm font-medium text-negative">
            Cerrar sesión
          </button>
        </form>
      </Card>
    </div>
  );
}
