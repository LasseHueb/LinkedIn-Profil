-- Premium-Lizenzen (Einmalkauf über Stripe).
-- Zugriff ausschließlich über Edge Functions mit Service-Role-Key – keine öffentlichen Rechte.
-- Fotos werden NIE gespeichert; diese Tabelle enthält nur Lizenzdaten.

create table if not exists public.licenses (
  id                 uuid primary key default gen_random_uuid(),
  key                text not null unique check (key ~ '^PR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  email              text not null,
  stripe_session_id  text unique,
  stripe_payment_intent text,
  amount_total       integer,
  currency           text,
  consent_at         timestamptz,          -- Zustimmung zum vorzeitigen Erlöschen des Widerrufsrechts
  revoked            boolean not null default false,
  revoked_reason     text,
  last_email_at      timestamptz,          -- Drosselung von Wiederherstellungs-Mails
  created_at         timestamptz not null default now()
);

create index if not exists licenses_email_idx on public.licenses (email);  -- E-Mails werden kleingeschrieben gespeichert
create index if not exists licenses_payment_intent_idx on public.licenses (stripe_payment_intent);

alter table public.licenses enable row level security;
-- Absichtlich keine Policies: anon/authenticated haben keinen Zugriff.
revoke all on public.licenses from anon, authenticated;
