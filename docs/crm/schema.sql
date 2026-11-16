-- Chromata CRM · Supabase schema
-- (projects, contacts, calendar, contracts + e-signature, payments + reminders, tracker, expenses, automatic emails, 2FA)
-- Run once in Supabase > SQL Editor. Safe to re-run.
--
-- Security model
--  * Only the studio account below can read or write the tables (row level security).
--    When two-factor authentication (TOTP) is enabled on that account, the database ALSO requires the
--    second factor: a session that only typed the password cannot read anything.
--  * Clients are NOT logged in. They open a private signing link; the page calls two narrow functions
--    (get_contract / sign_contract) that can only see the single contract matching the secret token.
--  * Bank details, templates, the calendar secret and the studio signature live in `settings`,
--    readable only by the studio (they are NOT in the public website files).

-- ---------- who is the studio ----------
create table if not exists public.studio_admins (email text primary key);
insert into public.studio_admins (email) values ('contact@chromatafilms.com') on conflict do nothing;

-- true only for the studio account, and, once it has a verified 2FA factor, only for a session that passed 2FA
create or replace function public.is_studio() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from public.studio_admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
     and (
       (auth.jwt() ->> 'aal') = 'aal2'
       or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified')
     );
$$;

-- ---------- settings (templates, bank details, signature, calendar secret...) ----------
create table if not exists public.settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- contacts: planners, venues, suppliers ("little black book") ----------
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null default 'planner' check (kind in ('planner', 'venue', 'supplier', 'other')),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  website     text,
  tag         text not null default 'interesting' check (tag in ('key', 'interesting', 'polite', 'blacklist')),
  follow_up   boolean not null default false,
  next_step_date date,
  notes       text
);

-- ---------- projects ----------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  status        text not null default 'lead',
  couple_names  text not null,
  couple_email  text,
  couple_phone  text,
  wedding_date  date,
  venue         text,
  location      text,
  collection    text,
  total         numeric,
  planner_id    uuid references public.contacts (id) on delete set null,
  planner_name  text,
  planner_company text,
  planner_email text,
  planner_phone text,
  proposal_url  text,
  notes         text,
  quote_sent_at timestamptz,                         -- when the status became "quote" (drives follow-ups)
  auto_emails   boolean not null default true,       -- automatic emails to the couple (follow-up, thanks, countdown)
  tracker       jsonb not null default '{}'::jsonb,  -- checklist state: {"Music chosen": {"s": "done", "n": "note"}}
  films         jsonb not null default '[]'::jsonb   -- v2: delivery links (streaming / download)
);
create index if not exists projects_date_idx on public.projects (wedding_date);
-- in case an earlier version of this file was already run:
alter table public.projects add column if not exists planner_id uuid references public.contacts (id) on delete set null;
alter table public.projects add column if not exists quote_sent_at timestamptz;
alter table public.projects add column if not exists auto_emails boolean not null default true;
alter table public.projects add column if not exists tracker jsonb not null default '{}'::jsonb;
alter table public.projects drop constraint if exists projects_status_check;
update public.projects set status = 'quote' where status not in ('lead','quote','signature','payment','booked','delivered','declined') and status <> 'signed';
update public.projects set status = 'payment' where status = 'signed';
alter table public.projects alter column status set default 'lead';
alter table public.projects add constraint projects_status_check
  check (status in ('lead', 'quote', 'signature', 'payment', 'booked', 'delivered', 'declined'));

-- ---------- contracts ----------
create table if not exists public.contracts (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  created_at    timestamptz not null default now(),
  title         text not null,
  body          text not null,
  amount        numeric,
  status        text not null default 'draft' check (status in ('draft', 'sent', 'signed')),
  token         text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  sent_at       timestamptz,
  studio_signature text,
  signed_at     timestamptz,
  signed_name   text,
  client_names  text,
  client_email  text,
  client_address text,
  client_country text,
  signature     text,
  signed_body   text,
  body_sha256   text,
  signer_agent  text
);
create index if not exists contracts_project_idx on public.contracts (project_id);
alter table public.contracts add column if not exists studio_signature text;
alter table public.contracts add column if not exists client_names text;
alter table public.contracts add column if not exists client_email text;
alter table public.contracts add column if not exists client_address text;
alter table public.contracts add column if not exists client_country text;
alter table public.contracts add column if not exists signed_body text;

-- ---------- payments (created automatically when a contract is signed) ----------
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  contract_id      uuid not null references public.contracts (id) on delete cascade,
  project_id       uuid not null references public.projects (id) on delete cascade,
  label            text not null,
  amount           numeric not null,
  due_date         date not null,
  paid_at          timestamptz,
  remind           boolean not null default true,
  reminders_count  int not null default 0,
  last_reminder_at timestamptz
);
create index if not exists payments_due_idx on public.payments (due_date) where paid_at is null;

-- ---------- expenses (accounting) ----------
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  spent_on    date not null default current_date,
  label       text not null,
  category    text,
  amount      numeric not null,
  receipt_url text,
  project_id  uuid references public.projects (id) on delete set null
);
create index if not exists expenses_date_idx on public.expenses (spent_on);

-- ---------- automatic emails already sent (so each one goes out only once) ----------
create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind       text not null,      -- followup1, followup2, thanks, before90, before60, before30
  sent_at    timestamptz not null default now(),
  unique (project_id, kind)
);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

-- a signed contract can never be edited by mistake
create or replace function public.lock_signed() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and old.status = 'signed' then
    raise exception 'A signed contract cannot be modified';
  end if;
  return new;
end $$;
drop trigger if exists contracts_lock on public.contracts;
create trigger contracts_lock before update on public.contracts for each row execute function public.lock_signed();

-- ---------- row level security ----------
alter table public.studio_admins enable row level security;   -- no policy: nobody reads it through the API
do $$
declare t text;
begin
  foreach t in array array['projects', 'contracts', 'payments', 'settings', 'contacts', 'expenses', 'email_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists studio_all on public.%I', t);
    execute format('create policy studio_all on public.%I for all to authenticated using (public.is_studio()) with check (public.is_studio())', t);
  end loop;
end $$;

-- ---------- what the client's signing page may do ----------
create or replace function public.get_contract(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', c.title, 'body', c.body, 'amount', c.amount, 'status', c.status,
    'studio_signature', c.studio_signature,
    'signed_name', c.signed_name, 'signed_at', c.signed_at, 'signed_body', c.signed_body, 'signature', c.signature,
    'couple_names', p.couple_names, 'couple_email', p.couple_email, 'wedding_date', p.wedding_date, 'venue', p.venue, 'location', p.location)
  from public.contracts c join public.projects p on p.id = c.project_id
  where c.token = p_token and c.status in ('sent', 'signed');
$$;

drop function if exists public.sign_contract(text, text, text, text);
create or replace function public.sign_contract(p_token text, p_names text, p_email text, p_address text, p_country text, p_signature text, p_agent text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.contracts; p public.projects; full_text text; first_amt numeric; due2 date;
begin
  if length(trim(coalesce(p_names, ''))) < 2 then raise exception 'Name required'; end if;
  if coalesce(p_email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'A valid email is required'; end if;
  if length(trim(coalesce(p_address, ''))) < 5 then raise exception 'Address required'; end if;
  if length(trim(coalesce(p_country, ''))) < 2 then raise exception 'Country of residence required'; end if;
  if coalesce(p_signature, '') not like 'data:image/png;base64,%' or length(p_signature) > 400000 then raise exception 'Signature required'; end if;

  select * into c from public.contracts where token = p_token for update;
  if not found or c.status <> 'sent' then raise exception 'This contract is not open for signature'; end if;
  select * into p from public.projects where id = c.project_id;

  full_text := c.body || E'\n\n## The Client\n' ||
    'Name(s): ' || left(trim(p_names), 160) || E'\n' ||
    'Email: ' || left(trim(p_email), 160) || E'\n' ||
    'Address: ' || replace(left(trim(p_address), 300), E'\n', ', ') || E'\n' ||
    'Country of residence: ' || left(trim(p_country), 80) || E'\n' ||
    'Signed electronically on ' || to_char(now() at time zone 'UTC', 'DD Mon YYYY HH24:MI') || ' UTC';

  update public.contracts set
    status = 'signed', signed_at = now(), signed_name = left(trim(p_names), 160),
    client_names = left(trim(p_names), 160), client_email = left(trim(p_email), 160),
    client_address = left(trim(p_address), 300), client_country = left(trim(p_country), 80),
    signature = p_signature, signed_body = full_text,
    body_sha256 = encode(sha256(convert_to(full_text, 'UTF8')), 'hex'), signer_agent = left(coalesce(p_agent, ''), 300)
  where id = c.id;
  -- signed: now waiting for the first payment (the studio marks it paid, which turns the project "booked")
  update public.projects set status = 'payment' where id = c.project_id and status not in ('booked', 'delivered');

  -- payment schedule: 50% on signature, 50% six weeks before the wedding
  if coalesce(c.amount, 0) > 0 then
    first_amt := round(c.amount / 2, 2);
    insert into public.payments (contract_id, project_id, label, amount, due_date)
      values (c.id, c.project_id, 'Reservation payment (50%) · due on signature', first_amt, current_date);
    if p.wedding_date is not null then
      due2 := greatest(p.wedding_date - 42, current_date);
      insert into public.payments (contract_id, project_id, label, amount, due_date)
        values (c.id, c.project_id, 'Balance (50%) · due 6 weeks before the event', c.amount - first_amt, due2);
    end if;
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.get_contract(text), public.sign_contract(text, text, text, text, text, text, text) from public;
grant execute on function public.get_contract(text), public.sign_contract(text, text, text, text, text, text, text) to anon, authenticated;
