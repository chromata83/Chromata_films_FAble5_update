/* Chromata CRM — connection settings.
   Fill these two values after creating the Supabase project (see docs/crm/SETUP.md).
   The "anon" key is public by design: access is protected by the row level security
   rules in docs/crm/schema.sql, not by hiding this key. NEVER put the service_role key here. */
window.CRM_CONFIG = {
  url: "",      // e.g. "https://abcdxyz.supabase.co"
  anonKey: ""   // the project's anon / public key
};
