-- Findo — get_household_category_totals() used an inner join against
-- categories, silently dropping any shared transaction with no category
-- picked (category_id null) from the household totals entirely. Switch to
-- a left join so uncategorized shared transactions still count, grouped
-- under a null category_id/name that the UI can label "Sin categoría".
create or replace function public.get_household_category_totals(fam_id uuid, from_date date, to_date date)
returns table (category_id uuid, category_name text, kind text, total numeric)
language sql
security definer
set search_path = public
stable
as $$
  select t.category_id, c.name, t.kind, sum(t.amount) as total
  from public.transactions t
  left join public.categories c on c.id = t.category_id
  where t.family_id = fam_id
    and t.is_shared = true
    and t.occurred_at between from_date and to_date
    and public.is_family_member(fam_id)
  group by t.category_id, c.name, t.kind;
$$;
