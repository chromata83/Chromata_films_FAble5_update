// Chromata CRM · daily jobs (Supabase Edge Function, Deno). Runs once a day (see docs/crm/SETUP.md, step 5).
//
//  1. PAYMENT REMINDERS  an overdue, unpaid payment of a signed contract -> email to the client (studio in copy)
//  2. QUOTE FOLLOW-UP    quote sent and still unanswered after 5 days (then 12 days) -> polite follow-up
//  3. COUNTDOWN          90 / 60 / 30 days before a signed wedding -> "send us your timeline" email
//
// Every email goes out once only (table email_log), only to projects with "automatic emails" ticked.
// The wording comes from the back office, Settings > Automatic emails (the defaults below are used otherwise).
//
// Secrets to set (Supabase > Edge Functions > Secrets):  RESEND_API_KEY, CRON_SECRET
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ---- rules: edit here ----
const PAY_GRACE_DAYS = 2;          // first payment reminder 2 days after the due date
const PAY_REPEAT_DAYS = 7;         // then once a week
const PAY_MAX_REMINDERS = 4;
const FOLLOWUP_AFTER = [5, 12];    // days after the quote was sent
const COUNTDOWN = [90, 60, 30];    // days before the wedding (an email is only sent within 7 days of each mark)
const FROM = "Chromata Films <contact@chromatafilms.com>";
const STUDIO = "contact@chromatafilms.com";

const DEFAULTS: Record<string, string> = {
  email_tpl_followup: "Subject: Your wedding film with Chromata Films\n\nHello {{name}},\n\nI wanted to follow up on the proposal we sent for your wedding on {{date}} at {{venue}}. Do you have any questions, or would you like us to adjust anything? We would love to reserve your date for you.\n\nWarmly,\nChromata Films",
  email_tpl_before: "Subject: {{days}} days until your wedding\n\nHello {{name}},\n\nYour wedding at {{venue}} is only {{days}} days away. To prepare the filming perfectly, could you send us your final timeline, the list of key moments you do not want us to miss, and the contacts of your planner and venue?\n\nWarmly,\nChromata Films",
};

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 })} EUR`;
const dateLong = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const dayNum = (iso: string) => Math.floor(new Date(iso.slice(0, 10) + "T12:00:00Z").getTime() / 864e5);

async function sendMail(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], bcc: [STUDIO], reply_to: STUDIO, subject, html }),
  });
  return r.ok;
}
const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#252321;max-width:560px">${inner}</div>`;

Deno.serve(async (req) => {
  if (req.headers.get("authorization") !== `Bearer ${Deno.env.get("CRON_SECRET")}`) return new Response("Forbidden", { status: 403 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date(), today = now.toISOString().slice(0, 10), todayN = dayNum(today);
  const report = { paymentReminders: 0, followups: 0, countdown: 0, errors: [] as string[] };

  const { data: st } = await db.from("settings").select("key,value");
  const S: Record<string, string> = {};
  (st ?? []).forEach((r) => (S[r.key] = r.value));
  const tpl = (key: string, vars: Record<string, string>) => {
    let t = (S[key] || "").trim() || DEFAULTS[key];
    for (const [k, v] of Object.entries(vars)) t = t.replaceAll(`{{${k}}}`, v);
    let subject = "Chromata Films";
    const m = t.match(/^Subject:\s*(.+)\n+/i);
    if (m) { subject = m[1].trim(); t = t.slice(m[0].length); }
    return { subject, html: wrap(esc(t).replace(/\n/g, "<br>")) };
  };

  // ---------- 1. payment reminders ----------
  {
    const dueBefore = new Date(Date.now() - PAY_GRACE_DAYS * 864e5).toISOString().slice(0, 10);
    const repeatBefore = new Date(Date.now() - PAY_REPEAT_DAYS * 864e5).toISOString();
    const { data: pays, error } = await db.from("payments")
      .select("id,label,amount,due_date,reminders_count,last_reminder_at,contract:contracts(status,client_names,client_email),project:projects(couple_names,couple_email,bank_account)")
      .is("paid_at", null).eq("remind", true).lt("due_date", dueBefore).lt("reminders_count", PAY_MAX_REMINDERS);
    if (error) report.errors.push("payments: " + error.message);
    for (const p of pays ?? []) {
      // deno-lint-ignore no-explicit-any
      const c: any = Array.isArray(p.contract) ? p.contract[0] : p.contract, pr: any = Array.isArray(p.project) ? p.project[0] : p.project;
      const to = c?.client_email || pr?.couple_email;
      if (c?.status !== "signed" || !to) continue;
      if (p.last_reminder_at && p.last_reminder_at > repeatBefore) continue;
      const name = esc(c.client_names || pr?.couple_names || "");
      const bankKey = pr?.bank_account === "CHF" ? "bank_details_chf" : pr?.bank_account === "USD" ? "bank_details_usd" : "bank_details";   // the account chosen in the project
      const bank = esc(S[bankKey] || "See clause 13 of your agreement.").replace(/\n/g, "<br>");
      const html = wrap(`<p>Hello ${name},</p><p>A friendly reminder: the following payment for your wedding film is now overdue.</p>
        <p><strong>${esc(p.label)}</strong><br>Amount: <strong>${money(p.amount)}</strong><br>Due date: ${dateLong(p.due_date)}</p>
        <p><strong>Bank details</strong><br>${bank}</p>
        <p>As set out in clause 11 of your agreement, interest of 5% per annum applies to late payments. If you have already paid, thank you, and please ignore this message.</p><p>Warmly,<br>Chromata Films</p>`);
      if (await sendMail(to, `Payment reminder · ${c.client_names || pr?.couple_names || ""}`, html)) {
        report.paymentReminders++;
        await db.from("payments").update({ reminders_count: p.reminders_count + 1, last_reminder_at: now.toISOString() }).eq("id", p.id);
      } else report.errors.push("payment mail " + p.id);
    }
  }

  // ---------- 2-3. emails to couples ----------
  const { data: projects } = await db.from("projects")
    .select("id,couple_names,couple_email,wedding_date,venue,status,quote_sent_at,auto_emails").eq("auto_emails", true).not("couple_email", "is", null);
  const { data: logs } = await db.from("email_log").select("project_id,kind");
  const sent = new Set((logs ?? []).map((l) => `${l.project_id}:${l.kind}`));
  const once = async (p: { id: string; couple_email: string }, kind: string, key: string, vars: Record<string, string>) => {
    if (sent.has(`${p.id}:${kind}`)) return false;
    const { subject, html } = tpl(key, vars);
    if (!(await sendMail(p.couple_email, subject, html))) { report.errors.push(`mail ${kind} ${p.id}`); return false; }
    await db.from("email_log").insert({ project_id: p.id, kind });
    sent.add(`${p.id}:${kind}`);
    return true;
  };
  for (const p of projects ?? []) {
    const vars = { name: p.couple_names, date: p.wedding_date ? dateLong(p.wedding_date) : "your wedding day", venue: p.venue || "your venue", days: "" };
    // quote follow-up (most recent mark reached; older ones are skipped)
    if (p.status === "quote" && p.quote_sent_at) {
      const age = todayN - dayNum(p.quote_sent_at);
      const marks = FOLLOWUP_AFTER.map((d, i) => ({ d, kind: `followup${i + 1}` })).filter((m) => age >= m.d);
      const last = marks[marks.length - 1];
      if (last && (await once(p, last.kind, "email_tpl_followup", vars))) report.followups++;
    }
    const signed = ["payment", "booked"].includes(p.status);
    if (signed && p.wedding_date) {
      const left = dayNum(p.wedding_date) - todayN;
      for (const mark of COUNTDOWN) {
        if (left <= mark && left > mark - 7 && (await once(p, `before${mark}`, "email_tpl_before", { ...vars, days: String(left) }))) report.countdown++;
      }
    }
  }
  return new Response(JSON.stringify({ today, ...report }), { headers: { "Content-Type": "application/json" } });
});
