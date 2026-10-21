#!/usr/bin/env node
/* Motion Prompt skill CLI · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
// Traditional Chinese edition: https://github.com/TTMoon1030/motion-prompt (zh-Hant is the default language).
// Node 18+, no dependencies. Reads the static Motion Prompt API (api/v1) and prints what an agent needs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const VERSION = '0.1.0';
const SITE = 'https://ttmoon1030.github.io/motion-prompt/';
const REMOTES = [
  'https://ttmoon1030.github.io/motion-prompt/api/v1',
  'https://raw.githubusercontent.com/TTMoon1030/motion-prompt/main/api/v1',
];
const LANGS = ['zh-Hant', 'ja', 'en'];
const DEFAULT_LANG = 'zh-Hant';
const LANG_ALIAS = { 'zh-hant': 'zh-Hant', zh: 'zh-Hant', 'zh-tw': 'zh-Hant', 'zh-hk': 'zh-Hant', tw: 'zh-Hant', ja: 'ja', jp: 'ja', en: 'en' };
const MAX_GET = 8;
const EXIT = { OK: 0, NOT_FOUND: 1, USAGE: 2, NETWORK: 3, TIMEOUT: 4 };
const PICK_TIMEOUT = 900; // seconds
const PICK_MAX = 60;
const NOTE_MAX = 1000;
const SELF = fileURLToPath(import.meta.url);
const ENV = process.env;

class CliError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ---------- arguments ----------

const VALUE_FLAGS = new Set(['lang', 'pack', 'limit', 'out', 'timeout']);
const BOOL_FLAGS = new Set(['refresh', 'help', 'version', 'no-open', 'local', 'remote']);

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    if (BOOL_FLAGS.has(name)) { flags[name] = true; continue; }
    if (!VALUE_FLAGS.has(name)) throw new CliError(EXIT.USAGE, `不認得的選項 --${name}。請用 --help 查看用法。`);
    const value = eq === -1 ? argv[++i] : a.slice(eq + 1);
    if (value === undefined || value === '') throw new CliError(EXIT.USAGE, `選項 --${name} 需要一個值。`);
    flags[name] = value;
  }
  return { flags, command: rest[0], args: rest.slice(1) };
}

const HELP = `motion-prompt ${VERSION}（繁體中文版）— 給程式 AI 用的 Motion Prompt 名稱資料庫
${SITE}

用法: node motion-prompt.mjs <指令> [選項]

  pick                  開啟圖庫讓使用者挑選，並印出挑選結果   [--pack <包>]
                        [--timeout <秒數，預設 ${PICK_TIMEOUT}>] [--no-open] [--local | --remote]
  search <關鍵字...>    找出最符合的元素（中文、日文、英文都可以）   [--pack <包>] [--limit N]
  list                  各個包、分類和數量
  list --pack <包>      列出一個包裡的所有元素
  get <id> [<id>...]    印出規格與程式碼，一次最多 ${MAX_GET} 個（可寫 12、012、#012 或範例網址）
  prompt <id> [...]     單一元素可直接複製使用的提示詞
  kit <包>              這個包的元素共用的常數與輔助函式
  info                  資料來源、數量、版本、快取資料夾

選項:
  --lang zh-Hant|ja|en  名稱與文字的語言（預設 zh-Hant，也接受 zh、zh-TW；搜尋字含日文假名時自動改用 ja）
  --out <資料夾>        把檔案寫進資料夾，而不是印出來（get、prompt、kit）
  --refresh             不使用磁碟快取
  --no-open             pick：只印出圖庫網址，不自動開瀏覽器
  --local               pick：一定從這份完整的儲存庫在本機提供圖庫（有完整儲存庫時預設就是如此）
  --remote              pick：改用線上圖庫 ${SITE}
環境變數:
  MOTION_PROMPT_BASE    以逗號分隔的資料來源（資料夾路徑或網址），取代預設來源
  MOTION_PROMPT_CACHE   快取資料夾（預設 ~/.cache/motion-prompt，不行時用系統暫存資料夾）
  MOTION_PROMPT_TTL     快取的目錄多少秒後重新下載（預設 21600）
結束代碼: 0 成功 · 1 找不到 · 2 用法錯誤 · 3 連不到任何資料來源 · 4 pick 等待逾時`;

// ---------- data sources ----------

const isUrl = (s) => /^https?:\/\//i.test(s);

function localRepoBase() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..', 'api', 'v1');
  return fs.existsSync(path.join(dir, 'catalog.json')) ? dir : null;
}

function resolveSources() {
  const env = (ENV.MOTION_PROMPT_BASE || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (env.length) return { origin: 'MOTION_PROMPT_BASE', bases: env.map((s) => (isUrl(s) ? s.replace(/\/+$/, '') : path.resolve(s))) };
  const local = localRepoBase();
  if (local) return { origin: 'local clone', bases: [local] };
  return { origin: 'default', bases: REMOTES };
}

function cacheRoots() {
  const roots = [];
  if (ENV.MOTION_PROMPT_CACHE) roots.push(path.resolve(ENV.MOTION_PROMPT_CACHE));
  else {
    try { roots.push(path.join(os.homedir(), '.cache', 'motion-prompt')); } catch { /* no home folder */ }
    roots.push(path.join(os.tmpdir(), 'motion-prompt-cache'));
  }
  return roots;
}

class Store {
  constructor({ refresh }) {
    const { origin, bases } = resolveSources();
    this.origin = origin;
    this.bases = bases;
    this.refresh = !!refresh;
    this.remote = bases.some(isUrl);
    this.key = crypto.createHash('sha1').update(bases.join('|')).digest('hex').slice(0, 10);
    this.ttl = Math.max(0, Number(ENV.MOTION_PROMPT_TTL ?? 21600)) * 1000;
    this.cacheRoot = null;
    this.usedBase = null;
    this.fromCache = false;
    this.failures = [];
    this.catalog = null;
  }

  cacheDir() { return this.cacheRoot || path.join(cacheRoots()[0], this.key); }

  cacheRead(rel) {
    if (!this.remote) return null;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        const stat = fs.statSync(file);
        this.cacheRoot = path.join(root, this.key);
        return { text: fs.readFileSync(file, 'utf8'), age: Date.now() - stat.mtimeMs };
      } catch { /* try the next cache folder */ }
    }
    return null;
  }

  cacheWrite(rel, text) {
    if (!this.remote) return;
    for (const root of cacheRoots()) {
      const file = path.join(root, this.key, rel);
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
        this.cacheRoot = path.join(root, this.key);
        return;
      } catch { /* read-only place: try the next one, or run without a cache */ }
    }
  }

  // Returns { text } on success, { missing: true } when every source answered "no such file",
  // or { down: true } when no source could be reached at all.
  async readSources(rel) {
    let missing = 0;
    for (const base of this.bases) {
      try {
        if (isUrl(base)) {
          const res = await fetch(`${base}/${rel}`, {
            headers: { 'User-Agent': `motion-prompt-skill/${VERSION}` },
            signal: AbortSignal.timeout(12000),
          });
          if (res.status === 404) { missing++; this.failures.push(`${base}/${rel} → HTTP 404`); continue; }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.usedBase = this.usedBase || base;
          return { text: await res.text(), base };
        }
        const file = path.join(base, rel);
        if (!fs.existsSync(file)) { missing++; continue; }
        this.usedBase = this.usedBase || base;
        return { text: fs.readFileSync(file, 'utf8'), base };
      } catch (err) {
        const cause = err && err.cause && (err.cause.code || err.cause.message);
        this.failures.push(`${base}/${rel} → ${cause || err.name || 'error'}${err.message ? ` (${err.message})` : ''}`);
      }
    }
    return missing === this.bases.length ? { missing: true } : { down: true };
  }

  async loadCatalog() {
    if (this.catalog) return this.catalog;
    const cached = this.refresh ? null : this.cacheRead('catalog.json');
    let text = null;
    if (cached && cached.age < this.ttl) { text = cached.text; this.fromCache = true; }
    if (text === null) {
      const got = await this.readSources('catalog.json');
      if (got.text !== undefined) { text = got.text; this.cacheWrite('catalog.json', text); }
      else {
        const stale = cached || this.cacheRead('catalog.json');
        if (stale) {
          text = stale.text; this.fromCache = true;
          process.stderr.write('motion-prompt: 連不到資料來源，改用快取的目錄。\n');
        } else throw this.unreachable('catalog.json', false); // no catalog anywhere = no usable source
      }
    }
    let data;
    try { data = JSON.parse(text); } catch { throw new CliError(EXIT.NETWORK, `來自 ${this.usedBase || '快取'} 的 catalog.json 不是有效的 JSON。`); }
    if (!data || !Array.isArray(data.elements)) throw new CliError(EXIT.NETWORK, 'catalog.json 裡沒有 "elements" 清單。');
    this.catalog = data;
    return data;
  }

  async file(rel) {
    const cat = await this.loadCatalog();
    const versioned = path.join('v', String(cat.version ?? '0').replace(/[^\w.-]/g, '_'), rel);
    if (!this.refresh) {
      const hit = this.cacheRead(versioned);
      if (hit) return hit.text;
    }
    const got = await this.readSources(rel);
    if (got.text !== undefined) { this.cacheWrite(versioned, got.text); return got.text; }
    const stale = this.cacheRead(versioned);
    if (stale) return stale.text;
    throw this.unreachable(rel, got.missing);
  }

  unreachable(rel, missing) {
    if (missing) return new CliError(EXIT.NOT_FOUND, `Motion Prompt 的資料裡找不到: ${rel}\n檢查過的來源:\n${this.bases.map((b) => `  ${b}`).join('\n')}`);
    const lines = [
      `motion-prompt: 連不到 Motion Prompt 的資料（${rel}），快取裡也沒有。`,
      '嘗試過:',
      ...this.failures.map((f) => `  ${f}`),
      this.failures.length && this.failures.every((f) => f.endsWith('HTTP 404'))
        ? '來源有回應，但都沒有這個檔案，資料可能還沒發布到這些網址（例如 GitHub Pages 尚未開啟）。\n如果手邊有 api/v1 的本機複本，請把 MOTION_PROMPT_BASE 指向它。'
        : this.remote
        ? '這個指令需要能用 HTTPS 連到 ttmoon1030.github.io 或 raw.githubusercontent.com。\n請允許這個指令使用網路後再執行一次，或把 MOTION_PROMPT_BASE 指向 api/v1 的本機複本。'
        : '請確認 MOTION_PROMPT_BASE 指向含有 catalog.json 的資料夾。',
    ];
    return new CliError(EXIT.NETWORK, lines.join('\n'));
  }
}

// ---------- catalog helpers ----------

const HAS_KANA = /[぀-ヿｦ-ﾟ]/;        // hiragana / katakana: the words are Japanese
const HAN_RUN = /^[㐀-鿿豈-﫿]{3,}$/;
const tx = (v, lang) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : String(v[lang] ?? v.en ?? v.ja ?? ''));
// Every language of a text field, for searching.
const both = (v) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : Object.values(v).map((x) => tx(x, 'en')).join(' '));
const packKey = (p) => String(p.pack ?? p.id ?? p.slug ?? p.name ?? '');
const pad = (n) => String(n).padStart(3, '0');
const demoUrl = (id) => `${SITE}#${id}`;

function packsOf(cat) {
  const listed = Array.isArray(cat.packs) ? cat.packs.map((p) => (typeof p === 'string' ? { pack: p } : p)) : [];
  const seen = new Set(listed.map(packKey));
  for (const e of cat.elements) if (!seen.has(e.pack)) { seen.add(e.pack); listed.push({ pack: e.pack }); }
  return listed;
}

function categoryLabel(cat, e, lang) {
  const p = packsOf(cat).find((x) => packKey(x) === e.pack);
  const c = p && Array.isArray(p.categories) ? p.categories.find((x) => x.slug === e.category) : null;
  if (!c) return { label: e.category || '', haystack: e.category || '' };
  return { label: tx(c, lang) || c.slug, haystack: `${c.slug} ${c.ja ?? ''} ${c.en ?? ''} ${c['zh-Hant'] ?? ''}` };
}

function requirePack(cat, name) {
  const wanted = String(name).toLowerCase();
  const found = packsOf(cat).find((p) => packKey(p).toLowerCase() === wanted);
  if (!found) throw new CliError(EXIT.NOT_FOUND, `沒有叫做「${name}」的包。現有的包: ${packsOf(cat).map(packKey).join(', ')}`);
  return packKey(found);
}

function parseId(token) {
  const m = /(?:^|#|\/)(\d{1,4})\/?$/.exec(String(token).trim());
  return m ? pad(Number(m[1])) : null;
}

function resolveIds(cat, tokens, max) {
  if (!tokens.length) throw new CliError(EXIT.USAGE, '請至少給一個元素編號，例如 12、#045 或範例網址。');
  const ids = [];
  const bad = [];
  for (const t of tokens) {
    const id = parseId(t);
    if (!id || !cat.elements.some((e) => e.id === id)) bad.push(t);
    else if (!ids.includes(id)) ids.push(id);
  }
  if (bad.length) {
    const all = cat.elements.map((e) => e.id);
    throw new CliError(EXIT.NOT_FOUND, `沒有這個元素: ${bad.join(', ')}。目錄共有 ${all.length} 個元素（#${all[0]}–#${all[all.length - 1]}）。請用 search 或 list 找編號，不要用猜的。`);
  }
  if (ids.length > max) throw new CliError(EXIT.USAGE, `編號太多（${ids.length} 個）。一次最多取 ${max} 個，而且只取真的會用到的。`);
  return ids;
}

function line(cat, e, lang) {
  return `#${e.id}  ${tx(e.name, lang)}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]  ${tx(e.summary, lang)}`;
}

// ---------- search ----------

function score(cat, e, tokens) {
  const name = both(e.name).toLowerCase();
  const names = Object.values(e.name || {}).map((s) => String(s).toLowerCase());
  const tags = (e.tags || []).map((t) => String(t).toLowerCase());
  const slug = String(e.slug || '').toLowerCase();
  const catHay = `${categoryLabel(cat, e, 'en').haystack} ${e.pack} ${both((packsOf(cat).find((p) => packKey(p) === e.pack) || {}).title)}`.toLowerCase();
  const summary = both(e.summary).toLowerCase();
  const deep = `${both(e.use)} ${both(e.spec)}`.toLowerCase();
  let total = 0;
  let matched = 0;
  for (const raw of tokens) {
    const forms = [raw];
    if (/^[a-z]{4,}s$/.test(raw)) forms.push(raw.slice(0, -1));
    // Chinese is written without spaces: "文字出現" also tries 文字 / 字出 / 出現 (weighted lower in the loop below).
    const grams = HAN_RUN.test(raw) ? [...raw].slice(0, -1).map((c, i) => c + raw[i + 1]) : [];
    let best = 0;
    for (const t of forms) {
      let s = 0;
      if (parseId(t) === e.id && /^#?\d+$/.test(t)) s += 20;
      if (names.includes(t)) s += 12; else if (name.includes(t)) s += 8;
      if (slug === t || slug.split('-').includes(t)) s += 6; else if (slug.includes(t)) s += 3;
      if (tags.includes(t)) s += 6; else if (tags.some((g) => g.includes(t))) s += 3;
      if (catHay.includes(t)) s += 3;
      if (summary.includes(t)) s += 2;
      if (deep.includes(t)) s += 1;
      best = Math.max(best, s);
    }
    if (!best && grams.length) {
      let hit = 0;
      let s = 0;
      for (const g of grams) {
        let gs = 0;
        if (name.includes(g)) gs = 4; else if (catHay.includes(g)) gs = 2; else if (summary.includes(g)) gs = 1; else if (deep.includes(g)) gs = 0.5;
        if (gs) { hit++; s += gs; }
      }
      if (hit * 2 >= grams.length) best = s / grams.length * 2;
    }
    if (best > 0) matched++;
    total += best;
  }
  return { matched, total };
}

// ---------- output ----------

function emit(files, outDir) {
  if (!outDir) { process.stdout.write(files.map((f) => f.text.replace(/\s*$/, '\n')).join('\n')); return; }
  const dir = path.resolve(outDir);
  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f.name), f.text);
  } catch (err) { throw new CliError(EXIT.USAGE, `Cannot write to ${dir}: ${err.message}`); }
  for (const f of files) console.log(path.join(dir, f.name));
}

// ---------- commands ----------

async function cmdSearch(store, args, flags, lang) {
  if (!args.length) throw new CliError(EXIT.USAGE, 'search 至少需要一個關鍵字，例如「search 打字機」「search 文字 出現」或「search typewriter」。');
  const cat = await store.loadCatalog();
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;
  const limit = Math.max(1, Math.min(50, Number(flags.limit) || 8));
  const tokens = args.join(' ').toLowerCase().split(/[\s,、　]+/).filter(Boolean);
  const hits = cat.elements
    .filter((e) => !pack || e.pack === pack)
    .map((e) => ({ e, ...score(cat, e, tokens) }))
    .filter((h) => h.matched > 0)
    .sort((a, b) => b.matched - a.matched || b.total - a.total || a.e.id.localeCompare(b.e.id));
  if (!hits.length) {
    console.log(`找不到符合「${args.join(' ')}」的元素${pack ? `（包 ${pack}）` : ''}。請換個關鍵字（英文標籤最容易命中），或用「list --pack <包>」瀏覽。`);
    return;
  }
  for (const h of hits.slice(0, limit)) console.log(line(cat, h.e, lang));
  if (hits.length > limit) console.log(`… 還有 ${hits.length - limit} 個。可用 --pack 縮小範圍，或提高 --limit。`);
  console.log(`\n下一步: 用 get <id> 取得程式碼與規格。範例: ${SITE}#<id>`);
}

async function cmdList(store, flags, lang) {
  const cat = await store.loadCatalog();
  if (flags.pack) {
    const pack = requirePack(cat, flags.pack);
    const items = cat.elements.filter((e) => e.pack === pack);
    let current = null;
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      if (label !== current) { console.log(`${current === null ? '' : '\n'}## ${label}`); current = label; }
      console.log(`#${e.id}  ${tx(e.name, lang)}  ${tx(e.summary, lang)}`);
    }
    return;
  }
  for (const p of packsOf(cat)) {
    const key = packKey(p);
    const items = cat.elements.filter((e) => e.pack === key);
    if (!items.length) continue;
    console.log(`${key}  (${items.length})  #${items[0].id}–#${items[items.length - 1].id}  ${tx(p.title, lang)}`);
    const counts = new Map();
    for (const e of items) {
      const label = categoryLabel(cat, e, lang).label;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    for (const [label, n] of counts) console.log(`  - ${label} (${n})`);
  }
  console.log(`\n共 ${cat.elements.length} 個元素。瀏覽單一個包: list --pack <包>`);
}

async function cmdGet(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) {
    const e = cat.elements.find((x) => x.id === id);
    files.push({ name: `${id}-${e.slug || 'element'}.txt`, text: await store.file(`${lang}/e/${id}.txt`) });
  }
  emit(files, flags.out);
  const kits = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  const note = `需要 kit: ${kits.join(', ')} — 使用這段程式碼前，每個包各執行一次「kit <包>」。`;
  if (flags.out) console.log(note); else process.stdout.write(`\n// ${note}\n`);
}

async function cmdPrompt(store, args, flags, lang) {
  const cat = await store.loadCatalog();
  const ids = resolveIds(cat, args, MAX_GET);
  const files = [];
  for (const id of ids) files.push({ name: `${id}-prompt.txt`, text: await store.file(`${lang}/p/${id}.txt`) });
  emit(files, flags.out);
}

async function cmdKit(store, args, flags) {
  if (args.length !== 1) throw new CliError(EXIT.USAGE, 'kit 需要剛好一個包名，例如「kit motion」。');
  const cat = await store.loadCatalog();
  const pack = requirePack(cat, args[0]);
  emit([{ name: `kit-${pack}.js`, text: await store.file(`kit/${pack}.js`) }], flags.out);
}

async function cmdInfo(store) {
  console.log(`motion-prompt 技能 ${VERSION}（繁體中文版，預設語言 ${DEFAULT_LANG}）`);
  console.log(`圖庫:           ${repoRoot() ? `本機（${repoRoot()}），線上: ${SITE}` : SITE}`);
  console.log(`資料來源（${{ default: '預設', 'local clone': '本機完整儲存庫', MOTION_PROMPT_BASE: 'MOTION_PROMPT_BASE' }[store.origin] || store.origin}）:`);
  for (const b of store.bases) console.log(`  ${b}`);
  let cat = null;
  let error = null;
  try { cat = await store.loadCatalog(); } catch (err) { error = err; }
  console.log(`快取資料夾:     ${store.remote ? store.cacheDir() : '（本機檔案不使用快取）'}`);
  if (!cat) { console.log('目錄:           無法取得'); throw error; }
  console.log(`使用中:         ${store.fromCache ? `磁碟快取${store.usedBase ? '' : '（未發出請求）'}` : store.usedBase}`);
  console.log(`目錄:           版本 ${cat.version ?? '?'} · ${cat.elements.length} 個元素`);
  for (const p of packsOf(cat)) {
    const n = cat.elements.filter((e) => e.pack === packKey(p)).length;
    if (n) console.log(`  ${packKey(p)}: ${n}`);
  }
  console.log(`Node:           ${process.version}`);
}

// ---------- pick: the user chooses in the gallery, the choice comes back here ----------
// A small HTTP server on 127.0.0.1 waits for one GET /?t=<token>&ids=012,045&note=…&lang=ja. The gallery sends it
// as a top-level navigation ("Send to AI"), because an https page may not fetch() from 127.0.0.1.

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.tsv': 'text/tab-separated-values; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

function repoRoot() {
  const dir = path.resolve(path.dirname(SELF), '..', '..', '..');
  return fs.existsSync(path.join(dir, 'index.html')) && fs.existsSync(path.join(dir, 'assets', 'site.js')) ? dir : null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(lang, title, body) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><link rel="icon" href="data:,"><title>${esc(title)} | Motion Prompt</title>
<style>body{margin:0;font:16px/1.7 system-ui,"Hiragino Sans","Yu Gothic",sans-serif;background:Canvas;color:CanvasText}
main{max-width:34em;margin:12vh auto;padding:0 16px}h1{font-size:24px;line-height:1.4;margin:0 0 8px}p{margin:0 0 12px}
ol{padding-left:1.4em;margin:16px 0}li{margin:2px 0}code{font-family:ui-monospace,Menlo,monospace;opacity:.7;margin-right:.5em}</style>
</head><body><main><h1>${esc(title)}</h1>${body}</main></body></html>`;
}

function send(res, status, html, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(html);
}

function serveStatic(root, pathname, req, res) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return send(res, 400, 'Bad request'); }
  if (rel.includes('\0') || /(^|\/)\./.test(rel)) return send(res, 404, 'Not found');
  let file = path.join(root, rel);
  if (file !== root && !file.startsWith(root + path.sep)) return send(res, 404, 'Not found');
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { /* answered below */ }
  // Resolve symbolic links and check again, so a link inside the clone cannot expose files outside it.
  try {
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(file);
    if (realFile !== realRoot && !realFile.startsWith(realRoot + path.sep)) return send(res, 404, 'Not found');
    file = realFile;
  } catch { return send(res, 404, 'Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}

function openBrowser(url) {
  let cmd;
  let args;
  const opts = { detached: true, stdio: 'ignore' };
  if (process.platform === 'darwin') { cmd = 'open'; args = [url]; }
  else if (process.platform === 'win32') { cmd = 'cmd'; args = ['/c', 'start', '""', `"${url}"`]; opts.windowsVerbatimArguments = true; }
  else { cmd = 'xdg-open'; args = [url]; }
  return new Promise((resolve) => {
    let child;
    try { child = spawn(cmd, args, opts); } catch { resolve(false); return; }
    child.once('error', () => resolve(false));
    child.once('spawn', () => { child.unref(); resolve(true); });
  });
}

const PICK_TEXT = {
  'zh-Hant': {
    done: '已交給 AI', close: '這個畫面可以關掉了。請回到 AI 那裡，告訴它要怎麼使用這些項目。',
    ignored: '目錄裡沒有的編號沒有送出: ', bad: '無法讀取選擇的內容',
    badBody: '請回到圖庫，再按一次「交給 AI」。AI 還在等待。',
    none: '選的編號都不在目錄裡', other: '這個接收網址屬於另一個請求',
    otherBody: '請從 AI 開啟的圖庫按「交給 AI」送出。',
  },
  ja: {
    done: 'AIに渡しました', close: 'この画面は閉じて大丈夫です。AIの画面に戻って、どう使うかを伝えてください。',
    ignored: 'カタログに無い番号は渡していません: ', bad: '選択を読み取れませんでした',
    badBody: 'ギャラリーに戻って、もう一度「AIに渡す」を押してください。AIはまだ待っています。',
    none: '選んだ番号がカタログにありませんでした', other: 'この受け口は別の依頼の物です',
    otherBody: 'AIが開いたギャラリーの「AIに渡す」から送ってください。',
  },
  en: {
    done: 'Sent to your AI', close: 'You can close this page. Go back to your AI and tell it how to use the picks.',
    ignored: 'Not in the catalog, so not sent: ', bad: 'The selection could not be read',
    badBody: 'Go back to the gallery and press "Send to AI" again. Your AI is still waiting.',
    none: 'None of the picked numbers is in the catalog', other: 'This address belongs to another request',
    otherBody: 'Send your picks with "Send to AI" in the gallery that your AI opened.',
  },
};

function waitForPick(server, { port, token, root, cat, flags, timeoutSec }) {
  const origin = `http://127.0.0.1:${port}`;
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      server.close();
      if (server.closeAllConnections) server.closeAllConnections();
      fn();
    };
    const timer = setTimeout(() => finish(() => reject(new CliError(EXIT.TIMEOUT,
      `motion-prompt: ${timeoutSec} 秒內沒有收到選擇，所以什麼都沒選。\n請問使用者是否還要挑選，要的話再執行一次 pick。`))), timeoutSec * 1000);

    server.on('request', (req, res) => {
      const host = String(req.headers.host || '').toLowerCase();
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 403, 'Forbidden'); // DNS rebinding
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
      let url;
      try { url = new URL(req.url, origin); } catch { return send(res, 400, 'Bad request'); }
      const q = url.searchParams;
      if (url.pathname === '/' && q.has('t')) {
        const lang = flags.lang || (LANGS.includes(q.get('lang')) ? q.get('lang') : DEFAULT_LANG);
        const T = PICK_TEXT[lang];
        const given = Buffer.from(String(q.get('t')));
        const want = Buffer.from(token);
        if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
          return send(res, 403, page(lang, T.other, `<p>${esc(T.otherBody)}</p>`));
        }
        if (req.method !== 'GET') return send(res, 405, 'Method not allowed', { Allow: 'GET' });
        const raw = String(q.get('ids') || '');
        if (!/^\d{3}(,\d{3})*$/.test(raw)) {
          process.stderr.write(`motion-prompt: 收到格式錯誤的編號（${JSON.stringify(raw.slice(0, 80))}），已拒絕，繼續等待。\n`);
          return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        }
        const ids = [...new Set(raw.split(','))];
        if (ids.length > PICK_MAX) return send(res, 400, page(lang, T.bad, `<p>${esc(T.badBody)}</p>`));
        const known = ids.filter((id) => cat.elements.some((e) => e.id === id));
        const unknown = ids.filter((id) => !known.includes(id));
        if (!known.length) {
          process.stderr.write(`motion-prompt: 收到的編號都不在目錄裡（${unknown.join(', ')}），已拒絕，繼續等待。\n`);
          return send(res, 400, page(lang, T.none, `<p>${esc(T.badBody)}</p>`));
        }
        const note = String(q.get('note') || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);
        const items = known.map((id) => {
          const e = cat.elements.find((x) => x.id === id);
          return `<li><code>#${id}</code>${esc(tx(e.name, lang))}</li>`;
        }).join('');
        const html = page(lang, T.done, `<p>${esc(T.close)}</p><ol>${items}</ol>${unknown.length ? `<p>${esc(T.ignored + unknown.map((u) => `#${u}`).join(', '))}</p>` : ''}`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'close' });
        res.end(html, () => finish(() => resolve({ ids: known, unknown, note, lang })));
        return;
      }
      if (root) return serveStatic(root, url.pathname, req, res);
      return send(res, 404, 'Not found');
    });
  });
}

const PICK_OUT = {
  'zh-Hant': {
    intro: (n) => `使用者在 Motion Prompt 圖庫依序選了以下 ${n} 個元素。`, note: '使用者的備註', none: '（無）',
    meaning: '它是什麼', ask: '對 AI 的說法範例', spec: '規格', demo: '範例', ignored: '已略過（不在目錄裡）',
    next: (ids, packs) => `下一步: 只用這些元素，不多也不少。執行「get ${ids}」取得程式碼（一次最多 ${MAX_GET} 個），並對每個包各執行一次「kit <包>」: ${packs}。`,
  },
  en: {
    intro: (n) => `The user picked ${n} element${n === 1 ? '' : 's'} in the Motion Prompt gallery, in this order.`, note: 'Note from the user', none: '(none)',
    meaning: 'Meaning', ask: 'How to ask', spec: 'Spec', demo: 'Demo', ignored: 'Ignored (not in the catalog)',
    next: (ids, packs) => `Next: use exactly these elements, no more and no fewer. Run "get ${ids}" for the code (at most ${MAX_GET} ids per call) and "kit <pack>" once for each of: ${packs}.`,
  },
};

function printPick(cat, { ids, unknown, note, lang }) {
  const T = PICK_OUT[lang] || PICK_OUT.en;
  const other = lang === 'en' ? 'ja' : 'en';
  const out = [T.intro(ids.length)];
  out.push(`${T.note}: ${note || T.none}`);
  out.push('');
  ids.forEach((id, i) => {
    const e = cat.elements.find((x) => x.id === id);
    const name = tx(e.name, lang);
    const alt = tx(e.name, other);
    out.push(`${i + 1}. #${e.id}  ${name}${alt && alt !== name ? ` / ${alt}` : ''}  [${e.pack} / ${categoryLabel(cat, e, lang).label}]`);
    if (e.meaning) out.push(`   ${T.meaning}: ${tx(e.meaning, lang)}`);
    if (e.ask) out.push(`   ${T.ask}: ${tx(e.ask, lang)}`);
    const spec = e.spec ? (Array.isArray(e.spec) ? e.spec : e.spec[lang] || e.spec.en || []) : [];
    if (spec.length) { out.push(`   ${T.spec}:`); for (const s of spec) out.push(`   - ${s}`); }
    out.push(`   ${T.demo}: ${demoUrl(e.id)}`);
    out.push('');
  });
  if (unknown.length) out.push(`${T.ignored}: ${unknown.map((u) => `#${u}`).join(', ')}`, '');
  const packs = [...new Set(ids.map((id) => cat.elements.find((x) => x.id === id).pack))];
  out.push(T.next(ids.join(' '), packs.join(', ')));
  process.stdout.write(`${out.join('\n')}\n`);
}

async function cmdPick(store, args, flags) {
  if (args.length) throw new CliError(EXIT.USAGE, 'pick 不接受編號或關鍵字。選項: --pack <包> --lang zh-Hant|ja|en --timeout <秒數> --no-open --local --remote');
  const timeoutSec = flags.timeout === undefined ? PICK_TIMEOUT : Number(flags.timeout);
  if (!Number.isFinite(timeoutSec) || timeoutSec < 1 || timeoutSec > 86400) throw new CliError(EXIT.USAGE, '--timeout 必須是 1 到 86400 之間的秒數。');
  if (flags.local && flags.remote) throw new CliError(EXIT.USAGE, '--local 和 --remote 只能擇一。');
  // With a full copy of the repository next to this script (a Claude Code plugin install or a git clone), serve the
  // gallery from it: that needs no hosted site and always matches the local data. --remote uses the hosted gallery.
  const root = flags.remote ? null : repoRoot();
  if (flags.local && !root) throw new CliError(EXIT.USAGE, '--local 需要完整的儲存庫（這支腳本往上三層要有 index.html 和 assets/）。不加 --local 就會使用線上圖庫。');
  const cat = await store.loadCatalog(); // fail before opening anything if there is no data
  const pack = flags.pack ? requirePack(cat, flags.pack) : null;

  const token = crypto.randomBytes(16).toString('hex');
  const server = http.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const q = new URLSearchParams({ cb: `${origin}/?t=${token}` });
  if (pack) q.set('pack', pack);
  if (flags.lang) q.set('lang', flags.lang);
  const galleryUrl = `${root ? `${origin}/` : SITE}?${q}`;
  const waiting = waitForPick(server, { port, token, root, cat, flags, timeoutSec });

  console.log(`圖庫: ${galleryUrl}`);
  if (flags['no-open']) console.log('沒有自動開啟（--no-open）。請用瀏覽器打開這個網址，或交給使用者打開。');
  else if (await openBrowser(galleryUrl)) console.log('已在預設瀏覽器開啟。如果沒有出現瀏覽器視窗，請自行打開上面的網址。');
  else console.log('無法從這裡開啟瀏覽器。請用瀏覽器打開上面的網址，或交給使用者打開。');
  console.log(`等待使用者挑選並按下「交給 AI」（最多 ${timeoutSec} 秒）…\n`);

  printPick(cat, await waiting);
}

// ---------- main ----------

async function main() {
  const { flags, command, args } = parseArgs(process.argv.slice(2));
  if (flags.version) { console.log(VERSION); return; }
  if (flags.help || !command || command === 'help') { console.log(HELP); return; }
  if (flags.lang) {
    const wanted = LANG_ALIAS[String(flags.lang).toLowerCase()];
    if (!wanted) throw new CliError(EXIT.USAGE, '--lang 必須是 zh-Hant、ja 或 en。');
    flags.lang = wanted;
  }
  const words = command === 'search' ? args.join(' ') : '';
  const lang = flags.lang || (HAS_KANA.test(words) ? 'ja' : DEFAULT_LANG);
  const store = new Store({ refresh: flags.refresh });
  switch (command) {
    case 'search': return cmdSearch(store, args, flags, lang);
    case 'list': return cmdList(store, flags, lang);
    case 'get': return cmdGet(store, args, flags, lang);
    case 'prompt': return cmdPrompt(store, args, flags, lang);
    case 'kit': return cmdKit(store, args, flags);
    case 'info': return cmdInfo(store);
    case 'pick': return cmdPick(store, args, flags);
    default: throw new CliError(EXIT.USAGE, `不認得的指令「${command}」。請用 --help 查看用法。`);
  }
}

main().catch((err) => {
  if (err instanceof CliError) { process.stderr.write(`${err.message}\n`); process.exitCode = err.code; return; }
  process.stderr.write(`motion-prompt: 發生非預期的錯誤: ${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
