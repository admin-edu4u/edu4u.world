/**
 * Download /images/* from the legacy Laravel host into web/public/images.
 * Run from web/: node scripts/sync-legacy-images.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const PUBLIC_IMAGES = path.join(WEB_ROOT, "public", "images");

const ORIGIN = process.env.LEGACY_MEDIA_ORIGIN ?? "https://159.223.48.78";
const HOST = process.env.LEGACY_MEDIA_HOST ?? "edu4u.world";
const CONCURRENCY = Number(process.env.SYNC_CONCURRENCY ?? "12");

function loadDotEnvLocal() {
  const envPath = path.join(WEB_ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnvLocal();

function parseCsvList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function addPath(set, folder, filename) {
  if (!filename || filename.startsWith("http")) return;
  const clean = filename.replace(/^\/+/, "");
  if (clean.includes("/")) {
    set.add(clean);
    return;
  }
  set.add(`${folder}/${clean}`);
}

async function collectPathsFromDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("Supabase env missing; only syncing static asset paths from source.");
    return new Set();
  }

  const sb = createClient(url, key);
  const paths = new Set();

  const [
    blogs,
    universities,
    schools,
    banners,
    popups,
    careers,
    characters,
    events,
    scholarships,
    homeRows,
  ] = await Promise.all([
    sb.from("blogs").select("b_img"),
    sb.from("universities").select("u_logo,u_img"),
    sb.from("international_school").select("int_logo,int_img"),
    sb.from("banners").select("banner_img"),
    sb.from("pop_up").select("pu_img"),
    sb.from("careers").select("c_img,c_img_male,c_img_female"),
    sb.from("characters").select("c_img,c_img_male,c_img_female"),
    sb.from("events").select("e_img"),
    sb.from("scholarships").select("s_c_logo"),
    sb.from("home").select("h_img"),
  ]);

  for (const row of blogs.data ?? []) addPath(paths, "blogs", row.b_img);
  for (const row of universities.data ?? []) {
    addPath(paths, "university/logo", row.u_logo);
    for (const f of parseCsvList(row.u_img)) addPath(paths, "university/images", f);
    for (const f of parseCsvList(row.u_img)) addPath(paths, "university", f);
  }
  for (const row of scholarships.data ?? []) addPath(paths, "corporate", row.s_c_logo);
  for (const row of schools.data ?? []) {
    addPath(paths, "internationalschool/logo", row.int_logo);
    for (const f of parseCsvList(row.int_img)) {
      addPath(paths, "internationalschool/images", f);
    }
  }
  for (const row of banners.data ?? []) addPath(paths, "banner", row.banner_img);
  for (const row of popups.data ?? []) addPath(paths, "popups", row.pu_img);
  for (const row of careers.data ?? []) {
    addPath(paths, "career", row.c_img);
    addPath(paths, "career", row.c_img_male);
    addPath(paths, "career", row.c_img_female);
  }
  for (const row of characters.data ?? []) {
    addPath(paths, "characters", row.c_img);
    addPath(paths, "characters", row.c_img_male);
    addPath(paths, "characters", row.c_img_female);
  }
  for (const row of events.data ?? []) {
    for (const f of parseCsvList(row.e_img)) addPath(paths, "event", f);
  }
  for (const row of homeRows.data ?? []) {
    // h_img is a CSV of filenames ("home-x.png,home-y.jpg").
    for (const f of parseCsvList(row.h_img)) addPath(paths, "home", f);
  }

  return paths;
}

const SQL_TABLE_FOLDERS = {
  blogs: (filename) => [`blogs/${filename}`],
  banners: (filename) => [`banner/${filename}`],
  universities: (filename, field) => {
    if (field === "logo") return [`university/logo/${filename}`, `university/${filename}`];
    return [`university/${filename}`, `university/images/${filename}`];
  },
  international_school: (filename, field) => {
    if (field === "logo") return [`internationalschool/logo/${filename}`];
    return [`internationalschool/images/${filename}`];
  },
  scholarships: (filename) => [`corporate/${filename}`],
  int_scholarship: (filename) => [`corporate/${filename}`],
  characters: (filename) => [`characters/${filename}`],
  careers: (filename) => [`career/${filename}`],
  events: (filename) => [`event/${filename}`],
  pop_up: (filename) => [`popups/${filename}`],
  home: (filename) => [`home/${filename}`],
  achievements: (filename) => [`achievements/${filename}`],
  categories: (filename) => [`categories/${filename}`],
};

const FILENAME_PREFIX_FOLDERS = [
  [/^blog-/, "blogs/"],
  [/^banner-/, "banner/"],
  [/^cat-\d/, "assets/"],
  [/^ubie_/, "assets/"],
  [/^home-/, "assets/"],
  [/^attachment-/, "achievements/"],
  [/^pu-/, "popups/"],
];

function collectPathsFromSqlDump() {
  const dumpPath = path.resolve(WEB_ROOT, "..", "database", "database.sql");
  if (!fs.existsSync(dumpPath)) return new Set();

  const sql = fs.readFileSync(dumpPath, "utf8");
  const paths = new Set();
  let table = null;

  const imageExt =
    /['"]([a-zA-Z0-9_.-]+\.(?:png|jpe?g|gif|webp|svg))['"]/gi;

  for (const line of sql.split("\n")) {
    const tableMatch = line.match(/INSERT INTO `([^`]+)`/);
    if (tableMatch) table = tableMatch[1];

    let m;
    while ((m = imageExt.exec(line))) {
      const filename = m[1];
      if (filename.includes("/")) {
        paths.add(filename.replace(/^images\//, ""));
        continue;
      }

      const mappers = table ? SQL_TABLE_FOLDERS[table] : null;
      if (mappers) {
        for (const p of mappers(filename)) paths.add(p);
        if (table === "universities") {
          for (const p of mappers(filename, "logo")) paths.add(p);
        }
        continue;
      }

      const prefix = FILENAME_PREFIX_FOLDERS.find(([re]) => re.test(filename));
      if (prefix) paths.add(`${prefix[1]}${filename}`);
    }
  }

  return paths;
}

function collectStaticAssetPaths() {
  const srcDir = path.join(WEB_ROOT, "src");
  const paths = new Set();
  const re = /\/images\/((?:assets|characters|taste)\/[^"'`\s]+|[^"'`\s/]+\/[^"'`\s]+)/g;

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|css)$/.test(ent.name)) {
        const text = fs.readFileSync(full, "utf8");
        let m;
        while ((m = re.exec(text))) paths.add(m[1]);
      }
    }
  }
  walk(srcDir);
  return paths;
}

function downloadOne(relPath) {
  const dest = path.join(PUBLIC_IMAGES, relPath);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    return "skipped";
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const url = `${ORIGIN.replace(/\/$/, "")}/images/${relPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const result = spawnSync(
    "/usr/bin/curl",
    ["-sk", "-H", `Host: ${HOST}`, "-f", "-o", dest, url],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    fs.rmSync(dest, { force: true });
    return "missing";
  }
  if (!fs.existsSync(dest) || fs.statSync(dest).size < 32) {
    fs.rmSync(dest, { force: true });
    return "empty";
  }
  return "ok";
}

async function runPool(items, worker) {
  let i = 0;
  const stats = { ok: 0, skipped: 0, missing: 0, empty: 0 };

  async function next() {
    while (i < items.length) {
      const idx = i++;
      const result = worker(items[idx]);
      if (result === "ok") stats.ok++;
      else if (result === "skipped") stats.skipped++;
      else if (result === "empty") stats.empty++;
      else stats.missing++;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => next()));
  return stats;
}

async function main() {
  const fromDb = await collectPathsFromDb();
  const fromSql = collectPathsFromSqlDump();
  const staticPaths = collectStaticAssetPaths();
  const all = new Set([...fromDb, ...fromSql, ...staticPaths]);

  console.log(`Syncing ${all.size} image paths to ${PUBLIC_IMAGES}`);
  const paths = [...all].sort();
  const stats = await runPool(paths, downloadOne);
  console.log(stats);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
