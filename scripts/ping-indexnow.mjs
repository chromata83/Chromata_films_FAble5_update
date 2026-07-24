// Chromata Films — IndexNow submission.
//
// IndexNow tells Bing (and therefore ChatGPT's search grounding), Yandex and
// Seznam that URLs have changed, instead of waiting weeks for a crawl. Google
// does not use IndexNow; for Google, the sitemap + Search Console does the job.
//
// Run after a deploy:  node scripts/ping-indexnow.mjs
// Submit specific pages: node scripts/ping-indexnow.mjs wedding-videographer-france.html
//
// The key must stay downloadable at https://www.chromatafilms.com/<KEY>.txt —
// that file is how the search engine verifies we own the domain.

import { readFileSync } from "node:fs";

const KEY = "c0e02bdc3198f7fea0b7192ac9ffb6ef";
const HOST = "www.chromatafilms.com";
const SITE_URL = `https://${HOST}`;

const urlsFromSitemap = () => {
  const xml = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
};

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map((a) => (a.startsWith("http") ? a : `${SITE_URL}/${a.replace(/^\//, "")}`))
  : urlsFromSitemap();

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `${SITE_URL}/${KEY}.txt`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// 200 = accepted, 202 = accepted but key still being validated. Both are fine.
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
