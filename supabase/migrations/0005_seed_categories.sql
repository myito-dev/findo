-- Findo — seed a default category set whenever a family is created, so
-- transactions have something to categorize into without a separate
-- "manage categories" step blocking first use.

create or replace function public.create_family(family_name text)
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

  insert into public.categories (family_id, name, kind) values
    (new_family_id, 'Comida', 'expense'),
    (new_family_id, 'Transporte', 'expense'),
    (new_family_id, 'Compras', 'expense'),
    (new_family_id, 'Suscripciones', 'expense'),
    (new_family_id, 'Entretenimiento', 'expense'),
    (new_family_id, 'Salud', 'expense'),
    (new_family_id, 'Hogar', 'expense'),
    (new_family_id, 'Otros gastos', 'expense'),
    (new_family_id, 'Nómina', 'income'),
    (new_family_id, 'Freelance', 'income'),
    (new_family_id, 'Otros ingresos', 'income');

  return query select f.id, f.name, f.invite_code from public.families f where f.id = new_family_id;
end;
$$;

-- Backfill: any family created before this migration (e.g. your test
-- "Familia Galindo") has zero categories — give it the same default set.
insert into public.categories (family_id, name, kind)
select f.id, c.name, c.kind
from public.families f
cross join (values
  ('Comida', 'expense'), ('Transporte', 'expense'), ('Compras', 'expense'),
  ('Suscripciones', 'expense'), ('Entretenimiento', 'expense'), ('Salud', 'expense'),
  ('Hogar', 'expense'), ('Otros gastos', 'expense'),
  ('Nómina', 'income'), ('Freelance', 'income'), ('Otros ingresos', 'income')
) as c(name, kind)
where not exists (select 1 from public.categories where family_id = f.id);
