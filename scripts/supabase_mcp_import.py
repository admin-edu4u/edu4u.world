#!/usr/bin/env python3
"""Emit batched INSERT SQL files for Supabase MCP execute_sql import."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_DIR = ROOT / "web/supabase/migrations/mysql_json"
OUT_DIR = ROOT / ".tmp_sql_batches"

COL_MAP = {"isActive": "isactive", "isAdmin": "isadmin"}
QUOTE_COLS = {"character"}

NOT_NULL_TEXT = {
    "blogs": {"b_content", "b_img", "b_title"},
    "characters": {"c_desc", "c_name"},
    "course_level_desc": {"c_level_desc"},
    "subjects": {"s_name"},
    "universities": {"u_desc", "u_name", "u_addr", "u_hours", "u_year"},
    "courses": {"c_name", "c_intake", "c_outline"},
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

BATCH = 25
SCHEMA = ROOT / "web/supabase/migrations/002_full_mysql_schema.sql"


def sql_literal(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return str(v)
    if isinstance(v, (dict, list)):
        s = json.dumps(v, ensure_ascii=False)
    else:
        s = str(v)
    s = s.replace("'", "''")
    return "'" + s + "'"


def quote_ident(col: str) -> str:
    if col in QUOTE_COLS or not col.isidentifier():
        return '"' + col.replace('"', '""') + '"'
    return col


def normalize_row(table: str, row: dict) -> dict:
    out = {}
    nn = NOT_NULL_TEXT.get(table, set())
    for k, v in row.items():
        col = COL_MAP.get(k, k)
        if col in nn and v is None:
            v = ""
        out[col] = v
    return out


def insert_sql(table: str, rows: list[dict]) -> str:
    if not rows:
        return ""
    cols = list(rows[0].keys())
    col_sql = ", ".join(quote_ident(c) for c in cols)
    values = []
    for row in rows:
        vals = ", ".join(sql_literal(row.get(c)) for c in cols)
        values.append(f"({vals})")
    return f'INSERT INTO "{table}" ({col_sql}) VALUES ' + ", ".join(values) + ";"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.sql"):
        old.unlink()

    schema_out = OUT_DIR / "000_schema.sql"
    schema_out.write_text(SCHEMA.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"schema -> {schema_out}")

    extras = [
        OUT_DIR / "001_extras.sql",
    ]
    extras_sql = """
alter table universities add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table courses add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table categories add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table blogs add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table scholarships add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table careers add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table international_school add column if not exists i18n jsonb not null default '{}'::jsonb;
alter table characters add column if not exists i18n jsonb not null default '{}'::jsonb;
"""
    extras[0].write_text(extras_sql.strip(), encoding="utf-8")

    manifest = json.loads((JSON_DIR / "manifest.json").read_text())
    tables = [t for t in ORDER if t in manifest]
    batch_idx = 10
    for table in tables:
        rows = json.loads((JSON_DIR / f"{table}.json").read_text())
        rows = [normalize_row(table, r) for r in rows]
        for i in range(0, len(rows), BATCH):
            chunk = rows[i : i + BATCH]
            sql = insert_sql(table, chunk)
            path = OUT_DIR / f"{batch_idx:04d}_{table}_{i}.sql"
            path.write_text(sql, encoding="utf-8")
            print(path.name, len(chunk))
            batch_idx += 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
