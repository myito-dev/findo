-- Findo — initial schema.
-- Run this once against your Supabase project (SQL Editor, or `supabase db push`
-- if you use the CLI) after creating the project and adding its URL/keys to .env.local.

-- ---------------------------------------------------------------------------
-- profiles — one row per authenticated user, extends auth.users with display info.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- families + membership
-- ---------------------------------------------------------------------------
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- Bypasses RLS deliberately — used inside policies below to check membership
-- without recursively re-triggering the policy on family_members itself.
create function public.is_family_member(fam_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.family_members
    where family_id = fam_id and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- categories — shared vocabulary within a family, not privacy-sensitive.
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  icon text,
  color text,
  kind text not null check (kind in ('income', 'expense')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cards — personal (owner-only), can be crédito (with cut-off/payment dates)
-- or débito (dates are null).
-- ---------------------------------------------------------------------------
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  card_type text not null check (card_type in ('credito', 'debito')),
  last4 text,
  color text,
  cut_off_day smallint check (cut_off_day between 1 and 31),
  payment_due_day smallint check (payment_due_day between 1 and 31),
  credit_limit numeric(12, 2),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- transactions — personal by default (owner-only SELECT). Shared totals for
-- the household view are only ever exposed pre-aggregated, through
-- get_household_category_totals() below — never as raw rows to other members.
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  card_id uuid references public.cards (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  kind text not null check (kind in ('income', 'expense')),
  payment_method text not null default 'efectivo' check (payment_method in ('efectivo', 'tarjeta')),
  description text,
  is_shared boolean not null default false,
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index transactions_owner_date_idx on public.transactions (owner_id, occurred_at desc);
create index transactions_family_shared_idx on public.transactions (family_id, occurred_at) where is_shared;

-- Only ever returns aggregated sums, never individual rows — this is the
-- boundary that makes "household view = totals/categories only" a real
-- guarantee instead of a UI convention a family member could bypass by
-- querying the API directly.
create function public.get_household_category_totals(fam_id uuid, from_date date, to_date date)
returns table (category_id uuid, category_name text, kind text, total numeric)
language sql
security definer
set search_path = public
stable
as $$
  select t.category_id, c.name, t.kind, sum(t.amount) as total
  from public.transactions t
  join public.categories c on c.id = t.category_id
  where t.family_id = fam_id
    and t.is_shared = true
    and t.occurred_at between from_date and to_date
    and public.is_family_member(fam_id)
  group by t.category_id, c.name, t.kind;
$$;

-- ---------------------------------------------------------------------------
-- savings — goals can be personal or shared (is_shared = true rows are
-- visible to the whole family as a row, since a goal like "Viaje: 20k/50k"
-- is meant to be seen, unlike the transactions that fund it).
-- ---------------------------------------------------------------------------
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2),
  target_date date,
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  amount numeric(12, 2) not null,
  occurred_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;

-- profiles: visible to yourself and to anyone who shares a family with you
-- (needed to show names/avatars in the member list and household view).
create policy "profiles_select" on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.family_members me
      join public.family_members them on them.family_id = me.family_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid());

-- families: visible to members; creatable by any signed-in user.
create policy "families_select" on public.families for select
  using (public.is_family_member(id));
create policy "families_insert" on public.families for insert
  with check (created_by = auth.uid());
create policy "families_update_owner" on public.families for update
  using (exists (select 1 from public.family_members where family_id = id and user_id = auth.uid() and role = 'owner'));

-- family_members: visible to fellow members; owners can add/remove members.
create policy "family_members_select" on public.family_members for select
  using (public.is_family_member(family_id));
create policy "family_members_insert_owner" on public.family_members for insert
  with check (
    -- the very first member (creating their own family) or an existing owner adding someone
    not exists (select 1 from public.family_members where family_id = family_members.family_id)
    or exists (select 1 from public.family_members where family_id = family_members.family_id and user_id = auth.uid() and role = 'owner')
  );
create policy "family_members_delete_owner" on public.family_members for delete
  using (exists (select 1 from public.family_members fm where fm.family_id = family_members.family_id and fm.user_id = auth.uid() and fm.role = 'owner'));

-- categories: any family member can manage the family's category list.
create policy "categories_all" on public.categories for all
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- cards: strictly owner-only, in every direction.
create policy "cards_owner_only" on public.cards for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_family_member(family_id));

-- transactions: strictly owner-only SELECT — shared totals go through
-- get_household_category_totals() instead, never through this table directly.
create policy "transactions_owner_only" on public.transactions for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_family_member(family_id));

-- savings_goals: your own goals, plus shared goals from your family (as rows —
-- see the comment above the table).
create policy "savings_goals_select" on public.savings_goals for select
  using (owner_id = auth.uid() or (is_shared and public.is_family_member(family_id)));
create policy "savings_goals_write_own" on public.savings_goals for insert
  with check (owner_id = auth.uid() and public.is_family_member(family_id));
create policy "savings_goals_update_own" on public.savings_goals for update
  using (owner_id = auth.uid());
create policy "savings_goals_delete_own" on public.savings_goals for delete
  using (owner_id = auth.uid());

-- savings_contributions: follow the parent goal's visibility.
create policy "savings_contributions_select" on public.savings_contributions for select
  using (exists (
    select 1 from public.savings_goals g
    where g.id = goal_id and (g.owner_id = auth.uid() or (g.is_shared and public.is_family_member(g.family_id)))
  ));
create policy "savings_contributions_write_own" on public.savings_contributions for insert
  with check (exists (select 1 from public.savings_goals g where g.id = goal_id and g.owner_id = auth.uid()));
