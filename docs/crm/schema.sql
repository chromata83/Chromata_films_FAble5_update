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
--  * The website quotation page calls two more narrow functions (submit_quote / accept_quote, bottom of this file):
--    they can only ADD a quote (never read anything) and every price is recomputed by the database.
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
  auto_emails   boolean not null default true,       -- automatic emails to the couple (follow-up, countdown)
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
  kind       text not null,      -- followup1, followup2, before90, before60, before30
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

-- =====================================================================================================
-- LINK WITH THE WEBSITE QUOTATION PAGE
--  submit_quote : a couple or a wedding planner sends a quote -> a contact card + a project "Quote sent" (the date
--                 shows on the calendar as an option) are created automatically.
--  accept_quote : ONLY after the studio has validated the quote in the back office (projects.quote_validated_at), the couple can accept
--                 the proposal -> the contract is created from your template and a private signing link is returned.
--                 When they sign, the project moves to "Awaiting payment" with its payment schedule.
--  quote_status : tells the proposal page whether the signing button may be shown, and the final total once the studio has
--                 filled in the travel / accommodation fees (projects.travel_fees, already included in projects.total).
-- =====================================================================================================
alter table public.contacts drop constraint if exists contacts_kind_check;
alter table public.contacts add constraint contacts_kind_check check (kind in ('planner', 'venue', 'supplier', 'client', 'other'));
alter table public.projects add column if not exists contact_id uuid references public.contacts (id) on delete set null;
alter table public.projects add column if not exists quote_ref text;                 -- private reference of a quote made on the website
alter table public.projects add column if not exists quote_synced_at timestamptz;    -- last time the website wrote to this project
alter table public.projects add column if not exists quote_verified boolean not null default false;   -- total recomputed by the database
alter table public.projects add column if not exists quote_validated_at timestamptz;  -- the studio validated the quote: only then can the couple sign online
alter table public.projects add column if not exists bank_account text not null default 'EUR';   -- which bank details go in the contract: EUR, CHF or USD
alter table public.projects add column if not exists travel_fees numeric;   -- travel / accommodation fees filled in by the studio; already included in `total`
-- quote editor (back office): the studio's own version of the quote, shown on the couple's link in place of the one they sent
alter table public.projects add column if not exists quote_sel jsonb;                -- the choices (collection, team, options...) currently in the quote
alter table public.projects add column if not exists quote_lines jsonb;              -- the lines the couple sees [{l,p,t}], planner commission already spread inside the prices
alter table public.projects add column if not exists quote_commission numeric;       -- PRIVATE: wedding planner commission, included in `total`, never sent to the couple
alter table public.projects add column if not exists quote_issued_at timestamptz;    -- issue date: a quote is valid 14 days from it
alter table public.projects drop constraint if exists projects_bank_account_check;
alter table public.projects add constraint projects_bank_account_check check (bank_account in ('EUR', 'CHF', 'USD'));
create unique index if not exists projects_quote_ref_idx on public.projects (quote_ref) where quote_ref is not null;

-- "14,500 EUR" (same look as the back office)
create or replace function public.fmt_money(n numeric) returns text language sql immutable as $$
  select regexp_replace(regexp_replace(to_char(round(n, 2), 'FM999,999,999,990.00'), '\.00$', ''), '(\.\d)0$', '\1') || ' EUR';
$$;

-- total of a quote, recomputed from the choices and the price list that the back office keeps in settings.quote_prices
-- wedding planner rates (quotation-WP page: the selection carries "m":"wp"): price + percent, to the whole euro, exactly like js/quote-core.js up()
create or replace function public.qt_up(base numeric, mk jsonb, k text) returns numeric
language sql immutable as $$
  select case when mk is null then base else round(base * (100 + coalesce((mk ->> k)::numeric, 0)) / 100) end;
$$;

create or replace function public.quote_total(sel jsonb, tbl jsonb) returns numeric
language plpgsql immutable as $$
declare t numeric := 0; k text; q int; o jsonb; mk jsonb := case when sel ->> 'm' = 'wp' then tbl -> 'mk' end;
begin
  -- +10% wedding day, welcome event, brunch; +5% options (not extra hours), content creator, privacy; extra team and extra hours: no change
  t := t + public.qt_up(coalesce((tbl -> 'c' ->> (sel ->> 'c'))::numeric, 0), mk, 'c');
  t := t + public.qt_up(coalesce((tbl -> 'w' ->> (sel ->> 'w'))::numeric, 0), mk, 'w');
  t := t + public.qt_up(coalesce((tbl -> 'b' ->> (sel ->> 'b'))::numeric, 0), mk, 'b');
  t := t + public.qt_up(coalesce((tbl -> 'k' ->> (sel ->> 'k'))::numeric, 0), mk, 'k');
  t := t + public.qt_up(coalesce((tbl -> 'p' ->> (sel ->> 'p'))::numeric, 0), mk, 'p');
  if jsonb_typeof(sel -> 'x') = 'array' then
    for k in select distinct jsonb_array_elements_text(sel -> 'x') loop
      t := t + coalesce((tbl -> 'x' ->> k)::numeric, 0);
    end loop;
  end if;
  if jsonb_typeof(sel -> 'o') = 'object' then
    for k in select jsonb_object_keys(sel -> 'o') loop
      o := tbl -> 'o' -> k;
      q := coalesce((sel -> 'o' ->> k)::int, 0);
      if o is not null and q > 0 then
        t := t + public.qt_up((o ->> 'p')::numeric, case when o ->> 'x' = '1' then null else mk end, 'o') * least(q, coalesce((o ->> 'm')::int, 1));
      end if;
    end loop;
  end if;
  return t;
end $$;

create or replace function public.submit_quote(
  p_ref text, p_names text, p_email text, p_date text, p_place text, p_venue text,
  p_role text, p_planner text, p_sel jsonb, p_total numeric, p_recap text, p_url text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  tbl jsonb; d date; tot numeric; coll text; sc text; cid uuid; pr public.projects;
  planner boolean; names text; v_email text; place text; v_venue text; cname text; url text; recap text; note text; verified boolean := false;
begin
  if coalesce(p_ref, '') !~ '^[a-z0-9]{10,16}$' then raise exception 'Invalid reference'; end if;
  names := left(trim(coalesce(p_names, '')), 160);
  v_email := left(trim(coalesce(p_email, '')), 160);
  place := left(trim(coalesce(p_place, '')), 160);
  v_venue := left(trim(coalesce(p_venue, '')), 160);
  if length(names) < 2 then raise exception 'Name required'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'A valid email is required'; end if;
  planner := (p_role = 'planner');
  cname := case when planner then left(trim(coalesce(p_planner, '')), 160) else names end;
  if length(cname) < 2 then raise exception 'Planner name required'; end if;
  if coalesce(p_date, '') ~ '^\d{4}-\d{2}-\d{2}$' then
    begin d := p_date::date; exception when others then d := null; end;
  end if;
  url := case when coalesce(p_url, '') ~ '^https?://' then left(p_url, 2000) else null end;
  recap := left(coalesce(p_recap, ''), 3000);
  if jsonb_typeof(p_sel) is distinct from 'object' then raise exception 'Invalid selection'; end if;

  select * into pr from public.projects where quote_ref = p_ref for update;
  if not found and (select count(*) from public.projects where quote_ref is not null and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Too many requests, please try again later';
  end if;

  -- the price: recomputed here from the choices (the browser's own total is only used until the price list is stored)
  select value::jsonb into tbl from public.settings where key = 'quote_prices' and value <> '';
  sc := p_sel ->> 'c';
  if tbl is not null then
    if coalesce(tbl -> 'c' ->> sc, '') = '' then raise exception 'Invalid selection'; end if;
    coll := tbl -> 'n' ->> sc;
    if p_sel ->> 'm' = 'wp' and tbl -> 'mk' is null then
      -- planner quote but the stored price list does not know the planner rates yet (open the back office once): keep the browser's total, unverified
      tot := least(greatest(coalesce(p_total, 0), 0), 500000);
    else
      tot := public.quote_total(p_sel, tbl); verified := true;
    end if;
  else
    tot := least(greatest(coalesce(p_total, 0), 0), 500000); coll := initcap(coalesce(sc, '')) || ' collection';
  end if;

  note := 'Website quotation ' || p_ref || ' · ' || to_char(now() at time zone 'UTC', 'DD Mon YYYY') || E'\n' ||
          case when planner then 'Sent by wedding planner: ' || cname || E'\n' else '' end ||
          'Couple: ' || names || E'\n' ||
          'Wedding date: ' || coalesce(to_char(d, 'DD Mon YYYY'), 'not given') || E'\n' ||
          'Venue: ' || v_venue || ', ' || place || E'\n' ||
          'Collection: ' || coll || E'\n' ||
          case when p_sel ->> 'm' = 'wp' then E'Wedding planner rates applied (+10% wedding day, welcome event, brunch; +5% options, content creator, privacy)\n' else '' end ||
          'Total: ' || public.fmt_money(tot) || E' (starting prices, travel and accommodation to be confirmed)\n\n' || recap ||
          case when url is not null then E'\n\nProposal: ' || url else '' end;

  -- contact card (a planner, or the couple); one per email address, each new quote is added to its notes
  select id into cid from public.contacts
    where kind = case when planner then 'planner' else 'client' end and lower(email) = lower(v_email) order by created_at limit 1;
  if cid is null then
    insert into public.contacts (kind, name, email, tag, follow_up, next_step_date, notes)
      values (case when planner then 'planner' else 'client' end, cname, v_email, 'interesting', true, current_date + 5, note)
      returning id into cid;
  else
    update public.contacts set follow_up = true, next_step_date = coalesce(next_step_date, current_date + 5),
      notes = case when position(p_ref in coalesce(notes, '')) > 0 then notes
                   else coalesce(notes || E'\n\n— — —\n', '') || note end
      where id = cid;
  end if;

  if pr.id is null then
    insert into public.projects (status, couple_names, couple_email, wedding_date, venue, location, collection, total,
        planner_id, planner_name, planner_email, contact_id, proposal_url, notes, quote_sent_at, quote_ref, quote_synced_at, quote_verified, auto_emails,
        quote_sel, quote_issued_at)
      values ('quote', names, v_email, d, nullif(v_venue, ''), nullif(place, ''), coll, tot,
        case when planner then cid end, case when planner then cname end, case when planner then v_email end, cid, url, note, now(), p_ref, now(), verified, true,
        p_sel, now());
  elsif pr.status in ('lead', 'quote') and abs(extract(epoch from (pr.updated_at - coalesce(pr.quote_synced_at, pr.created_at)))) < 2 then
    -- the studio has not touched this project yet: the couple's latest choices replace the previous ones (and the 14 days start again)
    update public.projects set couple_names = names, couple_email = v_email, wedding_date = d, venue = nullif(v_venue, ''), location = nullif(place, ''),
        quote_sel = p_sel, quote_issued_at = now(), quote_lines = null,
        collection = coll, total = tot, proposal_url = url, notes = note, quote_synced_at = now(), quote_verified = verified,
        planner_id = case when planner then cid end, planner_name = case when planner then cname end, planner_email = case when planner then v_email end, contact_id = cid
      where id = pr.id;
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.accept_quote(p_ref text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare pr public.projects; c public.contracts; s jsonb; tpl text; bank text; bank_key text; fee numeric; dep numeric; due text; v_body text; ctitle text;
begin
  if coalesce(p_ref, '') !~ '^[a-z0-9]{10,16}$' then raise exception 'Invalid reference'; end if;
  select * into pr from public.projects where quote_ref = p_ref for update;
  if not found then raise exception 'We could not find this proposal. Please reply to us by email.'; end if;

  select * into c from public.contracts where project_id = pr.id and status = 'signed' limit 1;
  if found then return jsonb_build_object('signed', true); end if;
  select * into c from public.contracts where project_id = pr.id and status = 'sent' order by created_at desc limit 1;
  if found then return jsonb_build_object('token', c.token); end if;

  -- nothing can be signed before the studio has reviewed and validated the quote in the back office
  if pr.quote_validated_at is null then
    raise exception 'Your proposal is being reviewed by our team. We will come back to you personally very soon, and you will then be able to sign online.';
  end if;
  if pr.status not in ('lead', 'quote', 'signature') then raise exception 'This proposal is not open for online signing. Please write to us.'; end if;
  -- a quote is valid 14 days from its issue date (the studio can issue it again from the back office)
  if current_date > (coalesce(pr.quote_issued_at, pr.quote_sent_at, pr.created_at) at time zone 'UTC')::date + 14 then
    raise exception 'This proposal is no longer valid (our quotations are valid for 14 days). Please write to us and we will refresh it right away.';
  end if;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into s from public.settings
    where key in ('online_signing', 'bank_details', 'bank_details_chf', 'bank_details_usd', 'contract_template', 'contract_template_default', 'studio_signature');
  if coalesce(s ->> 'online_signing', '1') = '0' then raise exception 'Online signing is not open for this proposal yet. Please reply to us by email and we will send you the agreement.'; end if;
  bank_key := case pr.bank_account when 'CHF' then 'bank_details_chf' when 'USD' then 'bank_details_usd' else 'bank_details' end;
  bank := trim(coalesce(s ->> bank_key, ''));
  tpl := case when trim(coalesce(s ->> 'contract_template', '')) <> '' then s ->> 'contract_template' else s ->> 'contract_template_default' end;
  if bank = '' or coalesce(tpl, '') = '' or not pr.quote_verified or coalesce(pr.total, 0) <= 0 then
    raise exception 'Online signing is not ready yet. Please reply to us by email and we will send you the agreement.';
  end if;
  if pr.wedding_date is null or pr.wedding_date < current_date then
    raise exception 'Please write to us so we can confirm the date of your wedding.';
  end if;

  -- same wording and tags as the contract builder of the back office (js/crm-contract.js)
  fee := pr.total; dep := round(fee / 2, 2);
  due := ' (due ' || to_char(pr.wedding_date - 42, 'FMDD FMMonth YYYY') || ')';
  v_body := tpl;
  v_body := replace(v_body, '{{couple}}', coalesce(pr.couple_names, '[couple names]'));
  v_body := replace(v_body, '{{collection}}', coalesce(pr.collection, '[collection]'));
  v_body := replace(v_body, '{{date}}', to_char(pr.wedding_date, 'FMDD FMMonth YYYY'));
  v_body := replace(v_body, '{{venue}}', coalesce(pr.venue, '[venue]'));
  v_body := replace(v_body, '{{location}}', coalesce(pr.location, ''));
  v_body := replace(v_body, '{{total}}', public.fmt_money(fee));
  v_body := replace(v_body, '{{deposit}}', public.fmt_money(dep));
  v_body := replace(v_body, '{{balance}}', public.fmt_money(fee - dep));
  v_body := replace(v_body, '{{balance_due}}', due);
  v_body := replace(v_body, '{{bank_details}}', bank);
  ctitle := 'Wedding film agreement · ' || coalesce(pr.couple_names, 'Clients');

  insert into public.contracts (project_id, title, body, amount, status, sent_at, studio_signature)
    values (pr.id, ctitle, v_body, fee, 'sent', now(), nullif(s ->> 'studio_signature', ''))
    returning * into c;
  update public.projects set status = 'signature' where id = pr.id and status in ('lead', 'quote');
  return jsonb_build_object('token', c.token);
end $$;

-- What the couple's proposal page asks for each time it opens: is signing open, the studio's current version of the
-- quote (lines + total, so every change made in the back office shows up on the same link by itself), and the validity.
-- The planner commission (quote_commission) is NEVER returned: it is already spread inside the prices of `lines`.
create or replace function public.quote_status(p_ref text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object('found', true,
      'signed', exists (select 1 from public.contracts c where c.project_id = p.id and c.status = 'signed'),
      'travel_fees', p.travel_fees, 'total', p.total, 'lines', p.quote_lines,
      'issued', to_char(d.issued, 'YYYY-MM-DD'), 'valid_until', to_char(d.issued + 14, 'YYYY-MM-DD'), 'expired', current_date > d.issued + 14,
      'validated', coalesce((select value from public.settings where key = 'online_signing'), '1') <> '0'
        and (p.quote_validated_at is not null or exists (select 1 from public.contracts c where c.project_id = p.id and c.status = 'sent')))
    from public.projects p
    cross join lateral (select (coalesce(p.quote_issued_at, p.quote_sent_at, p.created_at) at time zone 'UTC')::date as issued) d
    where p_ref ~ '^[a-z0-9]{10,16}$' and p.quote_ref = p_ref
  ), jsonb_build_object('found', false));
$$;

revoke all on function public.fmt_money(numeric), public.quote_total(jsonb, jsonb), public.qt_up(numeric, jsonb, text) from public, anon, authenticated;
revoke all on function public.submit_quote(text, text, text, text, text, text, text, text, jsonb, numeric, text, text), public.accept_quote(text), public.quote_status(text) from public;
grant execute on function public.submit_quote(text, text, text, text, text, text, text, text, jsonb, numeric, text, text), public.accept_quote(text), public.quote_status(text) to anon, authenticated;
