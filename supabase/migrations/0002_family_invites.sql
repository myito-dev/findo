-- Findo — invite codes so a family owner can invite a member (e.g. papá)
-- without needing an email-invite system.

alter table public.families
  add column invite_code text unique not null default upper(substr(md5(gen_random_uuid()::text), 1, 8));

-- Lets a signed-in user who isn't a member yet resolve an invite code and
-- join. SECURITY DEFINER is required here: families_select's RLS (member-only)
-- would otherwise block looking up a family you're not in yet — this is the
-- one deliberate, narrow bypass, same pattern as get_household_category_totals().
create function public.join_family_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  fam_id uuid;
begin
  select id into fam_id from public.families where invite_code = upper(code);
  if fam_id is null then
    raise exception 'Código de invitación inválido';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (fam_id, auth.uid(), 'member')
  on conflict (family_id, user_id) do nothing;

  return fam_id;
end;
$$;

grant execute on function public.join_family_by_code(text) to authenticated;
