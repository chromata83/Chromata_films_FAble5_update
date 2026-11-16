/* Chromata CRM — contract template + rendering (shared by the back office and the client signing page).
   The default template below is the studio's own selling conditions (Swiss law). It can be edited in the
   back office under Settings; bank details are kept in the database, never in this public file. */
(function (w) {
  "use strict";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var eur = function (n) { return "€" + Math.round(+n || 0).toLocaleString("en-GB"); };
  var money = function (n) { return (Math.round((+n || 0) * 100) / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 }) + " EUR"; };
  function fmtDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(s || "")) return s || "[date to be confirmed]";
    var d = new Date(s.slice(0, 10) + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  /* Tokens: {{couple}} {{collection}} {{date}} {{venue}} {{location}} {{total}} {{deposit}} {{balance}} {{balance_due}} {{bank_details}} */
  var DEFAULT_TEMPLATE = [
    "## Parties",
    "This contract is made between Chromata Films SARL (“Chromata Films”) and {{couple}} (“THE CLIENT”).",
    "Collection: {{collection}}",
    "Wedding date: {{date}}",
    "Venue: {{venue}}, {{location}}",
    "",
    "## 1. ENTIRE AGREEMENT",
    "This contract contains the entire understanding between Chromata Films and THE CLIENT. It supersedes all prior contracts, representations and arrangements, whether oral or written, made by either party in relation to the engagement herein. Where there are any inconsistent terms in any prior agreement, the terms in this contract shall supersede those inconsistent terms. This contract shall not be altered, modified, supplemented or amended except in writing.",
    "",
    "## 2. RESERVATION",
    "Upon your signature and once the first payment has been received, Chromata Films will reserve the time and date agreed upon, and will ensure a full crew is available for that time and date as per the chosen collection(s). For this reason, unless due to Chromata Films’ fraud, negligence or willful default, the Reservation payment of 50% is non-refundable and non-transferable, even if the date is changed or the wedding cancelled for any reason, including acts of God, fire, strike and/or extreme weather or pandemic (see 14bis). The Reservation payment is to be paid at the time of signing the contract and is applied towards the contracted videography collection(s). THE CLIENT understands and agrees that the entire amount owed for the videography collection(s) described in this contract is due six weeks ahead of the scheduled videoshoot.",
    "",
    "## 3. CANCELLATION",
    "In the event that THE CLIENT elects to terminate any portion of the wedding cinematography services as delineated in this contract, the full payment shall be forfeited in its entirety to the videographer and shall be deemed non-refundable.",
    "",
    "## 4. CHARGEABLE HOURS",
    "Hours are chargeable provided that the videographer is present during the event. Any break equivalent to 1 hour or more during the event will be chargeable at 1,200 EUR per hour.",
    "",
    "## 5. ARTISTIC DIRECTION",
    "Chromata Films reserves all rights in relation to art direction of videography, video post-processing and editing, including music choices. If THE CLIENT decides to request changes (change of a speech, changing some shots, changing a ceremony portion, etc., no more than three small changes at maximum), a price for the requested modifications needs to be fixed, approved and paid in advance. If no changes are requested within two weeks after delivery, the video delivered is considered final.",
    "",
    "## 6. VIDEOS, PRINTS, IMAGES AND COPYRIGHTS",
    "The videos or prints produced belong to Chromata Films and are protected by the Swiss Federal Act on Copyright and Related Rights (CopA) and shall not be reproduced in any manner without Chromata Films’ prior written permission. Upon final payment by THE CLIENT, limited copyright ownership, which is unfettered, perpetual and royalty-free, of the resulting images will be transferred to THE CLIENT under the following conditions:",
    "∙ All videos of any kind, prints and/or images are the property of THE CLIENT for personal use only. THE CLIENT shall not reproduce, publish, distribute and/or sell any videos, prints and/or images for profit.",
    "∙ THE CLIENT shall obtain prior written permission from, and compensate, Chromata Films should THE CLIENT desire to reproduce, publish, distribute and/or sell any videos, prints and/or images for profit. THE CLIENT shall notify Chromata Films forthwith upon knowledge of any third party reproducing, publishing and/or selling any videos, prints and/or images for profit.",
    "∙ THE CLIENT shall obtain written permission from Chromata Films before digitally altering, processing or making any other type of amendment to any videos, prints and/or images produced by Chromata Films.",
    "",
    "## 7. MODEL RELEASE",
    "THE CLIENT hereby irrevocably assigns, transfers, and grants to Chromata Films and its duly authorized legal representatives a perpetual, unrestricted, and exclusive right to claim, assert, and enforce copyright ownership in and to all videos, images, and other audiovisual materials comprising the entire coverage of the Event.",
    "",
    "## 8. EXCLUSIVITY / GUEST VIDEOGRAPHY",
    "It is understood that Chromata Films will act as the sole and exclusive wedding videographer on the day of the videoshoot. We decline any responsibility regarding the quality of footage if any other team is brought to the event.",
    "",
    "## 9. GUEST COOPERATION",
    "THE CLIENT is responsible for the proper conduct of their guests. Chromata Films will not tolerate any improper, abusive, unruly and/or discourteous behaviour. Chromata Films will not be obliged to share its time or compete with any other videographers for the attention of the subjects. Improper, abusive, unruly and/or discourteous guest conduct that interferes with videography may seriously affect the quality of the videos taken and increase the number of times videos must be retaken. Should THE CLIENT be unable to control the conduct of their guests, and/or any of THE CLIENT’s guests damage the videographer’s equipment and/or tools, the videographer shall be entitled to leave the event premises and/or terminate the engagement immediately without any notice to THE CLIENT. In such an event, there shall be no refund and THE CLIENT shall indemnify and hold harmless Chromata Films against any claim, loss, damage and/or any other liability, including any third party liability, arising out of, relating directly and/or indirectly to and/or in connection with such termination.",
    "",
    "## 10. COMPLETION SCHEDULE",
    "Digital processing takes approximately 8 to 12 weeks for the highlight film; the feature film is generally processed in the following 4 to 8 weeks after the highlight, subject to the videographer’s workload. Where additional time is necessary, thereby a need to vary the completion schedule, Chromata Films shall notify THE CLIENT by providing written notice.",
    "",
    "## 11. PAYMENTS",
    "THE CLIENT shall pay Chromata Films 50% of the total at the time of signing and the remaining 50% six weeks prior to the event. Where timely payment is not received, interest at 5% per annum shall apply to any unpaid monies, and Chromata Films may send payment reminders to THE CLIENT by email. Subject to Full Payment being made, Chromata Films shall have a lien and charge over the video taken during the wedding coverage, and shall have the right not to provide any of the images to THE CLIENT.",
    "THE CLIENT acknowledges that they are not the owner of the videos and images unless Full Payment has been made.",
    "",
    "## 12. FINAL COLLECTION",
    "Chromata Films will produce the films and any additional material once post-processing is completed, subject to clause 10. Chromata Films will provide a cloud storage link with the Full HD films edited. RAW footage can be sent over for an additional fee of 5,490 EUR, which can be discussed. The films and additional materials (if any) are known as the “deliverables”.",
    "",
    "## 13. MODE OF PAYMENT",
    "Payment may be deposited into the following bank account:",
    "{{bank_details}}",
    "",
    "## 14. LIMIT OF LIABILITY",
    "Chromata Films shall not be liable to THE CLIENT for any severe medical, natural, and/or any other emergencies directly or indirectly resulting in and/or flood, fire, warfare, adverse changes to laws or regulations prohibiting videography, electrical failure, strikes by suppliers, and/or conditions beyond Chromata Films’ control (a “Force Majeure event”), preventing the performance of this contract. Chromata Films shall inform THE CLIENT as soon as reasonably practicable upon the occurrence of a Force Majeure event.",
    "Notwithstanding anything to the contrary in this contract, Chromata Films’ liability, whether in contract, tort or otherwise, shall not exceed the total amount received by Chromata Films from THE CLIENT under this contract.",
    "",
    "## 14bis. PANDEMIC",
    "Chromata Films shall not be liable to THE CLIENT for any pandemic occurring at the time of or during the preparation of the event. If a strict lockdown is put in place by the authorities, or the number of guests available to attend is below 60% of the original number because of travel restrictions / ban, THE CLIENT shall postpone to a new date without any limitation in time. The deposit will be kept and moved to the new date chosen. Chromata Films will try its best to accommodate a mutual date, even by proposing some if needed, so that the Chromata Films team can be there to document the wedding. If no mutual date can be found, the deposit shall be kept by Chromata Films.",
    "",
    "## 15. INDEMNITY",
    "THE CLIENT shall jointly and severally indemnify Chromata Films against all actions, suits, causes of action, claims or demands brought by any person against Chromata Films (Third Party Claim) if that Third Party Claim arises out of or is in any way connected with the outfits, travel or photoshoot, including any legal costs incurred under any circumstances.",
    "Should there be any Third Party Claim brought against Chromata Films arising out of or in connection with the matters mentioned in this clause, THE CLIENT guarantees and indemnifies Chromata Films even if THE CLIENT: (a) does not sign or does not properly execute this agreement and/or any other document; (b) does not become liable under this agreement; (c) stops being liable or is discharged from liability, whether by agreement with THE CLIENT and/or because of any principle of law or equity; or (d) is ever incapacitated.",
    "",
    "## 16. ABILITY TO TRAVEL",
    "THE CLIENT unconditionally guarantees and warrants to Chromata Films that they are fit for travel. Any medical documents required for the purposes of clearance of travel shall be provided to Chromata Films in writing prior to any travel arrangements being made by Chromata Films.",
    "",
    "## 17. NON-GUARANTEE",
    "Chromata Films shall not be liable to THE CLIENT for any videos ruined due to any cause beyond Chromata Films’ control, including but not limited to any improper, abusive, unruly and/or discourteous behaviour of any third party.",
    "",
    "## 18. SEVERABILITY",
    "If any provision of this contract is held to be invalid or unenforceable under the law, the validity of this contract shall not be affected and the other provisions of this contract shall remain in full force and effect.",
    "",
    "## 19. GOVERNING LAW AND JURISDICTION",
    "This contract is governed by Swiss law, in particular the Swiss Code of Obligations (CO), to the exclusion of its conflict-of-laws rules. The courts of Geneva, Switzerland have exclusive jurisdiction, subject to any mandatory place of jurisdiction provided by law.",
    "",
    "## 20. ELECTRONIC SIGNATURE",
    "The parties agree that this contract may be concluded and signed electronically. The electronic signature of THE CLIENT, together with the date and time of signature, is valid and binding as a handwritten signature to the extent permitted by law.",
    "",
    "## Payment schedule",
    "To be paid upon signature (50%): {{deposit}}, to be received by Chromata Films SARL.",
    "To be paid 6 weeks prior to the event (50%): {{balance}}{{balance_due}}, to be received by Chromata Films SARL.",
    "TOTAL: {{total}} (VAT 0.00% if outside of Switzerland or not Swiss people).",
    "",
    "We have read and understood the terms above. We hereby agree to the terms of this contract."
  ].join("\n");

  function fill(tpl, v) { return String(tpl).replace(/\{\{(\w+)\}\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }

  /* The studio has three bank accounts (Settings): EUR (default), CHF and USD. Each project says which one to give. */
  var BANK_KEYS = { EUR: "bank_details", CHF: "bank_details_chf", USD: "bank_details_usd" };
  function bankKey(account) { return BANK_KEYS[account] || BANK_KEYS.EUR; }
  function bankFor(settings, account) { var t = (settings || {})[bankKey(account)]; return t && t.trim() ? t.trim() : ""; }

  /* settings = { contract_template, bank_details, bank_details_chf, bank_details_usd } (from the database; all optional) */
  function build(p, amount, settings) {
    settings = settings || {};
    var fee = +amount || +p.total || 0, dep = Math.round(fee * 50) / 100, bal = Math.round((fee - dep) * 100) / 100;
    var due = "";
    if (/^\d{4}-\d{2}-\d{2}/.test(p.wedding_date || "")) { var d = new Date(p.wedding_date.slice(0, 10) + "T12:00:00"); d.setDate(d.getDate() - 42); due = " (due " + fmtDate(d.toISOString().slice(0, 10)) + ")"; }
    var body = fill(settings.contract_template && settings.contract_template.trim() ? settings.contract_template : DEFAULT_TEMPLATE, {
      couple: p.couple_names || "[couple names]", collection: p.collection || "[collection]", date: fmtDate(p.wedding_date), venue: p.venue || "[venue]", location: p.location || "",
      total: fee ? money(fee) : "[amount]", deposit: fee ? money(dep) : "[amount]", balance: fee ? money(bal) : "[amount]", balance_due: due,
      bank_details: bankFor(settings, p.bank_account) || "[Bank details: add them in the back office, Settings]"
    });
    return { title: "Wedding film agreement · " + (p.couple_names || "Clients"), body: body };
  }

  /* "## Heading" lines become sub-headings; everything else keeps its line breaks. */
  function render(body) {
    return String(body || "").split("\n").map(function (l) {
      if (l.indexOf("## ") === 0) return "<h3>" + esc(l.slice(3)) + "</h3>";
      return l.trim() ? "<p>" + esc(l) + "</p>" : "";
    }).join("");
  }

  /* All countries, in English, from the browser itself. Falls back to a plain text box when unsupported. */
  function countries() {
    try {
      var dn = new Intl.DisplayNames(["en"], { type: "region" }), out = [], A = 65;
      for (var i = 0; i < 26; i++) for (var j = 0; j < 26; j++) {
        var code = String.fromCharCode(A + i, A + j), n = dn.of(code);
        if (n && n !== code && !/Unknown Region/i.test(n)) out.push(n);
      }
      return out.filter(function (n, i, a) { return a.indexOf(n) === i; }).sort(function (a, b) { return a.localeCompare(b); });
    } catch (e) { return []; }
  }

  /* Hand-drawn signature on a canvas (mouse, touch or pen). Returns controls. */
  function signaturePad(canvas, onChange) {
    var ctx = canvas.getContext("2d"), drawing = false, last = null, empty = true;
    function size() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(2, w.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#16130F";
      empty = true;
    }
    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    canvas.addEventListener("pointerdown", function (e) { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      var p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
      if (empty) { empty = false; onChange && onChange(false); }
      e.preventDefault();
    });
    var end = function () { drawing = false; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    size();
    return {
      clear: function () { ctx.clearRect(0, 0, canvas.width, canvas.height); empty = true; onChange && onChange(true); },
      isEmpty: function () { return empty; },
      png: function () { return canvas.toDataURL("image/png"); }
    };
  }

  w.CRMContract = { DEFAULT_TEMPLATE: DEFAULT_TEMPLATE, bankKey: bankKey, bankFor: bankFor, build: build, render: render, esc: esc, eur: eur, money: money, fmtDate: fmtDate, countries: countries, signaturePad: signaturePad };
})(window);
