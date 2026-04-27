var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// falkor-pro-v5-fixed.js
var USERS = {
  paddy: { pw: "asgard2026", name: "Paddy", full: "Paddy Gallivan", role: "owner", color: "#f59e0b" },
  jacky: { pw: "asgard2026", name: "Jacky", full: "Jacky", role: "owner", color: "#a855f7" }
};
var PERSONAS = {
  default: { name: "Falkor", emoji: "\u{1F409}", tag: "Your luckdragon", sys: "You are Falkor, a luckdragon helping Paddy & Jacky Gallivan run their Asgard ecosystem. Warm, witty, direct." },
  coder: { name: "Dev Falkor", emoji: "\u{1F4BB}", tag: "Production code", sys: "You are Dev Falkor. Stack: Cloudflare Workers, D1, React." },
  teacher: { name: "PE Coach", emoji: "\u{1F3C3}", tag: "F-6 PE expert", sys: "You are PE Coach Falkor for Williamstown Primary F-6. Victorian Curriculum aligned." },
  trivia: { name: "KBT Host", emoji: "\u{1F3A4}", tag: "Trivia master", sys: "You are Kow Brainer Trivia host. Witty, cheeky Aussie pub trivia." },
  planner: { name: "Strategist", emoji: "\u{1F3AF}", tag: "Thinks in systems", sys: "Strategic Falkor. First-principles breakdown, ruthless prioritization." },
  family: { name: "Comp Manager", emoji: "\u{1F3C6}", tag: "Family comps", sys: "You run Gallivan family comps (AFL, racing, golf). Competitive, personal, fun." },
  writer: { name: "Wordsmith", emoji: "\u270D\uFE0F", tag: "Clean copy", sys: "Clean, punchy writing. No corporate speak. Australian English." }
};
var DEFAULT_PROJECTS = [
  { id: "lessonlab", name: "Lesson Lab", emoji: "\u{1F3C3}", status: "live", cat: "school", desc: "931 PE lessons, F-6 curriculum-aligned" },
  { id: "kbt", name: "Kow Brainer Trivia", emoji: "\u{1F3A4}", status: "active", cat: "business", desc: "Pub trivia events, questions, scoring" },
  { id: "school-sport", name: "School Sport Portal", emoji: "\u{1F3C6}", status: "active", cat: "school", desc: "Victoria interschool sport" },
  { id: "footy-tips", name: "Footy Tips", emoji: "\u{1F3C9}", status: "active", cat: "family", desc: "AFL tipping with family" },
  { id: "race-tipping", name: "Race Tipping", emoji: "\u{1F3C7}", status: "active", cat: "family", desc: "Horse racing tips, standings, payouts" },
  { id: "superleague", name: "Superleague", emoji: "\u26A1", status: "active", cat: "family", desc: "Fantasy AFL mates league" },
  { id: "asgard-hub", name: "Asgard Project Hub", emoji: "\u{1F3F0}", status: "live", cat: "infra", desc: "Central command - 47+ projects" },
  { id: "thor", name: "Thor", emoji: "\u26A1", status: "live", cat: "infra", desc: "Autonomous orchestrator" },
  { id: "teddy", name: "Teddy", emoji: "\u{1F6E1}\uFE0F", status: "live", cat: "infra", desc: "Gatekeeper" },
  { id: "kbt-integration", name: "KBT Integration", emoji: "\u{1F3A4}", status: "live", cat: "infra", desc: "Live KBT data sync" },
  { id: "family-comp", name: "Family Comp Manager", emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}", status: "live", cat: "infra", desc: "Tracks all family comps" },
  { id: "school-mgr", name: "School Manager", emoji: "\u{1F4DA}", status: "live", cat: "infra", desc: "PE lessons + carnivals" }
];
var json = /* @__PURE__ */ __name((d, s = 200) => new Response(JSON.stringify(d), {
  status: s,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" }
}), "json");
function auth(req) {
  const h = req.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return null;
  try {
    const [u, t] = atob(h.substring(7)).split(":");
    if (USERS[u] && Date.now() - parseInt(t) < 30 * 86400 * 1e3) return { u, user: USERS[u] };
  } catch {
  }
  return null;
}
__name(auth, "auth");
async function proxyToKBT(path, opts = {}, env) {
  if (!env.KBT) return { error: "KBT binding not configured" };
  try {
    const res = await env.KBT.fetch(new Request("https://kbt-integration.pgallivan.workers.dev" + path, opts));
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}
__name(proxyToKBT, "proxyToKBT");
async function proxyToComp(path, opts = {}, env) {
  if (!env.COMP) return { error: "COMP binding not configured" };
  try {
    const res = await env.COMP.fetch(new Request("https://family-comp-manager.pgallivan.workers.dev" + path, opts));
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}
__name(proxyToComp, "proxyToComp");
async function proxyToSchool(path, opts = {}, env) {
  if (!env.SCHOOL) return { error: "SCHOOL binding not configured" };
  try {
    const res = await env.SCHOOL.fetch(new Request("https://school-manager.pgallivan.workers.dev" + path, opts));
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}
__name(proxyToSchool, "proxyToSchool");
async function handle(req, env) {
  const url = new URL(req.url);
  const p = url.pathname;
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*" } });
  if (p === "/health") return json({ status: "ok", v: "5.1-service-bindings", ts: Date.now() });
  if (p === "/api/login") return doLogin(req);
  if (p === "/api/projects") return doKV(req, env, "projects", DEFAULT_PROJECTS);
  if (p === "/api/personas") return json({ personas: Object.entries(PERSONAS).map(([id, x]) => ({ id, name: x.name, emoji: x.emoji, tag: x.tag })) });
  if (p === "/api/kbt/today") return json(await proxyToKBT("/kbt/today", {}, env));
  if (p.startsWith("/api/kbt/standings/")) return json(await proxyToKBT(p.substring(9), {}, env));
  if (p.startsWith("/api/kbt/my-bets/")) return json(await proxyToKBT(p.substring(8), {}, env));
  if (p === "/api/kbt/submit-bet" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToKBT("/kbt/submit-bet", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p === "/api/kbt/events") return json(await proxyToKBT("/kbt/events", {}, env));
  if (p.startsWith("/api/kbt/questions/")) return json(await proxyToKBT(p.substring(9), {}, env));
  if (p === "/api/kbt/sync") return json(await proxyToKBT("/sync", {}, env));
  if (p === "/api/comp/create" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToComp("/comp/create", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p === "/api/comp/submit-tips" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToComp("/comp/submit-tips", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p.startsWith("/api/comp/standings/")) return json(await proxyToComp(p.substring(9), {}, env));
  if (p.startsWith("/api/comp/payouts/")) return json(await proxyToComp(p.substring(8), {}, env));
  if (p.startsWith("/api/comp/trash-talk/")) return json(await proxyToComp(p.substring(11), {}, env));
  if (p === "/api/comp/post-trash" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToComp("/comp/post-trash", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p.startsWith("/api/comp/my-tips/")) return json(await proxyToComp(p.substring(9), {}, env));
  if (p === "/api/school/create-lesson" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToSchool("/school/create-lesson", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p === "/api/school/lessons-this-week") return json(await proxyToSchool("/school/lessons-this-week", {}, env));
  if (p === "/api/school/carnivals-upcoming") return json(await proxyToSchool("/school/carnivals-upcoming", {}, env));
  if (p === "/api/school/create-carnival" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToSchool("/school/create-carnival", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p === "/api/school/create-team" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToSchool("/school/create-team", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p === "/api/school/register-student" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToSchool("/school/register-student", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p.startsWith("/api/school/teams/")) return json(await proxyToSchool(p.substring(9), {}, env));
  if (p.startsWith("/api/school/registrations/")) return json(await proxyToSchool(p.substring(16), {}, env));
  if (p === "/api/school/submit-result" && req.method === "POST") {
    const body = await req.json();
    return json(await proxyToSchool("/school/submit-result", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, env));
  }
  if (p.startsWith("/api/school/results/")) return json(await proxyToSchool(p.substring(10), {}, env));
  return json({ ok: true, msg: "Falkor Portal v5.1 \u2014 Service Bindings Live" });
}
__name(handle, "handle");
async function doLogin(req) {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const { username, password } = await req.json();
  const u = username?.toLowerCase().trim();
  const user = USERS[u];
  if (!user || user.pw !== password) return json({ error: "Wrong username or password" }, 401);
  return json({
    token: btoa(`${u}:${Date.now()}`),
    user: { u, name: user.name, full: user.full, role: user.role, color: user.color }
  });
}
__name(doLogin, "doLogin");
async function doKV(req, env, kind, def) {
  const a = auth(req);
  if (!a) return json({ error: "Unauthorized" }, 401);
  if (!env.FALKOR_KV) return json({ [kind]: def });
  const key = `${kind}:${a.u}`;
  if (req.method === "GET") {
    const d = await env.FALKOR_KV.get(key);
    return json({ [kind]: d ? JSON.parse(d) : def });
  }
  if (req.method === "POST") {
    const body = await req.json();
    await env.FALKOR_KV.put(key, JSON.stringify(body[kind] || def));
    return json({ ok: true });
  }
  return json({ error: "405" }, 405);
}
__name(doKV, "doKV");
var falkor_pro_v5_fixed_default = {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
export {
  falkor_pro_v5_fixed_default as default
};
//# sourceMappingURL=falkor-pro-v5-fixed.js.map