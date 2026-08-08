"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getUserAndFamily } from "./supabase/family";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v.length > 0 ? v : null;
}

export async function addCard(formData: FormData) {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);
  if (!user || !familyId) throw new Error("No perteneces a una familia todavía.");

  const cardType = str(formData, "cardType");
  const cutOffDay = optionalStr(formData, "cutOffDay");
  const paymentDueDay = optionalStr(formData, "paymentDueDay");

  await supabase.from("cards").insert({
    owner_id: user.id,
    family_id: familyId,
    name: str(formData, "name"),
    card_type: cardType === "debito" ? "debito" : "credito",
    last4: optionalStr(formData, "last4"),
    cut_off_day: cardType === "credito" && cutOffDay ? Number(cutOffDay) : null,
    payment_due_day: cardType === "credito" && paymentDueDay ? Number(paymentDueDay) : null,
  });

  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function updateCard(cardId: string, formData: FormData) {
  const supabase = await createClient();
  const cardType = str(formData, "cardType");
  const cutOffDay = optionalStr(formData, "cutOffDay");
  const paymentDueDay = optionalStr(formData, "paymentDueDay");

  await supabase
    .from("cards")
    .update({
      name: str(formData, "name"),
      card_type: cardType === "debito" ? "debito" : "credito",
      last4: optionalStr(formData, "last4"),
      cut_off_day: cardType === "credito" && cutOffDay ? Number(cutOffDay) : null,
      payment_due_day: cardType === "credito" && paymentDueDay ? Number(paymentDueDay) : null,
    })
    .eq("id", cardId);

  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient();
  await supabase.from("cards").delete().eq("id", cardId);
  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);
  if (!user || !familyId) throw new Error("No perteneces a una familia todavía.");

  const paymentMethod = str(formData, "paymentMethod");

  await supabase.from("transactions").insert({
    owner_id: user.id,
    family_id: familyId,
    kind: str(formData, "kind") === "income" ? "income" : "expense",
    amount: Number(str(formData, "amount")),
    category_id: optionalStr(formData, "categoryId"),
    card_id: paymentMethod === "tarjeta" ? optionalStr(formData, "cardId") : null,
    payment_method: paymentMethod === "tarjeta" ? "tarjeta" : "efectivo",
    description: optionalStr(formData, "description"),
    is_shared: formData.get("isShared") === "on",
    occurred_at: optionalStr(formData, "occurredAt") ?? undefined,
  });

  revalidatePath("/movimientos");
  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = await createClient();
  const paymentMethod = str(formData, "paymentMethod");

  await supabase
    .from("transactions")
    .update({
      kind: str(formData, "kind") === "income" ? "income" : "expense",
      amount: Number(str(formData, "amount")),
      category_id: optionalStr(formData, "categoryId"),
      card_id: paymentMethod === "tarjeta" ? optionalStr(formData, "cardId") : null,
      payment_method: paymentMethod === "tarjeta" ? "tarjeta" : "efectivo",
      description: optionalStr(formData, "description"),
      is_shared: formData.get("isShared") === "on",
      occurred_at: optionalStr(formData, "occurredAt") ?? undefined,
    })
    .eq("id", transactionId);

  revalidatePath("/movimientos");
  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", transactionId);
  revalidatePath("/movimientos");
  revalidatePath("/tarjetas");
  revalidatePath("/");
}

export async function addSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const { user, familyId } = await getUserAndFamily(supabase);
  if (!user || !familyId) throw new Error("No perteneces a una familia todavía.");

  await supabase.from("savings_goals").insert({
    owner_id: user.id,
    family_id: familyId,
    name: str(formData, "name"),
    target_amount: Number(str(formData, "targetAmount")),
    target_date: optionalStr(formData, "targetDate"),
    is_shared: formData.get("isShared") === "on",
  });

  revalidatePath("/ahorros");
  revalidatePath("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const displayName = str(formData, "displayName");
  const avatarFile = formData.get("avatar");

  let avatarUrl: string | undefined;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    }
  }

  await supabase
    .from("profiles")
    .update({
      ...(displayName ? { display_name: displayName } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  revalidatePath("/perfil");
  revalidatePath("/configuracion");
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const { familyId } = await getUserAndFamily(supabase);
  if (!familyId) throw new Error("No perteneces a una familia todavía.");

  const kind = str(formData, "kind") === "income" ? "income" : "expense";

  await supabase.from("categories").insert({
    family_id: familyId,
    name: str(formData, "name"),
    kind,
  });

  revalidatePath("/configuracion");
  revalidatePath("/movimientos");
  revalidatePath("/");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/configuracion");
  revalidatePath("/movimientos");
  revalidatePath("/");
}

export async function addContribution(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("savings_contributions").insert({
    goal_id: str(formData, "goalId"),
    amount: Number(str(formData, "amount")),
    note: optionalStr(formData, "note"),
  });

  revalidatePath("/ahorros");
  revalidatePath("/");
}
