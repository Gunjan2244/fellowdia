-- Fellowdia schema: profiles, fellowships, saves + RLS + search RPC
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table public.fellowships (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 140),
  organization text not null check (char_length(organization) between 2 and 120),
  description text not null,
  eligibility text,
  stipend text,
  location text,
  category text not null,
  deadline date,
  apply_url text not null check (apply_url ~* '^https://'),
  status text not null default 'draft' check (status in ('draft','published')),
  created_by uuid default auth.uid() references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index fellowships_feed_idx on public.fellowships (status, deadline);

create table public.saves (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  fellowship_id uuid not null references public.fellowships on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, fellowship_id)
);

-- helpers
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger fellowships_touch before update on public.fellowships
  for each row execute function public.touch_updated_at();

-- server function: search open, published fellowships (RLS still applies)
create function public.search_fellowships(q text default '', cat text default null)
returns setof public.fellowships language sql stable security invoker as $$
  select * from public.fellowships f
  where f.status = 'published'
    and (f.deadline is null or f.deadline >= current_date)
    and (cat is null or f.category = cat)
    and (coalesce(q,'') = ''
         or position(lower(q) in lower(f.title)) > 0
         or position(lower(q) in lower(f.organization)) > 0)
  order by f.deadline asc nulls last, f.created_at desc
  limit 100
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.fellowships enable row level security;
alter table public.saves enable row level security;

create policy "read own profile" on public.profiles for select using (id = auth.uid());
-- no insert/update policy on profiles: roles can only be changed in the SQL editor

create policy "read published or admin" on public.fellowships
  for select using (status = 'published' or public.is_admin());
create policy "admin insert" on public.fellowships for insert with check (public.is_admin());
create policy "admin update" on public.fellowships for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.fellowships for delete using (public.is_admin());

create policy "own saves" on public.saves for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
