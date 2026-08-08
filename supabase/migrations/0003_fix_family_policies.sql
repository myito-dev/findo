-- Findo — re-assert the families/family_members INSERT policies idempotently.
-- Diagnosed: inserting into `families` was rejected by RLS even though
-- auth.uid() resolves correctly elsewhere (profiles_select, is_family_member()
-- both work) — the live `families_insert` policy had drifted from what
-- migration 0001 defines. Dropping and recreating guarantees they match.

drop policy if exists "families_insert" on public.families;
create policy "families_insert" on public.families for insert
  with check (created_by = auth.uid());

drop policy if exists "family_members_insert_owner" on public.family_members;
create policy "family_members_insert_owner" on public.family_members for insert
  with check (
    not exists (select 1 from public.family_members where family_id = family_members.family_id)
    or exists (select 1 from public.family_members where family_id = family_members.family_id and user_id = auth.uid() and role = 'owner')
  );
