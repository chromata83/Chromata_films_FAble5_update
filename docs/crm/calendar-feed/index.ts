// Chromata CRM · private calendar feed (Supabase Edge Function, Deno)
//
// Serves an .ics calendar that Google Calendar / Apple Calendar can subscribe to
// (Google: Other calendars > From URL).  URL:  https://<PROJECT_REF>.supabase.co/functions/v1/calendar-feed?token=<secret>
// The secret is created in the back office (Calendar > "Create my private link") and stored in settings.calendar_token.
// Deploy with "Verify JWT" turned OFF (calendar apps cannot send a login; the secret token protects the feed).
//
// Contents: every wedding date (OPTION = lead / quote / awaiting signature, SIGNED, DECLINED),
// unpaid payments (PAYMENT / OVERDUE) and quote follow-ups.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const FOLLOWUP_DAYS = 5;
const esc = (s: unknown) => String(s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const fold = (line: string) => { const out: string[] = []; let b = line; while (b.length > 74) { out.push(b.slice(0, 74)); b = " " + b.slice(74); } out.push(b); return out.join("\r\n"); };
const ymd = (iso: string) => iso.slice(0, 10).replace(/-/g, "");
const nextDay = (iso: string) => { const d = new Date(iso.slice(0, 10) + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ""); };
const OPEN = ["lead", "quote", "signature"], SIGNED = ["payment", "booked", "delivered"];

type Ev = { uid: string; date: string; title: string; location?: string; description?: string; tentative?: boolean; free?: boolean };

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token") || "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: s } = await db.from("settings").select("value").eq("key", "calendar_token").maybeSingle();
  if (!token || !s?.value || token !== s.value) return new Response("Not found", { status: 404 });

  const { data: projects } = await db.from("projects").select("id,couple_names,wedding_date,venue,location,status,collection,total,planner_name,quote_sent_at");
  const { data: pays } = await db.from("payments").select("id,project_id,label,amount,due_date").is("paid_at", null);
  const today = new Date().toISOString().slice(0, 10);
  const ev: Ev[] = [];
  for (const p of projects ?? []) {
    if (p.wedding_date) {
      const tag = SIGNED.includes(p.status) ? "SIGNED" : p.status === "declined" ? "DECLINED" : "OPTION";
      ev.push({
        uid: `p-${p.id}`, date: p.wedding_date, title: `${tag} · ${p.couple_names}${p.venue ? " · " + p.venue : ""}`,
        location: [p.venue, p.location].filter(Boolean).join(", "),
        description: [p.collection, p.total ? `Total ${p.total} EUR` : "", p.planner_name ? `Planner: ${p.planner_name}` : ""].filter(Boolean).join("\n"),
        tentative: OPEN.includes(p.status), free: p.status === "declined",
      });
    }
    if (p.status === "quote" && p.quote_sent_at) {
      const d = new Date(p.quote_sent_at); d.setUTCDate(d.getUTCDate() + FOLLOWUP_DAYS);
      ev.push({ uid: `f-${p.id}`, date: d.toISOString().slice(0, 10), title: `FOLLOW-UP · ${p.couple_names}`, description: "Quote sent, no answer yet.", free: true });
    }
  }
  for (const x of pays ?? []) {
    const p = (projects ?? []).find((q) => q.id === x.project_id);
    ev.push({ uid: `pay-${x.id}`, date: x.due_date, title: `${x.due_date < today ? "OVERDUE" : "PAYMENT"} · ${p?.couple_names ?? ""} · ${Math.round(x.amount)} EUR`, description: x.label, free: true });
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chromata Films//CRM//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Chromata CRM", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
  for (const e of ev) {
    L.push("BEGIN:VEVENT", `UID:${e.uid}@chromatafilms.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(e.date)}`, `DTEND;VALUE=DATE:${nextDay(e.date)}`, `SUMMARY:${esc(e.title)}`);
    if (e.location) L.push(`LOCATION:${esc(e.location)}`);
    if (e.description) L.push(`DESCRIPTION:${esc(e.description)}`);
    L.push(`STATUS:${e.tentative ? "TENTATIVE" : "CONFIRMED"}`, `TRANSP:${e.free ? "TRANSPARENT" : "OPAQUE"}`, "END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return new Response(L.map(fold).join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" } });
});
