"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TapButton } from "@/components/ui/TapButton";
import { XIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { addCategory, deleteCategory } from "@/lib/actions";

interface FamilyInfo {
  id: string;
  name: string;
  invite_code: string;
}

interface FamilyMemberRow {
  user_id: string;
  role: "owner" | "member";
  display_name: string;
}

interface CategoryRow {
  id: string;
  name: string;
  kind: "income" | "expense";
}

export default function ConfiguracionPage() {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [members, setMembers] = useState<FamilyMemberRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [familyName, setFamilyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryKind, setNewCategoryKind] = useState<"expense" | "income">("expense");
  const [addingCategory, setAddingCategory] = useState(false);

  const loadFamily = useCallback(
    async (uid: string) => {
      const { data: membership } = await supabase.from("family_members").select("family_id").eq("user_id", uid).limit(1).maybeSingle();

      if (!membership) {
        setFamily(null);
        setMembers([]);
        return;
      }

      const { data: fam } = await supabase.from("families").select("id, name, invite_code").eq("id", membership.family_id).single();
      if (fam) setFamily(fam);

      const { data: memberRows } = await supabase.from("family_members").select("user_id, role").eq("family_id", membership.family_id);

      if (memberRows && memberRows.length > 0) {
        const ids = memberRows.map((m) => m.user_id);
        const { data: profileRows } = await supabase.from("profiles").select("id, display_name").in("id", ids);
        const nameById = new Map((profileRows ?? []).map((p) => [p.id, p.display_name]));
        setMembers(memberRows.map((m) => ({ user_id: m.user_id, role: m.role, display_name: nameById.get(m.user_id) ?? "?" })));
      } else {
        setMembers([]);
      }

      const { data: categoryRows } = await supabase
        .from("categories")
        .select("id, name, kind")
        .eq("family_id", membership.family_id)
        .order("name");
      setCategories(categoryRows ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      await loadFamily(user.id);
      setLoading(false);
    })();
  }, [supabase, loadFamily]);

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !familyName.trim()) return;
    setCreating(true);
    setError(null);

    const { error: famErr } = await supabase.rpc("create_family", { family_name: familyName.trim() });

    if (famErr) {
      setError("No se pudo crear la familia. Intenta de nuevo.");
      setCreating(false);
      return;
    }

    await loadFamily(userId);
    setFamilyName("");
    setCreating(false);
  }

  async function handleJoinFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !inviteCode.trim()) return;
    setJoining(true);
    setError(null);

    const { error: joinErr } = await supabase.rpc("join_family_by_code", { code: inviteCode.trim() });
    if (joinErr) {
      setError("Código inválido. Verifica con quien te lo compartió.");
      setJoining(false);
      return;
    }

    await loadFamily(userId);
    setInviteCode("");
    setJoining(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !newCategoryName.trim()) return;
    setAddingCategory(true);

    const formData = new FormData();
    formData.set("name", newCategoryName.trim());
    formData.set("kind", newCategoryKind);
    await addCategory(formData);

    await loadFamily(userId);
    setNewCategoryName("");
    setAddingCategory(false);
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!userId) return;
    await deleteCategory(categoryId);
    await loadFamily(userId);
  }

  function copyInviteCode() {
    if (!family) return;
    navigator.clipboard.writeText(family.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <p className="text-sm text-ink-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configuración</h1>

      {family ? (
        <>
          <Card>
            <p className="text-sm text-ink-muted">Tu familia</p>
            <p className="text-xl font-bold tracking-tight">{family.name}</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <div>
                <p className="text-xs text-ink-muted">Código de invitación</p>
                <p className="tabular text-lg font-bold tracking-widest">{family.invite_code}</p>
              </div>
              <TapButton onClick={copyInviteCode} className="pill bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
                {copied ? "Copiado" : "Copiar"}
              </TapButton>
            </div>
            <p className="mt-2 text-xs text-ink-muted">Comparte este código con quien quieras agregar a la familia.</p>
          </Card>

          <Card>
            <p className="mb-3 text-sm text-ink-muted">Miembros</p>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
                  <p className="text-sm font-medium">
                    {m.display_name} {m.user_id === userId && <span className="text-ink-muted">(tú)</span>}
                  </p>
                  <span className="pill bg-page px-2.5 py-1 text-xs text-ink-secondary">{m.role === "owner" ? "Dueño" : "Miembro"}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm text-ink-muted">Categorías</p>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-ink-muted">Gastos</p>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => c.kind === "expense")
                    .map((c) => (
                      <span key={c.id} className="pill flex items-center gap-1.5 bg-surface py-1.5 pl-3 pr-1.5 text-sm">
                        {c.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          aria-label={`Eliminar ${c.name}`}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:text-negative"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-ink-muted">Ingresos</p>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((c) => c.kind === "income")
                    .map((c) => (
                      <span key={c.id} className="pill flex items-center gap-1.5 bg-surface py-1.5 pl-3 pr-1.5 text-sm">
                        {c.name}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          aria-label={`Eliminar ${c.name}`}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:text-negative"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="mt-4 flex gap-2">
              <select
                value={newCategoryKind}
                onChange={(e) => setNewCategoryKind(e.target.value as "expense" | "income")}
                className="rounded-2xl border border-hairline bg-surface px-3 py-2.5 text-sm outline-none"
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría"
                className="flex-1 rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none"
              />
              <TapButton type="submit" disabled={addingCategory} className="pill bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
                Agregar
              </TapButton>
            </form>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <p className="mb-3 text-sm text-ink-muted">Crear una familia</p>
            <form onSubmit={handleCreateFamily} className="flex gap-2">
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Nombre de tu familia"
                className="flex-1 rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm outline-none"
              />
              <TapButton type="submit" disabled={creating} className="pill bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
                Crear
              </TapButton>
            </form>
          </Card>

          <Card>
            <p className="mb-3 text-sm text-ink-muted">O únete con un código</p>
            <form onSubmit={handleJoinFamily} className="flex gap-2">
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Código de invitación"
                className="flex-1 rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm uppercase tracking-widest outline-none"
              />
              <TapButton type="submit" disabled={joining} className="pill border border-hairline px-4 py-2.5 text-sm font-medium">
                Unirme
              </TapButton>
            </form>
          </Card>
        </>
      )}

      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}
