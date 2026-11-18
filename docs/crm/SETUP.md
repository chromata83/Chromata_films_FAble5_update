# Chromata CRM — setup (about 30 minutes, once)

The back office is the page `crm.html` on the site (unlisted, not indexed). It needs a small online
database to remember projects, contracts and payments. We use **Supabase** (free plan is enough).

Until you do this, `crm.html` runs in **demo mode**: everything stays in your own browser only,
which is good for trying it out but is *not* saved anywhere else.

## 1. Create the database
1. Go to https://supabase.com, create an account and a **New project** (name: `chromata-crm`,
   pick a region in Europe, set and save a strong database password).
2. Open **SQL Editor > New query**, paste the whole content of `docs/crm/schema.sql`, click **Run**.
   (Safe to run again after an update of this file.)

## 2. Create your login
1. **Authentication > Users > Add user > Create new user**.
2. Email: `contact@chromatafilms.com` + a **new** strong password. Tick *Auto Confirm User*.
3. **Authentication > Sign In / Providers**: turn **off** "Allow new users to sign up".
   (Even if someone signed up, the database rules only let `contact@chromatafilms.com` in.)

## 3. Connect the site
1. **Project Settings > API**: copy the **Project URL** and the **anon public** key.
2. Paste them in `js/crm-config.js` (`url` and `anonKey`). The anon key is meant to be public.
   **Never** paste the `service_role` key anywhere in the site.
3. Commit, push, deploy as usual.

## 4. First settings (in the back office, "Settings")
1. **Turn on 2FA** (see below). Do it right away.
2. Paste your **bank details** (they stay in the private database, not in the public site files).
3. Draw the **studio signature** once. It is added to every contract you send.
4. Check the **contract template**, the **checklist** and the **automatic emails**. Edit them freely.

### Two-factor authentication (2FA)
* Settings > Two-factor authentication > **Turn on 2FA**: scan the QR code with an authenticator app
  (Google Authenticator, Authy, 1Password…), type the 6-digit code. From then on the sign-in asks for a code after the password,
  **and the database itself refuses any session that did not pass the code** (even if the password leaks).
* **Backup (important):** use "Add a backup authenticator" to scan the same kind of code on a second device, and keep the secret key
  text somewhere safe (password manager).
* **If you lose access to your authenticator:** tell Claude in this project ("remove my 2FA"). Claude cannot reach your Supabase
  account, so it will give you the ready-made reset: run `docs/crm/disable-2fa.sql` in Supabase > SQL Editor (or
  Authentication > Users > your user > **Remove MFA factors**). Then sign in with the password only and turn 2FA back on.

## 5. Automatic emails and payment reminders (optional, about 15 minutes)
One daily job does three things: it emails the client when a **payment is late** (2 days after the due date, then weekly,
4 reminders at most), **follows up a quote** that was not answered (after 5 and 12 days), sends a **countdown** email
(90 / 60 / 30 days before the wedding). Each email goes out once, only to projects with
"automatic emails" ticked, and `contact@chromatafilms.com` is in copy. Rules are at the top of `daily-jobs/index.ts`;
the wording is in Settings > Automatic emails.

1. Create a free account at https://resend.com, **Domains > Add domain** `chromatafilms.com`, add the DNS records
   it shows at your domain provider, wait for "Verified". Create an **API key**.
2. Supabase > **Edge Functions > Deploy a new function** named `daily-jobs`; paste the content of
   `docs/crm/daily-jobs/index.ts`. Turn **off** "Verify JWT" (the function protects itself with a secret).
3. Edge Functions > **Secrets**: add `RESEND_API_KEY` (from step 1) and `CRON_SECRET` (any long random text).
4. SQL Editor, run this once (replace the two values; `<PROJECT_REF>` is the first part of your Supabase URL):
   ```sql
   create extension if not exists pg_cron;
   create extension if not exists pg_net;
   select cron.schedule('daily-jobs', '0 7 * * *', $$
     select net.http_post(
       url := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-jobs',
       headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'));
   $$);
   ```
5. Test it: Edge Functions > daily-jobs > Test, with header `Authorization: Bearer <CRON_SECRET>`.
   The answer shows how many emails were sent. Until this is done, use the "Remind by email" button in a project.

## 6. Your calendar in Google / Apple Calendar (optional, 5 minutes)
Your options, signed dates, declined dates, payments due and quote follow-ups appear in your own calendar.
1. Supabase > Edge Functions > deploy a function named `calendar-feed` with the content of
   `docs/crm/calendar-feed/index.ts`. Turn **off** "Verify JWT".
2. Back office > **Calendar** > **Create my private link**, then **Copy link**.
3. Google Calendar > Other calendars > **From URL** > paste. (Apple: File > New Calendar Subscription.)
   Google refreshes subscribed calendars every few hours. Keep the link private; "Make a new link" cancels the old one.
   (Without this step you can still use **Download .ics** in the Calendar page.)

## 7. Quotation page linked to the back office (already built in)
Re-run the whole `docs/crm/schema.sql` in the SQL Editor once (it is safe to re-run; the last block adds this feature), then open the back office once
(it stores the price list and the default contract text in the database; it does this by itself at each sign-in).
* A couple **or a wedding planner** who presses *Send to Chromata's team* on the quotation page creates, by itself:
  a **project** "Quote sent" (its date shows on the calendar as an option), and a **contact card** with every detail of the quote.
  The dashboard lists them under "New quotes from the website". The team still gets its usual email.
* **A couple can never sign on their own.** You get the usual email, open the project (Projects, or the dashboard block "New quotes from the website"),
  check the details, fill in **Travel / accommodation fees** (the total updates by itself and the couple's proposal then reads "all travel and accommodation fees included", no extra line), pick the **bank account** to give them (EUR, CHF or USD, filled in Settings), then press **Validate the quote**.
  Only then does **Accept and sign online** appear on their proposal page; use "Email the proposal to the couple" to answer them. When they sign,
  the project becomes "Awaiting payment", the 50% / 50% payments are created, and you get an email. You can also withdraw the validation.
* **Quote editor** (top of each project): change the collection, team, options, **travel / accommodation**, the **planner commission** and the issue date,
  with a live preview of "what the couple sees". Press **Save the quote and update the link**: the couple's link shows the new version by itself, nothing to resend.
  The commission is private: it is spread inside the prices the couple sees (no commission line, never returned by the public database functions); the box on the right
  shows you the commission and what is left for the studio. Enter it in € or in % of the quote.
  A project made by hand gets its couple's link the first time you save it there (wedding date and couple's email must be filled in).
* **Who opened the link (email gate):** when someone opens a proposal link, nothing is shown until they type their email. The opening is logged
  (project page > "Opened N times · last by …", with the full list) and **an alert email is sent to the studio** (who, which proposal, when, how many times,
  a link to the project), through the same free form service that already delivers the quotation emails, so there is nothing more to deploy. Reply to that email
  to write straight to the visitor. It is on by default; **Settings > Quotation page** has a box to switch it off. Re-run `schema.sql` once for the log table.
  It is a way to know who looks at a link, not a lock: your own browser (signed in to the back office) is never asked and never alerts you,
  a tab that already passed the gate is not asked again, and if the database is slow (more than 5 seconds) the proposal opens anyway so a couple is never locked out.
* **Validity:** every quote is valid **14 days from its issue date** (shown on the couple's page, in the quotation recap and in the editor). After that the couple can no longer sign
  online; **Issue again today** in the editor reopens it. (Re-run `schema.sql` once to get the editor's database columns and the validity check.)
* **Wedding planners have their own page: `quotation-WP.html`** (hidden like the others; the capitals matter in the address). It is a copy of the quotation page where the
  role is always "planner" and the prices carry the planner rates: **+10%** on the wedding day collection, the welcome event and the brunch / farewell party,
  **+5%** on the options (except extra hours), the content creator and the privacy level, **no change** on extra shooter, extra drone operator and extra hours.
  Everything else is the same chain as the couple's page: project "Quote sent", contact card (planner), proposal link (it shows the planner prices), validation, editor, PDF, contract.
  **Exception:** with the Premium or Ultimate collection, if the couple takes BOTH the welcome event and the brunch, the +10% is waived on those two lines
  (they go back to the standard price and the quote says "(−10% · Premium collection)" next to each).
  The project note says "Wedding planner rates applied". The percentages are in `js/quote-core.js` (`MARKUP`, `nomk`); the database gets them through the price list
  the back office stores each time you sign in. **After updating: re-run `schema.sql`, then open the back office once** (until then a planner quote is kept but not marked as verified).
* **Tools > Custom quote** (for events that are not weddings: Christmas party, Bar Mitzvah, a brand film…): you compose a quote of your own in the same look as the website quotation.
  You choose the kind of event, up to 4 **packages** (name, price, description; the one marked “For this client” is charged and shown in yellow), the **comparison rows**
  (tick where each package has it, plus a small detail text: the cards are built from them), **video upgrades** (price × quantity, long descriptions, negative price = discount; a new upgrade is only **listed** (“Video upgrade · €X”) until you tick “Validated by the client”, and only then does it count in the total),
  an **extra under the comparison** (“Extra as per Christmas day coverage”: one price per package, the one of the chosen package is added to the quote by itself, shown in a clear line under the cards), **video upgrades** (every line you have not ticked “Validated by the client”, and every line with “Show as a clickable card”, becomes an upgrade the client can select; the **Add the Film director upgrade** button pre-fills one at €14,000 with its description and inclusions), a travel / accommodation line that simply reads “Included” (no amount), the **pictures** (the cover photo + a mosaic; “Cover” on a mosaic picture makes it the cover: upload from your computer, pick from the site's own photographs, or paste an https link) and whether to show
  About / the wedding films. Saving creates a project with its private link (`proposal.html#<name>-<ref>`) that works like a website quote: email gate, validity of 14 days,
  validation, online signing, PDF, project in the calendar. The page reads everything from the database, so **a change saved in the builder shows on the same link**.
  **The client chooses:** on the page, the packages are clickable and the video upgrades are in a red section under the summary (not listed in the quote until selected, the total follows). **Save and send for review to Chromata Films** (right under the total) sends the choice to you: you get an alert email, a block on the Dashboard (“Client selections to review”) and a box at the top of the project, which shows what they chose against the current quote; **Apply to the quote** updates the package, the validated upgrades, the total and the link, and the client can then accept and sign (signing is hidden while a selection is waiting or differs from your version). **Re-run `schema.sql` once** (new column and the `submit_selection` function).
  Not in custom quotes: planner rates and the planner commission. The contract template (Settings) is worded for weddings: edit it before using online signing for another kind of event
  (the contract title already takes the kind of event, e.g. “Bar Mitzvah film agreement”).
  **Re-run `schema.sql` once**: it adds the column for custom quotes and creates a public Storage bucket `quote-photos` (only you can write to it) for the pictures you upload.
  If your SQL Editor refuses the Storage part, create a public bucket named `quote-photos` in Supabase > Storage, and add a policy letting the studio account insert/delete objects in it.
* A quote you create yourself in the CRM has a button **Email me this quote** (an email to the studio address with all the details).
* Prices are never trusted from the browser: the database recomputes every total from the choices. Online signing stays closed until
  the bank details of the chosen account are saved, and can be switched off in Settings > Quotation page and online signing.

## 8. Use it
* `https://www.chromatafilms.com/crm.html` → sign in (password, then your 2FA code).
* **New project** (paste a couple's "See my proposal" link to pre-fill it) → **Create contract** → review →
  **Send for signature** → **Copy link** or **Email it**. The couple fills in their details, draws their signature and signs.
* The project moves through the pipeline: Lead > Quote sent > Awaiting signature (when you send the contract) >
  Awaiting payment (when it is signed) > Booked (when you mark the first payment received) > Delivered.
* **Contacts** = your wedding planners, venues and suppliers (tags, follow-up, CSV import/export); pick a planner in a project.
* **Tracker** = your checklist for every project at a glance. **Accounting** = revenue, expenses, export for your accountant.

## Good to know
* The contract is the studio's own selling conditions, adapted to Swiss law (clauses 19-20 added: governing law,
  courts of Geneva, electronic signature). Have your lawyer check it, then adjust it in Settings.
* Every signature stores the name, drawn signature, date/time, device information and a SHA-256 fingerprint of
  the exact text that was signed. A signed contract cannot be edited afterwards.
* Version 2 (planned): film delivery per project (streaming + download links), PDF export.
