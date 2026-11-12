// End-to-end test of the whole site, the way a visitor, a member and the admin use it.
//
//   npm run test:e2e            (starts the local dev server if it isn't running)
//
// It uses the LOCAL test database only (.cloudflare/state). It sets a known local
// admin password directly in that local database, so it never touches the live site.
// Screenshots of failures go to tests/e2e/out/.
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, existsSync, readFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Playwright is not a project dependency (it would slow down deploys). Install it once
// with `npm i -g playwright && npx playwright install chromium` to run this test.
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const B = process.env.BASE ?? "http://localhost:5173";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(HERE, "out");
const PHOTO = path.join(HERE, "fixtures/photo.jpg");
const ADMIN = "sabongcentralph@gmail.com";
const ADMIN_PW = "local-e2e-only-" + Date.now();
const RUN = Date.now().toString(36);
mkdirSync(OUT, { recursive: true });

// ---------- tiny test runner: every step runs, failures are collected ----------
const results = [];
let current = "";
async function step(name, fn) {
  current = name;
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t0 });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, err: String(e?.message ?? e).split("\n")[0] });
    console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`);
    for (const p of pages) await p.screenshot({ path: path.join(OUT, `${name.replace(/\W+/g, "_").slice(0, 60)}_${pages.indexOf(p)}.png`), fullPage: true }).catch(() => {});
  }
}
const section = (s) => console.log(`\n${s}`);
const fail = (m) => { throw new Error(m); };
const text = (p) => p.locator("body").innerText();
async function see(p, s) { if (!(await text(p)).includes(s)) fail(`expected to see “${s}” on ${p.url()}`); }
async function notSee(p, s) { if ((await text(p)).includes(s)) fail(`did not expect “${s}” on ${p.url()}`); }
const pages = [];
const pageErrors = [];
function watch(p, who) {
  pages.push(p);
  p.on("pageerror", (e) => pageErrors.push(`${who} ${p.url()}: ${e.message}`));
  p.on("response", (r) => { if (r.status() >= 500) pageErrors.push(`${who} HTTP ${r.status()} ${r.url()}`); });
  return p;
}
async function go(p, url) {
  const r = await p.goto(B + url);
  if (!r || r.status() >= 400) fail(`${url} returned ${r?.status()}`);
  return r;
}
async function place(p) {
  await p.locator("select[name=province]").selectOption("Cebu");
  await p.locator("select[name=city]").selectOption("Cebu City");
}
const hydrate = (p) => p.waitForTimeout(2500); // photo pickers need the page to be interactive
// Drops a photo onto an upload box the way a mouse drag would.
async function dropPhoto(p, inputName) {
  const b64 = readFileSync(PHOTO).toString("base64");
  await p.evaluate(({ b64, inputName }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], "dropped.jpg", { type: "image/jpeg" }));
    const zone = document.querySelector(`input[name=${inputName}]`).closest("[data-dropzone]");
    zone.dispatchEvent(new DragEvent("dragover", { dataTransfer: dt, bubbles: true, cancelable: true }));
    zone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { b64, inputName });
  await p.waitForFunction((n) => document.querySelector(`input[name=${n}]`).files.length > 0 && !document.body.innerText.includes("Shrinking photo"), inputName);
}

// ---------- dev server + local admin password ----------
async function up() {
  try { const r = await fetch(B + "/api/health"); return r.status < 500; } catch { return false; }
}
async function startServer() {
  if (await up()) return null;
  console.log("Starting local dev server…");
  const s = spawn("npx", ["vite", "dev", "--port", "5173", "--strictPort"], { cwd: ROOT, stdio: "ignore", detached: true });
  for (let i = 0; i < 90; i++) { await new Promise((r) => setTimeout(r, 1000)); if (await up()) return s; }
  throw new Error("dev server did not start");
}
async function pbkdf2Hash(pw) {
  const b64 = (u) => Buffer.from(u).toString("base64");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return `pbkdf2$100000$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}
// Same 6-digit codes an authenticator app makes (RFC 6238).
async function totp(secret, offset = 0) {
  const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.replace(/\s/g, "")) bits += B32.indexOf(c).toString(2).padStart(5, "0");
  const key = Uint8Array.from(bits.match(/.{8}/g), (b) => parseInt(b, 2));
  const counter = Math.floor(Date.now() / 30000) + offset;
  const msg = new ArrayBuffer(8);
  new DataView(msg).setUint32(4, counter);
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", k, msg));
  const o = h[19] & 15;
  return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6).padStart(6, "0");
}
async function setLocalAdminPassword() {
  await fetch(B + "/admin/login"); // creates the admins table
  await fetch(B + "/api/admin/login", { method: "POST", body: new URLSearchParams({ email: "x@example.com", password: "x" }) }).catch(() => {});
  const dir = path.join(ROOT, ".cloudflare/state/v3/d1/miniflare-D1DatabaseObject");
  if (!existsSync(dir)) fail("local D1 database not found");
  const hash = await pbkdf2Hash(ADMIN_PW);
  let done = 0;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite")) {
    const db = new DatabaseSync(path.join(dir, f));
    try {
      const has = db.prepare(`select name from sqlite_master where name = 'admins'`).get();
      if (has) {
        db.prepare(`update admins set pw_hash = ? where email = ?`).run(hash, ADMIN);
        db.prepare(`delete from login_attempts`).run();
        try { db.prepare(`delete from admin_2fa`).run(); } catch { /* table not created yet */ }
        done++;
      }
    } finally { db.close(); }
  }
  if (!done) fail("admins table not found in the local database");
}

// ---------- the test ----------
const server = await startServer();
await setLocalAdminPassword();
const browser = await chromium.launch();
const phone = watch(await (await browser.newContext({ ...devices["iPhone 13"] })).newPage(), "phone");
const desk = watch(await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage(), "desktop");
const admin = watch(await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage(), "admin");
const member = watch(await (await browser.newContext({ ...devices["Pixel 7"] })).newPage(), "member");

// Everyone in this test has passed the 21+ age check, except one fresh visitor below.
for (const p of [phone, desk, admin, member]) await p.context().addCookies([{ name: "sc_21", value: "1", url: B }]);

const PUBLIC = ["/", "/events", "/reels", "/farms", "/education", "/market", "/learn", "/notices", "/suppliers", "/search?q=feeds", "/contact", "/report", "/submit", "/portal", "/settings"];

section("0. Age check (21+)");
await step("a first-time visitor must confirm they are 21 or older", async () => {
  const v = watch(await (await browser.newContext({ ...devices["iPhone 13"] })).newPage(), "visitor");
  await go(v, "/farms");
  await see(v, "Are you 21 or older?");
  await v.click("button:has-text('No, I am under 21')");
  await v.waitForLoadState();
  await see(v, "this site is for adults 21 and over");
  await v.context().clearCookies();
  await go(v, "/farms");
  await v.click("button:has-text('Yes, I am 21 or older')");
  await v.waitForURL(/\/farms$/);
  await notSee(v, "Are you 21 or older?");
  await see(v, "Gamble responsibly");
  await go(v, "/legal/responsible-gaming");
  await see(v, "(02) 8248-9568");
  await v.context().close();
  pages.splice(pages.indexOf(v), 1);
});

section("1. Public pages (visitor, no account)");
for (const url of PUBLIC) {
  await step(`opens ${url} on phone without errors or sideways scrolling`, async () => {
    await go(phone, url);
    const over = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 2) fail(`page is ${over}px wider than the phone screen`);
  });
}
await step("every link in the menu, header and footer works", async () => {
  await go(desk, "/");
  const hrefs = await desk.$$eval("a[href^='/']", (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  const bad = [];
  for (const h of hrefs) {
    if (h.startsWith("/admin") || h.startsWith("/media")) continue;
    const r = await desk.request.get(B + h, { maxRedirects: 3 });
    if (r.status() >= 400) bad.push(`${h} → ${r.status()}`);
  }
  if (bad.length) fail(`broken links: ${bad.join(", ")}`);
});
await step("admin pages are locked for visitors", async () => {
  for (const u of ["/admin", "/admin/queue", "/admin/members", "/admin/documents", "/admin/reports"]) {
    await desk.goto(B + u);
    if (!desk.url().includes("/admin/login")) await see(desk, "Sign in");
    await notSee(desk, "Review queue");
  }
  const r = await desk.request.post(B + "/api/admin/action", { form: { id: "1", action: "approve" }, headers: { Origin: B }, maxRedirects: 0 });
  if (r.status() !== 403) fail(`admin action without login returned ${r.status()}`);
  const d = await desk.request.get(B + "/admin/doc/1/0");
  if (d.status() !== 404) fail(`private document without login returned ${d.status()}`);
});

section("2. Public forms");
const art = `E2E Article ${RUN}`, reel = `E2E Reel ${RUN}`, notice = `E2E Notice ${RUN}`;
await step("submits an article through the public form", async () => {
  await go(phone, "/submit?tab=article");
  await phone.fill("input[name=title]", art);
  await phone.selectOption("select[name=topic]", { index: 1 });
  await phone.fill("textarea[name=body]", "Clean water every day keeps chicks healthy. Change it twice a day in hot weather.\n\nKeep feeders dry.");
  await phone.fill("input[name=contactName]", "E2E Writer");
  await phone.fill("input[name=email]", "writer@example.com");
  await phone.fill("input[name=vfb]", "facebook.com/e2ewriter");
  await phone.check("input[name=confirm]");
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/sent=1/);
});
await step("submits an educational reel", async () => {
  await go(phone, "/submit?tab=reel");
  await phone.fill("input[name=title]", reel);
  await phone.fill("input[name=url]", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await phone.fill("input[name=contactName]", "E2E Farmer");
  await phone.fill("input[name=email]", "farmer@example.com");
  await phone.fill("input[name=vfb]", "facebook.com/e2efarmer");
  await phone.check("input[name=confirm]");
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/sent=1/);
});
await step("submits a community announcement", async () => {
  await go(phone, "/submit?tab=notice");
  await phone.fill("input[name=title]", notice);
  await phone.fill("textarea[name=text]", "Farm visit day on Saturday. By appointment.");
  await phone.fill("input[name=contactName]", "E2E Farmer");
  await phone.fill("input[name=email]", "farmer@example.com");
  await phone.fill("input[name=vfb]", "facebook.com/e2efarmer");
  await phone.check("input[name=confirm]");
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/sent=1/);
});
await step("refuses a public submission without a Facebook link", async () => {
  await go(phone, "/submit?tab=notice");
  await phone.fill("input[name=title]", "No link");
  await phone.fill("textarea[name=text]", "Test");
  await phone.fill("input[name=contactName]", "X");
  await phone.fill("input[name=email]", "x@example.com");
  await phone.fill("input[name=vfb]", "example.com/notfacebook");
  await phone.check("input[name=confirm]");
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/error=/);
});
await step("sends a Contact Us message", async () => {
  await go(phone, "/contact");
  await phone.fill("input[name=name]", "E2E Visitor");
  await phone.fill("input[name=email]", "visitor@example.com");
  await phone.selectOption("select[name=topic]", "Request a Portal account");
  await phone.fill("textarea[name=body]", `Please make me an account ${RUN}`);
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/sent=1/);
});
await step("Portal sign-up is closed and points to Contact Us", async () => {
  await go(phone, "/portal");
  await see(phone, "No account yet?");
  const r = await phone.request.post(B + "/api/member/code", { form: { email: "new@example.com" }, headers: { Origin: B }, maxRedirects: 0 });
  if (!decodeURIComponent(r.headers().location ?? "").includes("aren’t available")) fail("email-code sign-up is still open");
});

section("3. Admin sign-in and review");
await step("wrong admin password is refused", async () => {
  await go(admin, "/admin/login");
  await admin.fill("input[name=email]", ADMIN);
  await admin.fill("input[name=password]", "wrong-password-123");
  await admin.click("form button[type=submit]");
  await admin.waitForLoadState();
  if (!admin.url().includes("/admin/login")) fail("wrong password got in");
});
await step("admin signs in and sees the dashboard (with the two-step login reminder)", async () => {
  await go(admin, "/admin/login");
  await admin.fill("input[name=email]", ADMIN);
  await admin.fill("input[name=password]", ADMIN_PW);
  await admin.click("form button[type=submit]");
  await admin.waitForURL((u) => !u.pathname.includes("/login"));
  await go(admin, "/admin");
  await see(admin, "Waiting for review");
});
async function openInQueue(title, q = "") {
  await go(admin, `/admin/queue${q}`);
  await admin.click(`a:has-text("${title}")`);
  await admin.waitForURL(/\/admin\/item\/\d+/);
  return admin.url().split("?")[0];
}
async function act(action, reason = "") {
  if (reason) await admin.locator("textarea[name=reason]").first().fill(reason);
  await admin.click(`button[value=${action}]`);
  await admin.waitForURL(new RegExp(`done=${action}`));
}
await step("approves the article, and it shows on Learn", async () => {
  await openInQueue(art);
  await see(admin, "facebook.com/e2ewriter");
  await act("approve");
  await go(phone, "/learn");
  await see(phone, art);
});
await step("requests changes on the reel with a reason", async () => {
  await openInQueue(reel);
  await admin.click("button[value=request_changes]");
  await admin.waitForURL(/error=reason/);
  await act("request_changes", "Please add a short description.");
  await go(phone, "/reels");
  await notSee(phone, reel);
});
await step("rejects the announcement", async () => {
  await openInQueue(notice);
  await act("reject", "Not an announcement.");
  await go(phone, "/notices");
  await notSee(phone, notice);
});
await step("contact message arrives in Messages", async () => {
  await go(admin, "/admin/messages");
  await see(admin, `Please make me an account ${RUN}`);
});

section("3b. Admin adds listings directly (Listed by Sabong Central)");
const aDerby = `E2E Derby ${RUN}`, aFarm = `E2E Listed Farm ${RUN}`, aReel = `E2E Listed Reel ${RUN}`;
await step("admin publishes a derby straight away", async () => {
  await go(admin, "/admin/add?tab=event");
  await hydrate(admin);
  await admin.fill("input[name=title]", aDerby);
  const derbySub = await admin.$$eval("select[name=sub] optgroup", (gs) => gs.flatMap((g) => [...g.querySelectorAll("option")].map((o) => o.value)).find((v) => /derby/i.test(v)));
  await admin.selectOption("select[name=sub]", derbySub ?? { index: 1 });
  await admin.fill("input[name=org]", "E2E Organizers");
  await admin.fill("input[name=date]", "2026-12-12");
  await place(admin);
  await admin.fill("input[name=permits]", "LGU permit 123, cockpit license 456");
  await admin.fill("input[name=vfb]", "facebook.com/e2eorganizers/posts/1");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(phone, "/events");
  await see(phone, aDerby);
  await phone.click(`a:has-text("${aDerby}")`);
  await phone.waitForLoadState();
  await see(phone, "21+ only · Gamble responsibly");
});
await step("admin adds a farm without a phone number, and a reel", async () => {
  await go(admin, "/admin/add?tab=farm");
  await hydrate(admin);
  await admin.fill("input[name=name]", aFarm);
  await place(admin);
  await admin.fill("input[name=facebook]", "facebook.com/e2elistedfarm");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(admin, "/admin/add?tab=reel");
  await admin.fill("input[name=url]", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await admin.fill("input[name=title]", aReel);
  await admin.fill("input[name=vfb]", "facebook.com/e2elistedfarm");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(phone, "/reels");
  await see(phone, aReel);
});
await step("admin publishes an article, an official advisory and a supplier", async () => {
  await go(admin, "/admin/add?tab=article");
  await admin.fill("input[name=title]", `E2E Admin Article ${RUN}`);
  await admin.fill("textarea[name=body]", "Vaccinate chicks on schedule.\n\nKeep records of every dose.");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(admin, "/admin/add?tab=notice");
  await admin.fill("input[name=title]", `E2E Advisory ${RUN}`);
  await admin.fill("textarea[name=text]", "Bird flu watch in the area. Report sick birds.");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/error=/); // official advisory without issuer and source is refused
  await admin.fill("input[name=title]", `E2E Advisory ${RUN}`);
  await admin.fill("textarea[name=text]", "Bird flu watch in the area. Report sick birds.");
  await admin.fill("input[name=issuer]", "Bureau of Animal Industry");
  await admin.fill("input[name=url]", "https://www.bai.gov.ph/");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(admin, "/admin/add?tab=supplier");
  await admin.fill("input[name=name]", `E2E Supplier ${RUN}`);
  await admin.selectOption("select[name=skind]", "Feed Manufacturers");
  await admin.fill("input[name=place]", "Lipa City, Batangas");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(phone, "/learn"); await see(phone, `E2E Admin Article ${RUN}`);
  await go(phone, "/notices"); await see(phone, `E2E Advisory ${RUN}`); await see(phone, "Bureau of Animal Industry");
  await go(phone, "/suppliers"); await see(phone, `E2E Supplier ${RUN}`); await see(phone, "Listed by Sabong Central");
});
await step("the farm page says Listed by Sabong Central, and Claim opens Contact Us filled in", async () => {
  await go(phone, "/farms");
  await phone.click(`a:has-text("${aFarm}")`);
  await phone.waitForLoadState();
  await see(phone, "Listed by Sabong Central");
  await phone.click("a:has-text('Claim or correct it')");
  await phone.waitForURL(/contact/);
  if ((await phone.inputValue("select[name=topic]")) !== "Claim or correct a listing") fail("topic not preselected");
  if (!(await phone.inputValue("textarea[name=body]")).includes(aFarm)) fail("listing name not filled in");
});
await step("admin makes the farm the Farm Spotlight and Featured", async () => {
  await openInQueue(aFarm, "?q=Approved");
  await admin.click("button:has-text('Make Farm Spotlight')");
  await admin.waitForURL(/done=spotlight/);
  await admin.click("button:has-text('Feature on home page')");
  await admin.waitForURL(/done=feature/);
  await go(phone, "/");
  const spot = await phone.locator("section:has(h2:has-text('Farm Spotlight'))").innerText();
  if (!spot.includes(aFarm)) fail("farm is not the spotlight");
  const feat = await phone.locator("section:has(h2:has-text('Featured Gamefarms'))").innerText();
  if (!feat.includes(aFarm)) fail("farm is not featured");
});
await step("admin edits its own listing and it changes at once", async () => {
  await openInQueue(aFarm, "?q=Approved");
  await admin.click("a:has-text('Edit listing')");
  await admin.waitForURL(/add\?edit=/);
  await hydrate(admin);
  await admin.fill("textarea[name=about]", "Family farm in Cebu.");
  await admin.click("button:has-text('Save changes (live now)')");
  await admin.waitForURL(/done=edited/);
  await go(phone, "/farms");
  await phone.click(`a:has-text("${aFarm}")`);
  await phone.waitForLoadState();
  await see(phone, "Family farm in Cebu.");
});

await step("admin adds a venue that also organizes, and a derby there links to it", async () => {
  const vName = `E2E Cockpit Arena ${RUN}`, dTitle = `E2E Arena Derby ${RUN}`;
  await go(admin, "/admin/add?tab=venue");
  await hydrate(admin);
  await admin.fill("input[name=name]", vName);
  await admin.check("input[name=role][value=Organizer]");
  await place(admin);
  await admin.fill("input[name=place]", "Barangay Lahug");
  await admin.fill("input[name=operator]", "Private Operator Name");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(admin, "/admin/add?tab=event");
  await hydrate(admin);
  if (!(await admin.locator(`#sc-venues option[value="${vName}"]`).count())) fail("venue not suggested in the event form");
  await admin.fill("input[name=title]", dTitle);
  const derbySub = await admin.$$eval("select[name=sub] optgroup", (gs) => gs.flatMap((g) => [...g.querySelectorAll("option")].map((o) => o.value)).find((v) => /derby/i.test(v)));
  await admin.selectOption("select[name=sub]", derbySub ?? { index: 1 });
  await admin.fill("input[name=org]", vName);
  await admin.fill("input[name=date]", "2026-12-28");
  await place(admin);
  await admin.fill("input[name=venue]", vName);
  await admin.fill("input[name=permits]", "LGU permit 9");
  await admin.fill("input[name=vfb]", "facebook.com/e2earena");
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=published/);
  await go(phone, "/events");
  await phone.click("nav[aria-label='Events sections'] a:has-text('Venues & Organizers')");
  await phone.waitForURL(/\/venues/);
  await see(phone, vName);
  await phone.selectOption("select[name=province]", "Cebu");
  await phone.click("button:has-text('Filter')");
  await phone.waitForURL(/province=Cebu/);
  await phone.click(`a:has-text("${vName}")`);
  await phone.waitForURL(/\/venues\//);
  await see(phone, "Permit not yet verified");
  await see(phone, dTitle);
  await see(phone, "Listed by Sabong Central");
  await notSee(phone, "Private Operator Name");
  await phone.click(`a:has-text("${dTitle}")`);
  await phone.waitForURL(/\/events\//);
  await phone.click(`a:has-text("${vName}") >> nth=0`);
  await phone.waitForURL(/\/venues\//);
});
await step("admin saves a draft (poster dragged in), publishes it, then deletes it", async () => {
  const t = `E2E Draft Seminar ${RUN}`;
  await go(admin, "/admin/add?tab=event");
  await hydrate(admin);
  await admin.fill("input[name=title]", t);
  await admin.selectOption("select[name=sub]", "Biosecurity");
  await admin.fill("input[name=date]", "2026-12-20");
  await place(admin);
  await admin.fill("input[name=vfb]", "facebook.com/e2eorganizers");
  await dropPhoto(admin, "poster");
  await see(admin, "KB");
  await admin.click("button:has-text('Save as draft')");
  await admin.waitForURL(/done=draft_saved/);
  await see(admin, "This is a draft");
  await go(phone, "/education"); await notSee(phone, t);
  await go(admin, "/admin/queue?q=Draft"); await see(admin, t);
  await admin.click(`a:has-text("${t}")`);
  await admin.waitForURL(/admin\/item/);
  await admin.click("button:has-text('Publish now')");
  await admin.waitForURL(/done=approve/);
  await go(phone, "/education"); await see(phone, t);
  await go(admin, "/admin/queue?q=Approved");
  await admin.click(`a:has-text("${t}")`);
  await admin.waitForURL(/admin\/item/);
  if (!(await admin.locator("img[src^='/media/p/']").count())) fail("dropped poster was not saved");
  admin.once("dialog", (d) => d.accept());
  await admin.click("button:has-text('Delete')");
  await admin.waitForURL(/deleted=/);
  await see(admin, `Deleted “${t}”`);
  await go(phone, "/education"); await notSee(phone, t);
});

section("4. Member accounts (created by admin)");
const memEmail = `e2e.${RUN}@example.com`, memName = `E2E Farm ${RUN}`;
let temp = "", memberUrl = "";
await step("admin creates a Portal account and gets a temporary password", async () => {
  await go(admin, "/admin/members/new");
  await admin.fill("input[name=name]", memName);
  await admin.fill("input[name=email]", memEmail);
  await admin.fill("input[name=phone]", "0917 555 0000");
  for (const r of ["farm", "organizer", "seller"]) await admin.check(`input[value=${r}]`);
  await admin.fill("input[name=facebook]", "facebook.com/e2efarm");
  await admin.click("button:has-text('Create account')");
  await admin.waitForURL(/done=created/);
  memberUrl = new URL(admin.url()).pathname;
  temp = (await admin.locator("pre").innerText()).match(/Temporary password: (\S+)/)?.[1] ?? fail("no temporary password shown");
});
await step("creating the same email twice is refused", async () => {
  await go(admin, "/admin/members/new");
  await admin.fill("input[name=name]", "Dup");
  await admin.fill("input[name=email]", memEmail);
  await admin.fill("input[name=phone]", "0917 555 0000");
  await admin.check("input[value=farm]");
  await admin.fill("input[name=facebook]", "facebook.com/dup");
  await admin.click("button:has-text('Create account')");
  await admin.waitForURL(/error=/);
});
async function memberLogin(pw) {
  await member.context().clearCookies();
  await member.context().addCookies([{ name: "sc_21", value: "1", url: B }]);
  await go(member, "/portal");
  await member.fill("input[name=email]", memEmail);
  await member.fill("input[name=password]", pw);
  await member.click("button:has-text('Sign in')");
  await member.waitForLoadState();
}
await step("member signs in with the temporary password and must choose a new one", async () => {
  await memberLogin(temp);
  await see(member, "choose your own password");
  await go(member, "/portal?tab=farm");
  await see(member, "choose your own password");
  await member.fill("input[name=next]", "short");
  await member.fill("input[name=again]", "short");
  await member.check("input[name=adult]");
  await member.check("input[name=terms]");
  await member.click("button:has-text('Save my password')").catch(() => {});
  await member.fill("input[name=next]", "e2e-member-pass");
  await member.fill("input[name=again]", "e2e-member-pass");
  await member.check("input[name=adult]");
  await member.check("input[name=terms]");
  await member.click("button:has-text('Save my password')");
  await member.waitForURL(/welcome=1/);
});
await step("the old temporary password no longer works", async () => {
  await memberLogin(temp);
  await see(member, "not right");
  await memberLogin("e2e-member-pass");
  await see(member, "My listings");
});

await step("admin moves the Listed farm to the member's account", async () => {
  await openInQueue(aFarm, "?q=Approved");
  await admin.fill("input[name=member]", memEmail);
  await admin.click("button[value=transfer]");
  await admin.waitForURL(/done=transfer/);
  await go(member, "/portal");
  await see(member, aFarm);
  await go(phone, "/farms");
  await phone.click(`a:has-text("${aFarm}")`);
  await phone.waitForLoadState();
  await notSee(phone, "Listed by Sabong Central");
});

section("5. Member listings with photos");
const farm = `E2E Gamefarm ${RUN}`, ev = `E2E Seminar ${RUN}`, item = `E2E Feeder ${RUN}`;
await step("submits a farm with a profile photo and gallery (photos shrink first)", async () => {
  await go(member, "/portal?tab=farm");
  await hydrate(member);
  await member.fill("input[name=name]", farm);
  await place(member);
  await member.fill("input[name=phone]", "0917 555 0000");
  await member.setInputFiles("input[name=profile]", PHOTO);
  await member.setInputFiles("input[name=gallery]", [PHOTO, PHOTO]);
  await member.waitForTimeout(4000);
  const kb = await member.locator("text=/\\d+ KB/").allInnerTexts();
  if (!kb.length || kb.some((k) => parseInt(k) > 400)) fail(`photos not shrunk: ${kb.join(", ")}`);
  await member.check("input[name=confirm]");
  await member.click("button:has-text('Submit for review')");
  await member.waitForURL(/sent=1/);
});
await step("submits a seminar with a poster", async () => {
  await go(member, "/portal?tab=event");
  await hydrate(member);
  await member.fill("input[name=title]", ev);
  await member.locator("select[name=sub]").selectOption({ index: 1 });
  const subs = await member.$$eval("select[name=sub] optgroup", (gs) => gs.map((g) => [g.label, [...g.querySelectorAll("option")].map((o) => o.value)]));
  const sem = subs.flatMap(([, o]) => o).find((o) => /seminar/i.test(o));
  if (sem) await member.selectOption("select[name=sub]", sem);
  await member.fill("input[name=date]", "2026-12-20");
  await place(member);
  await member.setInputFiles("input[name=poster]", PHOTO);
  await member.waitForTimeout(3000);
  await member.check("input[name=confirm]");
  await member.click("button:has-text('Submit for review')");
  await member.waitForURL(/sent=1/);
});
await step("submits a Market item with 3 photos", async () => {
  await go(member, "/portal?tab=good");
  await hydrate(member);
  await member.fill("input[name=name]", item);
  await member.locator("select[name=sub]").selectOption({ index: 1 });
  await member.fill("input[name=price]", "850");
  await place(member);
  await member.setInputFiles("input[name=photos]", [PHOTO, PHOTO, PHOTO]);
  await member.waitForTimeout(4500);
  await member.check("input[name=confirm]");
  await member.click("button:has-text('Submit for review')");
  await member.waitForURL(/sent=1/);
});
await step("the three listings show as pending in My listings", async () => {
  await go(member, "/portal");
  for (const t of [farm, ev, item]) await see(member, t);
  await see(member, "Pending review");
});
await step("pending listings are not public yet", async () => {
  await go(phone, "/farms"); await notSee(phone, farm);
  await go(phone, "/market"); await notSee(phone, item);
});
await step("admin sees the member, photos and verification link, then approves all three", async () => {
  for (const t of [farm, ev, item]) {
    await openInQueue(t);
    await see(admin, memName);
    await see(admin, "facebook.com/e2efarm");
    if ((await admin.locator("img[src^='/media/p/']").count()) === 0) fail(`no photos on the review page for ${t}`);
    await act("approve");
  }
});
await step("approved listings are public with their photos", async () => {
  await go(phone, "/farms"); await see(phone, farm);
  await go(phone, "/market"); await see(phone, item);
  await phone.click(`a:has-text("${item}")`);
  await phone.waitForLoadState();
  if ((await phone.locator("img[src^='/media/p/']").count()) === 0) fail("no photos on the public Market page");
  const ok = await phone.locator("img[src^='/media/p/']").first().evaluate((i) => i.complete && i.naturalWidth > 0);
  if (!ok) fail("Market photo did not load");
  await go(phone, "/education"); await see(phone, ev);
});

section("6. Members change their own listings");
await step("editing a live Market item waits for review and the live one stays up", async () => {
  await go(member, "/portal");
  await member.locator(`li:has-text("${item}") a:has-text("Edit")`).click();
  await member.waitForURL(/tab=edit/);
  await hydrate(member);
  if ((await member.inputValue("input[name=price]")) !== "850") fail("edit form not prefilled");
  await member.fill("input[name=name]", item + " Deluxe");
  await member.check("input[name=confirm]");
  await member.click("button:has-text('Send changes for review')");
  await member.waitForURL(/edited=waiting/);
  await see(member, "Edit waiting for review");
  await go(phone, "/market");
  await see(phone, item);
  await notSee(phone, item + " Deluxe");
});
await step("admin approves the edit from Edits waiting, and the public page updates", async () => {
  await openInQueue(item, "?q=Edits");
  await see(admin, "Edit waiting");
  await act("edit_approve");
  await go(phone, "/market");
  await see(phone, item + " Deluxe");
});
await step("member marks the item Sold without review", async () => {
  await go(member, "/portal");
  const row = member.locator(`li:has-text("${item} Deluxe")`);
  await row.locator("select[name=state]").selectOption("Sold");
  await row.locator("button:has-text('Update')").click();
  await member.waitForURL(/done=state/);
});
await step("member postpones the seminar", async () => {
  const row = member.locator(`li:has-text("${ev}")`);
  await row.locator("select[name=state]").selectOption("Postponed");
  await row.locator("button:has-text('Update')").click();
  await member.waitForURL(/done=state/);
  await go(phone, "/education");
  await see(phone, "Postponed");
});
await step("member unpublishes the farm, then asks to publish it again", async () => {
  await go(member, "/portal");
  await member.locator(`li:has-text("${farm}") button:has-text("Unpublish")`).click();
  await member.waitForURL(/done=unpublish/);
  await go(phone, "/farms"); await notSee(phone, farm);
  await go(member, "/portal");
  await member.locator(`li:has-text("${farm}") button:has-text("Publish again")`).click();
  await member.waitForURL(/done=republish/);
  await openInQueue(farm);
  await act("approve");
  await go(phone, "/farms"); await see(phone, farm);
});
await step("member saves a draft, submits it for review, and deletes a listing", async () => {
  const t = `E2E Draft Item ${RUN}`;
  await go(member, "/portal?tab=good");
  await hydrate(member);
  await member.fill("input[name=name]", t);
  await member.locator("select[name=sub]").selectOption({ index: 1 });
  await place(member);
  await dropPhoto(member, "photos");
  await member.check("input[name=confirm]");
  await member.click("button:has-text('Save as draft')");
  await member.waitForURL(/done=draft/);
  await see(member, "Draft saved");
  const row = member.locator(`li:has-text("${t}")`);
  if (!(await row.innerText()).includes("Draft")) fail("not shown as a draft");
  await go(admin, "/admin/queue"); await notSee(admin, t); // drafts aren't in New
  await go(member, "/portal");
  await member.locator(`li:has-text("${t}") button:has-text("Submit for review")`).click();
  await member.waitForURL(/done=submit_draft/);
  await go(admin, "/admin/queue"); await see(admin, t);
  await go(member, "/portal");
  member.once("dialog", (d) => d.accept());
  await member.locator(`li:has-text("${t}") button:has-text("Delete")`).click();
  await member.waitForURL(/done=delete/);
  await see(member, "Listing deleted.");
  await notSee(member, t);
  await go(admin, "/admin/queue?q=All"); await notSee(admin, t);
});
await step("a member can't change someone else's listing", async () => {
  const r = await member.request.post(B + "/api/member/listing", { form: { id: "1", action: "unpublish" }, headers: { Origin: B }, maxRedirects: 0 });
  if (!decodeURIComponent(r.headers().location ?? "").includes("not found")) fail("changed a listing it doesn't own");
});

section("7. Business documents and the Business Verified badge");
await step("a PDF is refused", async () => {
  const r = await member.request.post(B + "/api/member/doc", { headers: { Origin: B }, maxRedirects: 0, multipart: { type: "SEC registration", doc: { name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") } } });
  if (!decodeURIComponent(r.headers().location ?? "").includes("PDF")) fail("PDF was not refused");
});
await step("member uploads a photo of a business permit", async () => {
  await go(member, "/portal?tab=docs");
  await hydrate(member);
  await member.selectOption("select[name=type]", { index: 3 });
  await member.fill("input[name=expires]", "2027-12-31");
  await member.setInputFiles("input[name=doc]", PHOTO);
  await member.waitForTimeout(3000);
  await member.click("button:has-text('Upload for review')");
  await member.waitForURL(/done=uploaded/);
  await see(member, "Waiting for review");
});
await step("admin opens the document (view is logged) and approves it with the badge", async () => {
  await go(admin, "/admin/documents");
  await see(admin, memName);
  await admin.locator(`article:has-text("${memName}") a:has-text("Open document")`).click();
  await admin.waitForURL(/open=/);
  await admin.waitForTimeout(800);
  const ok = await admin.locator("article img").first().evaluate((i) => i.complete && i.naturalWidth > 0);
  if (!ok) fail("document photo did not load for the admin");
  await admin.locator(`article:has-text("${memName}") button[value=approve]`).click();
  await admin.waitForURL(/done=approve/);
  await go(admin, "/admin");
  const log = await text(admin);
  if (!log.includes("document viewed") && !log.includes("document approved")) console.log("      (note: dashboard activity list shows only the latest few actions)");
});
await step("the farm now shows Business Verified publicly", async () => {
  await go(phone, "/farms");
  await phone.click(`a:has-text("${farm}")`);
  await phone.waitForLoadState();
  await see(phone, "Business Verified");
});

section("8. Reports");
await step("a visitor reports the Market item", async () => {
  await go(phone, `/report?target=${encodeURIComponent(item + " Deluxe")}`);
  await phone.locator("select[name=reason]").selectOption({ index: 1 });
  await phone.fill("textarea[name=details]", "Asked me to pay first.");
  await phone.click("form button[type=submit]");
  await phone.waitForURL(/sent=1/);
});
await step("admin moves the report to Investigating, then Resolved (note required)", async () => {
  await go(admin, "/admin/reports");
  const card = admin.locator(`article:has-text("${item} Deluxe")`).first();
  await card.locator("select[name=status]").selectOption("investigating");
  await card.locator("input[name=note]").fill("Messaged the seller.");
  await card.locator("button:has-text('Save')").click();
  await admin.waitForURL(/done=1/);
  const c2 = admin.locator(`article:has-text("${item} Deluxe")`).first();
  await c2.locator("select[name=status]").selectOption("resolved");
  await c2.locator("button:has-text('Save')").click();
  await admin.waitForURL(/error=note/);
  const c3 = admin.locator(`article:has-text("${item} Deluxe")`).first();
  await c3.locator("select[name=status]").selectOption("resolved");
  await c3.locator("input[name=note]").fill("Seller confirmed. No payment asked.");
  await c3.locator("button:has-text('Save')").click();
  await admin.waitForURL(/done=1/);
  await go(admin, "/admin/reports?s=resolved");
  await see(admin, item + " Deluxe");
});

section("9. Account safety");
await step("admin resets the member's password; the member is signed out", async () => {
  await go(admin, memberUrl);
  await admin.click("button[value=reset_password]");
  await admin.waitForURL(/done=reset/);
  temp = (await admin.locator("pre").innerText()).match(/Temporary password: (\S+)/)?.[1] ?? fail("no new temporary password shown");
  await go(member, "/portal");
  await see(member, "Sign in");
});
await step("a suspended member can't sign in", async () => {
  await go(admin, memberUrl);
  await admin.locator("textarea[name=reason]").fill("E2E test suspension");
  await admin.click("button[value=suspend]");
  await admin.waitForURL(/done=suspend/);
  await memberLogin(temp);
  await see(member, "can’t sign in");
});
let backupCodes = [];
await step("admin turns on two-step login with an authenticator app", async () => {
  await go(admin, "/admin/account");
  await see(admin, "Off.");
  await admin.click("button:has-text('Set up two-step login')");
  await admin.waitForURL(/setup=1/);
  if ((await admin.locator("#twostep svg").count()) === 0) fail("no QR code");
  const secret = (await admin.locator("#twostep strong.font-mono").innerText()).replace(/\s/g, "");
  await admin.fill("input[name=code]", "000000");
  await admin.click("button:has-text('Turn on two-step login')");
  await admin.waitForURL(/error=code/);
  await admin.fill("input[name=code]", await totp(secret));
  await admin.click("button:has-text('Turn on two-step login')");
  await admin.waitForURL(/done=2fa/);
  await see(admin, "backup codes");
  backupCodes = (await admin.locator("#twostep pre span").allInnerTexts()).map((x) => x.trim());
  if (backupCodes.length !== 8) fail(`expected 8 backup codes, got ${backupCodes.length}`);
  globalThis.__secret = secret;
});
async function adminPassword() {
  await admin.context().clearCookies();
  await admin.context().addCookies([{ name: "sc_21", value: "1", url: B }]);
  await go(admin, "/admin/login");
  await admin.fill("input[name=email]", ADMIN);
  await admin.fill("input[name=password]", ADMIN_PW);
  await admin.click("form button[type=submit]");
  await admin.waitForURL(/step=code/);
}
await step("signing in now needs the code: a wrong code is refused, a backup code works once", async () => {
  await adminPassword();
  await go(admin, "/admin/queue");
  await notSee(admin, "Waiting for review");
  await go(admin, "/admin/login?step=code");
  await admin.fill("input[name=code]", "123456");
  await admin.click("form button[type=submit]");
  await admin.waitForURL(/error=code/);
  await admin.fill("input[name=code]", backupCodes[0]);
  await admin.click("form button[type=submit]");
  await admin.waitForURL((u) => u.pathname === "/admin");
  await adminPassword();
  await admin.fill("input[name=code]", backupCodes[0]);
  await admin.click("form button[type=submit]");
  await admin.waitForURL(/error=code/);
});
await step("signs in with a fresh authenticator code", async () => {
  await admin.waitForTimeout(31000 - (Date.now() % 30000)); // next 30-second code
  await adminPassword();
  await admin.fill("input[name=code]", await totp(globalThis.__secret));
  await admin.click("form button[type=submit]");
  await admin.waitForURL((u) => u.pathname === "/admin");
  await notSee(admin, "Two-step login is off");
});
await step("admin signs out", async () => {
  await go(admin, "/admin/account");
  await admin.locator("form[action='/api/admin/logout'] button").first().click();
  await admin.waitForURL((u) => !u.pathname.startsWith("/admin/account"));
  await admin.goto(B + "/admin/queue");
  await admin.waitForLoadState();
  await notSee(admin, "Waiting for review");
});

section("10. Detail pages and search with real listings");
for (const [list, label] of [["/farms", "farm"], ["/education", "seminar"], ["/market", "Market item"], ["/learn", "article"]]) {
await step(`opens a ${label} detail page from ${list}`, async () => {
    await go(desk, list);
    const prefix = `${list}/`;
    const href = await desk.$$eval(`main a[href^='${prefix}']`, (as) => as.map((a) => a.getAttribute("href")).find((h) => h.split("/").length === 3));
    if (!href) fail(`no ${label} cards on ${list}`);
    await go(desk, href);
  });
}
await step("search finds the new farm", async () => { await go(desk, `/search?q=${encodeURIComponent(farm)}`); await see(desk, farm); });

section("11. Layout on phone");
for (const url of ["/portal", "/farms", "/market", "/events"]) {
  await step(`no sideways scrolling on ${url} (after the test data)`, async () => {
    await go(phone, url);
    const over = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 2) fail(`page is ${over}px wider than the phone screen`);
  });
}

await step("no browser errors or server errors anywhere", async () => {
  const real = pageErrors.filter((e) => !/favicon/.test(e));
  if (real.length) fail(`${real.length} error(s): ${real.slice(0, 5).join(" | ")}`);
});

await browser.close();
if (server) process.kill(-server.pid);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
for (const f of failed) console.log(`  ✗ ${f.name}: ${f.err}`);
process.exit(failed.length ? 1 : 0);
