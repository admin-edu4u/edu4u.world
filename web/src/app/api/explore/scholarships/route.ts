import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { getLocale } from "@/lib/i18n/locale";
import { getLocalized } from "@/lib/i18n/cms";
import { formatMoney } from "@/lib/money";

export async function GET(req: NextRequest) {
  const supabase = createPublicClient();
  const locale = await getLocale();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "1";
  const studyField = searchParams.getAll("study_field[]");
  const level = searchParams.getAll("level[]");

  try {
    // Prefer active (1). If none exist in the imported dump, fall back to all rows
    // so the scholarship tab still renders cards during migration.
    let query = supabase
      .from("scholarships")
      .select(
        "s_id,s_url_code,s_title,s_study_field,s_requirement,s_has_interview,s_is_corporate,s_c_name,s_c_logo,s_uni_id,s_level_id,s_status,i18n",
      )
      .eq("s_status", 1);

    if (search) query = query.ilike("s_title", `%${search}%`);

    if (sort === "2") {
      query = query.order("s_id", { ascending: true });
    } else {
      query = query.order("s_id", { ascending: false });
    }

    let { data, error } = await query;
    if (error) {
      console.error("Scholarships query error:", error);
      return NextResponse.json({ status: false, list: [], msg: error.message });
    }

    if (!data || data.length === 0) {
      let fallback = supabase
        .from("scholarships")
        .select(
          "s_id,s_url_code,s_title,s_study_field,s_requirement,s_has_interview,s_is_corporate,s_c_name,s_c_logo,s_uni_id,s_level_id,s_status,i18n",
        )
        .not("s_status", "is", null);
      if (search) fallback = fallback.ilike("s_title", `%${search}%`);
      fallback = fallback.order("s_id", { ascending: sort !== "2" });
      const res = await fallback;
      data = res.data;
      error = res.error;
      if (error) {
        console.error("Scholarships fallback error:", error);
        return NextResponse.json({
          status: false,
          list: [],
          msg: error.message,
        });
      }
    }

    const uniIds = [
      ...new Set(
        (data || [])
          .filter((s) => !s.s_is_corporate && s.s_uni_id)
          .map((s) => s.s_uni_id),
      ),
    ];
    const uniMap: Record<number, { u_name: string; u_logo: string | null }> =
      {};
    if (uniIds.length) {
      const { data: unis } = await supabase
        .from("universities")
        .select("u_id,u_name,u_logo,i18n")
        .in("u_id", uniIds);
      for (const u of unis || []) {
        uniMap[u.u_id] = {
          u_name: getLocalized(u, "u_name", locale),
          u_logo: u.u_logo,
        };
      }
    }

    // Study fields are stored as sub_cats IDs — resolve them to localized
    // names so card data never shows raw IDs. Unknown IDs are dropped.
    const { data: subCats } = await supabase
      .from("sub_cats")
      .select("sc_id,sc_name,i18n");
    const fieldMap: Record<number, string> = {};
    for (const c of subCats || []) {
      fieldMap[c.sc_id] = getLocalized(c, "sc_name", locale);
    }

    // Max discount, resolved the same way as the scholarship detail page:
    // highest active tier percentage, otherwise highest tier amount.
    const schIds = [...new Set((data || []).map((s) => s.s_id))];
    const discountMap: Record<number, string> = {};
    if (schIds.length) {
      const { data: discounts } = await supabase
        .from("scholarship_discount")
        .select("sd_s_id,sd_percentage,sd_amt")
        .in("sd_s_id", schIds)
        .eq("sd_status", 1);
      const tiers: Record<number, { pct: number; amt: number }> = {};
      for (const d of discounts || []) {
        const e = (tiers[d.sd_s_id] ??= { pct: 0, amt: 0 });
        e.pct = Math.max(e.pct, d.sd_percentage || 0);
        e.amt = Math.max(e.amt, d.sd_amt || 0);
      }
      for (const [id, e] of Object.entries(tiers)) {
        discountMap[Number(id)] =
          e.pct > 0 ? `${e.pct}%` : e.amt > 0 ? formatMoney(e.amt) : "";
      }
    }

    let list = (data || []).map((s) => {
      const uni = uniMap[s.s_uni_id];
      const corpName = getLocalized(s, "s_c_name", locale);
      const uniName =
        s.s_is_corporate === 0 ? uni?.u_name || "" : corpName || "";
      const rawLogo =
        s.s_is_corporate === 0
          ? uni?.u_logo
            ? `${CDN}/images/university/logo/${uni.u_logo}`
            : ""
          : s.s_c_logo
            ? `${CDN}/images/scholarships/${s.s_c_logo}`
            : "";

      // Resolve to names, drop unknown IDs, and dedupe repeated names
      // (the old project's sub_cats data contains duplicates).
      const applicable = s.s_study_field
        ? [
            ...new Set(
              s.s_study_field
                .split(",")
                .map((f: string) => fieldMap[Number(f.trim())])
                .filter(Boolean),
            ),
          ].join(", ")
        : "";

      const requirementMap: Record<string, string> = {
        "1": "Merit",
        "2": "Financial need",
        "3": "Essay",
        "4": "Interview",
      };
      const req = s.s_requirement
        ? s.s_requirement
            .split(",")
            .map((r: string) => requirementMap[r.trim()] || r.trim())
            .filter(Boolean)
            .join(", ")
        : "";

      return {
        id: s.s_id,
        url_code: s.s_url_code || String(s.s_id),
        url: s.s_url_code || String(s.s_id),
        name: getLocalized(s, "s_title", locale) || "",
        uni_name: uniName,
        uni_logo: rawLogo,
        applicable,
        has_all_cat: false,
        has_interview: s.s_has_interview === 1 ? "Yes" : "No",
        requirement: req,
        max_discount: discountMap[s.s_id] || "",
        s_study_field: s.s_study_field || "",
        s_level: s.s_level_id || "",
      };
    });

    if (studyField.length > 0) {
      list = list.filter((s) =>
        studyField.some((f) =>
          (s.s_study_field || "")
            .split(",")
            .map((x: string) => x.trim())
            .includes(f),
        ),
      );
    }

    if (level.length > 0) {
      list = list.filter((s) =>
        level.some((l) =>
          (s.s_level || "")
            .split(",")
            .map((x: string) => x.trim())
            .includes(l),
        ),
      );
    }

    const clean = list.map(({ s_study_field, s_level, ...rest }) => rest);

    return NextResponse.json({ status: true, list: clean });
  } catch (e) {
    console.error("Scholarships API error:", e);
    return NextResponse.json({ status: false, list: [] }, { status: 500 });
  }
}
