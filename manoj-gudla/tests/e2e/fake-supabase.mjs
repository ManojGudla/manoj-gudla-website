/**
 * TEST ONLY — a minimal stand-in for the Supabase services this app uses,
 * backed by a real PostgreSQL database so Row-Level Security is enforced
 * exactly as written in the migrations.
 *
 * Implements just enough of:
 *   Auth     /auth/v1/token, /auth/v1/user, /auth/v1/logout
 *   REST     /rest/v1/<table> (select/filter/order/limit/count/single,
 *            insert/update/delete, one-level embeds), /rest/v1/rpc/<fn>
 *   Storage  upload, download, public read, remove
 *
 * It is NOT Supabase. It lets the end-to-end tests exercise the real app
 * code (sessions, cookies, server actions, RLS) without internet access.
 *
 * Usage: node tests/e2e/fake-supabase.mjs   (env: PORT, PGHOST, PGPORT, PGUSER, PGDATABASE, STORAGE_DIR)
 */
import { createServer } from "node:http";
import { createHmac, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import pg from "pg";

const PORT = Number(process.env.PORT ?? 54321);
const SECRET = "test-jwt-secret-not-for-production";
export const ANON_KEY = "test-anon-key-0123456789abcdef0123456789";
export const SERVICE_KEY = "test-service-key-0123456789abcdef01234567";
const STORAGE_DIR = process.env.STORAGE_DIR ?? "/var/tmp/fake-storage";
// Return DATE columns as "YYYY-MM-DD" strings, like PostgREST does.
pg.types.setTypeParser(1082, (v) => v);
const pool = new pg.Pool({ max: 8 });

// In-memory accounts for the test (email → {id, password}).
const users = new Map(JSON.parse(process.env.TEST_USERS ?? "[]").map((u) => [u.email, u]));

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(payload) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const sig = createHmac("sha256", SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
function verify(token) {
  const [h, b, s] = String(token).split(".");
  if (!h || !b || !s) return null;
  const sig = createHmac("sha256", SECRET).update(`${h}.${b}`).digest("base64url");
  if (sig !== s) return null;
  const p = JSON.parse(Buffer.from(b, "base64url").toString());
  if (p.exp * 1000 < Date.now()) return null;
  return p;
}
function session(u) {
  const now = Math.floor(Date.now() / 1000);
  const access = sign({ sub: u.id, email: u.email, role: "authenticated", aud: "authenticated", exp: now + 3600, iat: now });
  return {
    access_token: access,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: `r_${u.id}_${randomUUID()}`,
    user: userObj(u),
  };
}
const userObj = (u) => ({
  id: u.id,
  aud: "authenticated",
  role: "authenticated",
  email: u.email,
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
});

function who(req) {
  const auth = (req.headers.authorization ?? "").replace(/^Bearer /i, "");
  const apikey = req.headers.apikey ?? "";
  if (auth === SERVICE_KEY || apikey === SERVICE_KEY && !auth) return { role: "service_role", sub: "" };
  const claims = verify(auth);
  if (claims) return { role: "authenticated", sub: claims.sub };
  return { role: "anon", sub: "" };
}

async function asRole(ctx, fn) {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query(`set local role ${ctx.role}`);
    await c.query("select set_config('request.jwt.claim.sub', $1, true)", [ctx.sub]);
    const r = await fn(c);
    await c.query("commit");
    return r;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

const ident = (s) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(s)) throw Object.assign(new Error(`bad identifier ${s}`), { code: "PGRST100" });
  return `"${s}"`;
};

function splitTop(s) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseSelect(sel) {
  const cols = [], embeds = [];
  for (const part of splitTop((sel ?? "*").replace(/\s+/g, ""))) {
    const m = part.match(/^([a-z_]+)\((.*)\)$/i);
    if (m) embeds.push({ table: m[1], cols: m[2].split(",").filter(Boolean) });
    else cols.push(part);
  }
  return { cols, embeds };
}

const EMBED_FK = { media_assets: "media_id" };

function buildWhere(params, values) {
  const clauses = [];
  for (const [k, v] of params) {
    if (["select", "order", "limit", "offset", "columns", "on_conflict"].includes(k)) continue;
    const m = v.match(/^(not\.)?(eq|neq|gt|gte|lt|lte|in|is)\.(.*)$/s);
    if (!m) continue;
    const [, not, op, raw] = m;
    let sql;
    if (op === "in") {
      const items = raw.replace(/^\(|\)$/g, "").split(",").map((x) => x.replace(/^"|"$/g, ""));
      values.push(items);
      sql = `${ident(k)}::text = any($${values.length}::text[])`;
    } else if (op === "is") {
      sql = `${ident(k)} is ${raw === "null" ? "null" : raw === "true" ? "true" : "false"}`;
    } else {
      values.push(raw);
      const sym = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" }[op];
      sql = `${ident(k)} ${sym} $${values.length}`;
    }
    clauses.push(not ? `not (${sql})` : sql);
  }
  return clauses.length ? ` where ${clauses.join(" and ")}` : "";
}

function buildOrder(order) {
  if (!order) return "";
  return " order by " + order.split(",").map((o) => {
    const [col, dir, nulls] = o.split(".");
    return `${ident(col)} ${dir === "desc" ? "desc" : "asc"}${nulls === "nullslast" ? " nulls last" : nulls === "nullsfirst" ? " nulls first" : ""}`;
  }).join(", ");
}

const colList = (cols) => (cols.length === 0 || cols.includes("*") ? "*" : cols.map(ident).join(", "));

async function addEmbeds(c, rows, embeds) {
  for (const e of embeds) {
    const fk = EMBED_FK[e.table];
    for (const r of rows) {
      const { rows: er } = await c.query(`select ${colList(e.cols)} from public.${ident(e.table)} where id = $1`, [r[fk]]);
      r[e.table] = er[0] ?? null;
    }
  }
  return rows;
}

function pgError(res, e) {
  const status = e.code === "42501" ? 403 : e.code === "PGRST116" ? 406 : e.code?.startsWith("P0") ? 400 : 400;
  send(res, status, { code: e.code ?? "XX000", message: e.message, details: e.detail ?? null, hint: e.hint ?? null });
}

function send(res, status, body, headers = {}) {
  const h = { "content-type": "application/json", ...cors(), ...headers };
  res.writeHead(status, h);
  res.end(body === undefined ? "" : typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
const cors = () => ({
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-upsert, prefer, accept, accept-profile, content-profile, cache-control, x-supabase-api-version",
  "access-control-allow-methods": "GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS",
  "access-control-expose-headers": "content-range",
});

async function readBody(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  return Buffer.concat(chunks);
}

async function rest(req, res, url, ctx) {
  const parts = url.pathname.replace(/^\/rest\/v1\//, "").split("/");
  const params = [...url.searchParams.entries()];
  const prefer = req.headers.prefer ?? "";
  const single = (req.headers.accept ?? "").includes("vnd.pgrst.object");
  const body = ["POST", "PATCH"].includes(req.method) ? (await readBody(req)).toString() : "";
  const json = body ? JSON.parse(body) : null;

  if (parts[0] === "rpc") {
    const fn = ident(parts[1]);
    const args = Object.entries(json ?? {});
    const values = args.map(([, v]) => v);
    const sql = `select public.${fn}(${args.map(([k], i) => `${ident(k)} := $${i + 1}`).join(", ")}) as r`;
    const out = await asRole(ctx, (c) => c.query(sql, values));
    const v = out.rows[0]?.r;
    return v === null || v === undefined ? send(res, 204) : send(res, 200, JSON.stringify(v));
  }

  const table = `public.${ident(parts[0])}`;
  const { cols, embeds } = parseSelect(url.searchParams.get("select"));
  const values = [];
  const where = buildWhere(params, values);

  const finish = async (c, rows, total) => {
    rows = await addEmbeds(c, rows, embeds);
    const headers = {};
    if (prefer.includes("count=exact")) headers["content-range"] = `0-${Math.max(0, rows.length - 1)}/${total ?? rows.length}`;
    if (single) {
      if (rows.length !== 1) throw Object.assign(new Error("JSON object requested, multiple (or no) rows returned"), { code: "PGRST116", detail: `The result contains ${rows.length} rows` });
      return [rows[0], headers];
    }
    return [rows, headers];
  };

  if (req.method === "GET" || req.method === "HEAD") {
    const limit = url.searchParams.get("limit");
    const sql = `select ${colList(cols)} from ${table}${where}${buildOrder(url.searchParams.get("order"))}${limit ? ` limit ${Number(limit)}` : ""}`;
    const [data, headers] = await asRole(ctx, async (c) => {
      const { rows } = await c.query(sql, values);
      let total;
      if (prefer.includes("count=exact")) {
        total = Number((await c.query(`select count(*) from ${table}${where}`, values)).rows[0].count);
      }
      return finish(c, rows, total);
    });
    return req.method === "HEAD" ? send(res, 200, undefined, headers) : send(res, 200, data, headers);
  }

  const wantRows = prefer.includes("return=representation");
  if (req.method === "POST") {
    const rowsIn = Array.isArray(json) ? json : [json];
    const out = await asRole(ctx, async (c) => {
      const result = [];
      for (const r of rowsIn) {
        const keys = Object.keys(r);
        const vals = keys.map((k) => r[k]);
        const { rows } = await c.query(
          `insert into ${table} (${keys.map(ident).join(", ")}) values (${keys.map((_, i) => `$${i + 1}`).join(", ")}) returning ${colList(cols)}`,
          vals,
        );
        result.push(...rows);
      }
      return wantRows ? finish(c, result) : [null, {}];
    });
    return wantRows ? send(res, 201, out[0], out[1]) : send(res, 201);
  }
  if (req.method === "PATCH") {
    const keys = Object.keys(json ?? {});
    const setVals = keys.map((k) => json[k]);
    const offset = values.length;
    const sql = `update ${table} set ${keys.map((k, i) => `${ident(k)} = $${offset + i + 1}`).join(", ")}${where} returning ${colList(cols)}`;
    const out = await asRole(ctx, async (c) => {
      const { rows } = await c.query(sql, [...values, ...setVals]);
      return wantRows ? finish(c, rows) : [null, {}];
    });
    return wantRows ? send(res, 200, out[0], out[1]) : send(res, 204);
  }
  if (req.method === "DELETE") {
    await asRole(ctx, (c) => c.query(`delete from ${table}${where}`, values));
    return send(res, 204);
  }
  send(res, 405, { message: "method not allowed" });
}

async function storage(req, res, url, ctx) {
  const p = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\//, ""));
  let m;
  if ((m = p.match(/^object\/public\/([^/]+)\/(.+)$/)) && req.method === "GET") {
    const [, bucket, name] = m;
    const pub = await asRole({ role: "postgres", sub: "" }, (c) => c.query("select public from storage.buckets where id = $1", [bucket]));
    const file = join(STORAGE_DIR, bucket, name);
    if (!pub.rows[0]?.public || !existsSync(file)) return send(res, 404, { message: "not found" });
    const meta = JSON.parse(readFileSync(`${file}.meta`, "utf8"));
    res.writeHead(200, { "content-type": meta.type, "cache-control": "public, max-age=60", ...cors() });
    return res.end(readFileSync(file));
  }
  if ((m = p.match(/^object\/(?:authenticated\/)?([^/]+)\/(.+)$/)) && req.method === "GET") {
    const [, bucket, name] = m;
    const ok = await asRole(ctx, (c) => c.query("select 1 from storage.objects where bucket_id = $1 and name = $2", [bucket, name]));
    const file = join(STORAGE_DIR, bucket, name);
    if (!ok.rowCount || !existsSync(file)) return send(res, 400, { statusCode: "404", error: "not_found", message: "Object not found" });
    const meta = JSON.parse(readFileSync(`${file}.meta`, "utf8"));
    res.writeHead(200, { "content-type": meta.type, ...cors() });
    return res.end(readFileSync(file));
  }
  if ((m = p.match(/^object\/([^/]+)\/(.+)$/)) && (req.method === "POST" || req.method === "PUT")) {
    const [, bucket, name] = m;
    const raw = await readBody(req);
    let bytes = raw, type = req.headers["content-type"] ?? "application/octet-stream";
    if (type.startsWith("multipart/form-data")) {
      const fd = await new Request("http://x", { method: "POST", headers: { "content-type": type }, body: raw }).formData();
      const f = [...fd.values()].find((v) => typeof v === "object");
      bytes = Buffer.from(await f.arrayBuffer());
      type = f.type || "application/octet-stream";
    }
    const b = await asRole({ role: "postgres", sub: "" }, (c) => c.query("select * from storage.buckets where id = $1", [bucket]));
    const bk = b.rows[0];
    if (!bk) return send(res, 400, { statusCode: "404", error: "Bucket not found", message: "Bucket not found" });
    if (bk.allowed_mime_types && !bk.allowed_mime_types.includes(type)) return send(res, 400, { statusCode: "415", error: "invalid_mime_type", message: `mime type ${type} is not supported` });
    if (bk.file_size_limit && bytes.length > bk.file_size_limit) return send(res, 400, { statusCode: "413", error: "Payload too large", message: "The object exceeded the maximum allowed size" });
    try {
      await asRole(ctx, (c) => c.query("insert into storage.objects (bucket_id, name, owner) values ($1, $2, nullif($3,'')::uuid)", [bucket, name, ctx.sub]));
    } catch (e) {
      return send(res, 400, { statusCode: "403", error: "Unauthorized", message: "new row violates row-level security policy" });
    }
    const file = join(STORAGE_DIR, bucket, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    writeFileSync(`${file}.meta`, JSON.stringify({ type }));
    return send(res, 200, { Key: `${bucket}/${name}`, Id: randomUUID() });
  }
  if ((m = p.match(/^object\/([^/]+)$/)) && req.method === "DELETE") {
    const bucket = m[1];
    const { prefixes = [] } = JSON.parse((await readBody(req)).toString() || "{}");
    const out = await asRole(ctx, (c) =>
      c.query("delete from storage.objects where bucket_id = $1 and name = any($2::text[]) returning name", [bucket, prefixes]),
    );
    for (const r of out.rows) rmSync(join(STORAGE_DIR, bucket, r.name), { force: true });
    return send(res, 200, out.rows.map((r) => ({ name: r.name, bucket_id: bucket })));
  }
  send(res, 404, { message: `unhandled storage route ${req.method} ${p}` });
}

async function auth(req, res, url) {
  const route = url.pathname.replace(/^\/auth\/v1\//, "");
  if (route === "token" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const grant = url.searchParams.get("grant_type");
    if (grant === "password") {
      const u = users.get(String(body.email).toLowerCase());
      if (!u || u.password !== body.password) return send(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials", code: "invalid_credentials", msg: "Invalid login credentials" });
      return send(res, 200, session(u));
    }
    if (grant === "refresh_token") {
      const id = String(body.refresh_token ?? "").split("_")[1];
      const u = [...users.values()].find((x) => x.id === id);
      if (!u) return send(res, 400, { error: "invalid_grant", code: "refresh_token_not_found", msg: "Invalid Refresh Token" });
      return send(res, 200, session(u));
    }
  }
  if (route === "user" && req.method === "GET") {
    const claims = verify((req.headers.authorization ?? "").replace(/^Bearer /i, ""));
    const u = claims && [...users.values()].find((x) => x.id === claims.sub);
    if (!u) return send(res, 401, { code: "bad_jwt", msg: "invalid JWT" });
    return send(res, 200, userObj(u));
  }
  if (route === "logout") return send(res, 204);
  send(res, 404, { message: `unhandled auth route ${route}` });
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "OPTIONS") return send(res, 204);
  try {
    if (url.pathname.startsWith("/auth/v1/")) return await auth(req, res, url);
    const ctx = who(req);
    if (url.pathname.startsWith("/rest/v1/")) return await rest(req, res, url, ctx);
    if (url.pathname.startsWith("/storage/v1/")) return await storage(req, res, url, ctx);
    send(res, 404, { message: "not found" });
  } catch (e) {
    if (process.env.DEBUG) console.error(req.method, req.url, e);
    pgError(res, e);
  }
}).listen(PORT, () => console.log(`fake supabase on :${PORT}`));
