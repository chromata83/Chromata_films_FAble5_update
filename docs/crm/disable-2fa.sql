-- EMERGENCY: turn two-factor authentication OFF for the studio account.
-- Use only if you lost access to your authenticator app(s).
--
-- 1. Open Supabase > SQL Editor > New query.
-- 2. Paste this, click Run.
-- 3. Sign in to the back office with your password only, then turn 2FA back on in Settings.
--
-- (Nothing else is touched: projects, contracts and payments stay as they are.)
delete from auth.mfa_factors
where user_id = (select id from auth.users where lower(email) = 'contact@chromatafilms.com');

-- Alternative without SQL: Supabase > Authentication > Users > contact@chromatafilms.com > "..." menu > Remove MFA factors.
