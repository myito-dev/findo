-- Findo — atomic family creation.
--
-- Diagnosed root cause of the "new row violates row-level security policy for
-- table families" error: creating a family via two separate client-side
-- inserts (families, then family_members) hits a chicken-and-egg RLS problem.
-- `.insert(...).select()` compiles to `INSERT ... RETURNING`, and Postgres
-- checks RETURNING rows against the table's SELECT policy — but
-- families_select requires is_family_member(id), which is still false at
-- that point (the owner's family_members row hasn't been inserted yet).
-- Confirmed empirically: the same insert succeeds with no `.select()`, and
-- fails the instant a RETURNING clause is added.
--
-- Fix: do both inserts inside one SECURITY DEFINER function (same pattern as
-- join_family_by_code), which bypasses RLS entirely for its own writes/reads.

drop function if exists public.debug_whoami();

create function public.create_family(family_name text)
returns table (id uuid, name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family_id uuid;
begin
  insert into public.families (name, created_by)
  values (family_name, auth.uid())
  returning families.id into new_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (new_family_id, auth.uid(), 'owner');

  return query select f.id, f.name, f.invite_code from public.families f where f.id = new_family_id;
end;
$$;

grant execute on function public.create_family(text) to authenticated;
