import type { SupabaseClient } from "@supabase/supabase-js";
import { CDN } from "@/lib/cdn";
import type { Locale } from "@/lib/i18n/config";
import { getLocalized } from "@/lib/i18n/cms";
import { formatMoney } from "@/lib/money";

const INTAKE_MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type PathwayCourseFilters = {
  characterId: number;
  studyLevel?: number;
  budget?: number;
  income?: number;
  malaysian?: number;
  uniType?: number;
  studyPlan?: number;
  states?: number[];
  country?: number;
};

export type RecommendedCourseRow = {
  id: number;
  url_code: string;
  name: string;
  uni_name: string;
  uni_logo: string;
  duration: string;
  intake: string;
  intakeMonths: string[];
  ttl_fees: string;
  amount: number;
  uni_id: number;
};

function formatDuration(months: number): string {
  const years = months / 12;
  if (years === Math.floor(years)) {
    const y = Math.floor(years);
    return `${y} ${y === 1 ? "Year" : "Years"}`;
  }
  return `${years.toFixed(1)} Years`;
}

function formatIntake(intake: string): string[] {
  return (intake || "")
    .split(",")
    .map((m) => INTAKE_MONTHS[Number.parseInt(m.trim(), 10)] || "")
    .filter(Boolean);
}

function budgetMax(budget?: number): number | null {
  if (!budget) return null;
  const caps: Record<number, number> = {
    1: 20000,
    2: 40000,
    3: 60000,
    4: 80000,
    5: 100000,
  };
  return caps[budget] ?? null;
}

async function subCatIdsForCharacter(
  supabase: SupabaseClient,
  characterId: number,
): Promise<number[]> {
  const { data } = await supabase
    .from("sub_cats")
    .select("sc_id, sc_character")
    .eq("sc_status", 1);

  const ids: number[] = [];
  for (const row of data ?? []) {
    const raw = row.sc_character;
    if (raw == null || raw === "") continue;
    if (Number(raw) === characterId || String(raw) === String(characterId)) {
      ids.push(row.sc_id);
    }
  }
  return ids;
}

export async function fetchPathwayRecommendedCourses(
  supabase: SupabaseClient,
  filters: PathwayCourseFilters,
  locale: Locale,
): Promise<RecommendedCourseRow[]> {
  const subCatIds = await subCatIdsForCharacter(supabase, filters.characterId);
  if (subCatIds.length === 0) return [];

  let query = supabase
    .from("courses")
    .select("c_id,c_url_code,c_name,c_intake,c_duration,c_amount,c_uni,c_sub_cat,c_level,c_is_malaysian,i18n")
    .eq("c_status", 1)
    .in("c_sub_cat", subCatIds);

  if (filters.studyLevel) {
    query = query.eq("c_level", filters.studyLevel);
  }

  const maxFee = budgetMax(filters.budget);
  if (maxFee != null) {
    query = query.lte("c_amount", maxFee);
  }

  query = query.order("c_amount", { ascending: true });

  const { data: courses, error } = await query;
  if (error || !courses?.length) return [];

  const uniIds = [...new Set(courses.map((c) => c.c_uni).filter(Boolean))];
  const { data: unis } = await supabase
    .from("universities")
    .select("u_id,u_name,u_logo,u_state,u_country,u_type,i18n")
    .eq("u_status", 1)
    .in("u_id", uniIds);

  const uniMap = new Map((unis ?? []).map((u) => [u.u_id, u]));

  const rows: RecommendedCourseRow[] = [];

  for (const c of courses) {
    const uni = uniMap.get(c.c_uni);
    if (!uni) continue;

    if (filters.uniType === 1 && uni.u_type !== 1) continue;
    if (filters.uniType === 2 && uni.u_type !== 2) continue;

    if (filters.malaysian === 1 && ![1, 2].includes(c.c_is_malaysian)) continue;
    if (filters.malaysian === 2 && ![0, 2].includes(c.c_is_malaysian)) continue;

    if (filters.studyPlan === 1 || filters.studyPlan === 2) {
      const states = filters.states ?? [];
      if (states.length > 0 && !states.includes(uni.u_state)) continue;
    }
    if (filters.studyPlan === 3 && filters.country) {
      if (uni.u_country !== filters.country) continue;
    }

    const intakeMonths = formatIntake(c.c_intake || "");
    rows.push({
      id: c.c_id,
      url_code: c.c_url_code || String(c.c_id),
      name: getLocalized(c, "c_name", locale) || c.c_name,
      uni_name: getLocalized(uni, "u_name", locale) || uni.u_name,
      uni_logo: uni.u_logo ? `${CDN}/images/university/logo/${uni.u_logo}` : "",
      duration: formatDuration(c.c_duration || 0),
      intake: intakeMonths.join(" "),
      intakeMonths,
      ttl_fees: formatMoney(c.c_amount || 0),
      amount: c.c_amount || 0,
      uni_id: c.c_uni,
    });
  }

  return rows;
}

export function countUniversities(courses: RecommendedCourseRow[]): number {
  return new Set(courses.map((c) => c.uni_id)).size;
}
