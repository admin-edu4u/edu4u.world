#!/usr/bin/env python3
"""Bulk upsert mysql_json into Supabase REST (RLS must be disabled or service role used)."""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_DIR = ROOT / "web/supabase/migrations/mysql_json"
ENV_PATH = ROOT / "web" / ".env.local"
LOG = ROOT / ".tmp_rest_import.log"

COL_MAP = {"isActive": "isactive", "isAdmin": "isadmin"}
NOT_NULL_TEXT = {
    "blogs": {"b_content", "b_img", "b_title"},
    "characters": {"c_desc", "c_name"},
    "course_level_desc": {"c_level_desc"},
    "subjects": {"s_name"},
    "universities": {"u_desc", "u_name", "u_addr", "u_hours", "u_year"},
    "courses": {"c_name", "c_intake", "c_outline"},
}
TABLE_PK = {
    "academics": "a_id",
    "achievements": "a_id",
    "banners": "banner_id",
    "blog_cats": "bc_id",
    "blogs": "b_id",
    "branches": "b_id",
    "career_categories": "cc_id",
    "careers": "c_id",
    "categories": "c_id",
    "characters": "c_id",
    "consult_counsellor": "cc_id",
    "course_fees": "cf_id",
    "course_grades": "cg_id",
    "course_level_desc": "c_level_desc_id",
    "courses": "c_id",
    "enquiries": "e_id",
    "events": "e_id",
    "families": "f_id",
    "full_countries": "country_id",
    "home": "h_id",
    "int_scholarship": "s_id",
    "int_scholarship_discount": "sd_id",
    "international_branches": "int_b_id",
    "international_school": "int_id",
    "personalities": "p_id",
    "pop_up": "pu_id",
    "qualification_level": "q_id",
    "register_interests": "ri_id",
    "results": "r_id",
    "scholarship_discount": "sd_id",
    "scholarships": "s_id",
    "schools": "s_id",
    "states": "state_id",
    "sub_cats": "sc_id",
    "subject_categories": "sc_id",
    "subject_grades": "sg_id",
    "subjects": "s_id",
    "universities": "u_id",
    "university_intakes": "ui_id",
    "university_preferences": "up_id",
    "university_type": "ut_id",
    "user_documents": "ud_id",
    "app_users": "id",
    "visit_campus": "vc_id",
}
ORDER = [
    "full_countries",
    "states",
    "university_type",
    "qualification_level",
    "categories",
    "blog_cats",
    "career_categories",
    "subject_categories",
    "personalities",
    "characters",
    "banners",
    "home",
    "pop_up",
    "universities",
    "branches",
    "university_intakes",
    "courses",
    "course_fees",
    "course_grades",
    "course_level_desc",
    "subjects",
    "subject_grades",
    "sub_cats",
    "scholarships",
    "scholarship_discount",
    "int_scholarship",
    "int_scholarship_discount",
    "international_school",
    "international_branches",
    "schools",
    "careers",
    "blogs",
    "events",
    "app_users",
    "academics",
    "achievements",
    "families",
    "results",
    "university_preferences",
    "user_documents",
    "enquiries",
    "register_interests",
    "consult_counsellor",
    "visit_campus",
]
BATCH = 100


def load_env() -> tuple[str, str]:
    url = key = ""
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
            url = line.split("=", 1)[1].strip().strip('"')
        elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
            key = line.split("=", 1)[1].strip().strip('"')
        elif line.startswith("SUPABASE_SERVICE_ROLE_KEY=") and "PLACEHOLDER" not in line:
            val = line.split("=", 1)[1].strip().strip('"')
            if val:
                key = val
    if not url or not key:
        raise SystemExit("Missing Supabase URL/key in web/.env.local")
    return url.rstrip("/"), key


def normalize(table: str, row: dict) -> dict:
    nn = NOT_NULL_TEXT.get(table, set())
    out = {}
    for k, v in row.items():
        col = COL_MAP.get(k, k)
        if col in nn and v is None:
            v = ""
        out[col] = v
    return out


def log(msg: str) -> None:
    print(msg, flush=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def upsert(url: str, key: str, table: str, rows: list[dict]) -> None:
    pk = TABLE_PK[table]
    endpoint = f"{url}/rest/v1/{table}?on_conflict={pk}"
    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        body = json.dumps(chunk, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=body,
            method="POST",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=180) as resp:
                    if resp.status not in (200, 201, 204):
                        raise RuntimeError(f"HTTP {resp.status}")
                break
            except urllib.error.HTTPError as e:
                err = e.read().decode()[:800]
                if attempt < 4 and e.code in (429, 500, 502, 503, 504):
                    time.sleep(1.5 * (attempt + 1))
                    continue
                raise RuntimeError(f"{table}@{i}: {e.code} {err}") from e


def main() -> int:
    LOG.write_text("", encoding="utf-8")
    url, key = load_env()
    only = set(sys.argv[1:]) if len(sys.argv) > 1 else None
    tables = [t for t in ORDER if (JSON_DIR / f"{t}.json").exists()]
    if only:
        tables = [t for t in tables if t in only]
    for table in tables:
        raw = json.loads((JSON_DIR / f"{table}.json").read_text(encoding="utf-8"))
        rows = [normalize(table, r) for r in raw]
        if not rows:
            log(f"SKIP {table} empty")
            continue
        try:
            upsert(url, key, table, rows)
            log(f"OK {table} {len(rows)}")
        except Exception as e:
            log(f"FAIL {table} {e}")
            return 1
    log("DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
