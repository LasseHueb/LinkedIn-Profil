-- Firmen-Pakete: Firmen-Konten, Firmen-Rahmen, Download-Zähler, Logos, Kontaktanfragen.
-- Fotos von Mitarbeitenden werden NIE gespeichert – nur Rahmen-Einstellungen.

-- ---------- Firmen ----------
create table if not exists public.companies (
  id                     uuid primary key default gen_random_uuid(),
  owner_id               uuid not null unique references auth.users (id) on delete cascade,
  name                   text not null check (char_length(name) between 2 and 80),
  plan                   text not null default 'none' check (plan in ('none', 'starter', 'team')),
  plan_status            text not null default 'inactive',
  plan_expires_at        timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  created_at             timestamptz not null default now()
);

-- ---------- Firmen-Rahmen ----------
create table if not exists public.company_templates (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies (id) on delete cascade,
  slug           text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  title          text not null default 'Firmen-Rahmen' check (char_length(title) between 1 and 80),
  settings       jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object' and pg_column_size(settings) < 8000),
  locked         boolean not null default true,
  logo_path      text check (logo_path is null or char_length(logo_path) < 300),
  download_count integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists company_templates_company_idx on public.company_templates (company_id);

-- ---------- Kontaktanfragen (nur über Edge Function "contact") ----------
create table if not exists public.contact_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) <= 120),
  email      text not null check (char_length(email) <= 254),
  company    text check (char_length(company) <= 120),
  message    text not null check (char_length(message) <= 4000),
  created_at timestamptz not null default now()
);

-- ---------- Hilfsfunktionen ----------
create or replace function public.plan_template_limit(p_plan text)
returns integer language sql immutable as $$
  select case p_plan when 'team' then 5 when 'starter' then 1 else 1 end  -- ohne Paket: 1 Entwurf
$$;

create or replace function public.company_is_active(c public.companies)
returns boolean language sql stable as $$
  select c.plan <> 'none' and (c.plan_expires_at is null or c.plan_expires_at > now())
$$;

-- Anzahl der Rahmen je Paket begrenzen
create or replace function public.enforce_template_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan text;
  v_count integer;
begin
  select plan into v_plan from companies where id = new.company_id for update;
  select count(*) into v_count from company_templates where company_id = new.company_id;
  if v_count >= plan_template_limit(v_plan) then
    raise exception 'template-limit-reached' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists company_templates_limit on public.company_templates;
create trigger company_templates_limit before insert on public.company_templates
  for each row execute function public.enforce_template_limit();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists company_templates_touch on public.company_templates;
create trigger company_templates_touch before update on public.company_templates
  for each row execute function public.touch_updated_at();

-- ---------- Zugriffsrechte (RLS) ----------
alter table public.companies enable row level security;
alter table public.company_templates enable row level security;
alter table public.contact_requests enable row level security;

revoke all on public.companies, public.company_templates, public.contact_requests from anon, authenticated;

-- Firmen: nur eigene Firma; Paket-Felder kann nur der Stripe-Webhook (Service-Role) ändern
grant select on public.companies to authenticated;
grant insert (owner_id, name) on public.companies to authenticated;
grant update (name) on public.companies to authenticated;

drop policy if exists companies_owner_select on public.companies;
create policy companies_owner_select on public.companies for select to authenticated using (owner_id = auth.uid());
drop policy if exists companies_owner_insert on public.companies;
create policy companies_owner_insert on public.companies for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists companies_owner_update on public.companies;
create policy companies_owner_update on public.companies for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Firmen-Rahmen: volle Verwaltung für den Firmen-Owner, der Zähler ist schreibgeschützt
grant select, delete on public.company_templates to authenticated;
grant insert (company_id, slug, title, settings, locked, logo_path) on public.company_templates to authenticated;
grant update (slug, title, settings, locked, logo_path) on public.company_templates to authenticated;

drop policy if exists templates_owner_all on public.company_templates;
create policy templates_owner_all on public.company_templates for all to authenticated
  using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid()));

-- ---------- Öffentliche Funktionen für den Team-Link ----------
-- Gibt nur die zum Anzeigen nötigen Felder eines Firmen-Rahmens zurück.
create or replace function public.get_team_template(p_slug text)
returns table (title text, settings jsonb, locked boolean, logo_path text, company_name text, active boolean)
language sql stable security definer set search_path = public as $$
  select t.title, t.settings, t.locked, t.logo_path, c.name, public.company_is_active(c)
  from company_templates t
  join companies c on c.id = t.company_id
  where t.slug = lower(p_slug)
$$;

-- Zählt einen Download (nur für aktive Firmen-Links).
create or replace function public.increment_template_download(p_slug text)
returns void language sql volatile security definer set search_path = public as $$
  update company_templates t
     set download_count = download_count + 1
    from companies c
   where t.slug = lower(p_slug) and c.id = t.company_id and public.company_is_active(c)
$$;

revoke all on function public.get_team_template(text), public.increment_template_download(text) from public;
grant execute on function public.get_team_template(text), public.increment_template_download(text) to anon, authenticated;

-- ---------- Logos (Supabase Storage) ----------
-- Öffentlich lesbar (für den Team-Link), schreiben nur in den Ordner der eigenen Firma: logos/<company_id>/…
-- SVG ist bewusst nicht erlaubt (kann Skripte enthalten).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 524288, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists logos_owner_insert on storage.objects;
create policy logos_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] in (select id::text from public.companies where owner_id = auth.uid()));
drop policy if exists logos_owner_update on storage.objects;
create policy logos_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] in (select id::text from public.companies where owner_id = auth.uid()));
drop policy if exists logos_owner_delete on storage.objects;
create policy logos_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] in (select id::text from public.companies where owner_id = auth.uid()));
