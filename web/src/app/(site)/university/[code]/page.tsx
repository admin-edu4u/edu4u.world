import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { formatMoney } from "@/lib/money";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

type Params = { code: string };

export default async function UniversityPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  // Try by u_url_code first, then by u_id
  let { data: uni } = await supabase
    .from("universities")
    .select("*")
    .eq("u_url_code", code)
    .eq("u_status", 1)
    .single();

  if (!uni) {
    const numericId = parseInt(code, 10);
    if (!isNaN(numericId)) {
      const { data } = await supabase
        .from("universities")
        .select("*")
        .eq("u_id", numericId)
        .eq("u_status", 1)
        .single();
      uni = data;
    }
  }

  if (!uni) notFound();

  uni = pickLocalizedFields(uni, CMS_I18N_FIELDS.university, locale);

  // Related courses
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("c_id,c_url_code,c_name,c_level,c_duration,c_award,c_amount,i18n")
    .eq("c_uni", uni.u_id)
    .eq("c_status", 1)
    .order("c_name")
    .limit(20);

  const courses = (rawCourses ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.course, locale)
  );

  // Related scholarships
  const { data: rawScholarships } = await supabase
    .from("scholarships")
    .select("s_id,s_url_code,s_title,s_level_id,i18n")
    .eq("s_uni_id", uni.u_id)
    .eq("s_status", 1)
    .order("s_title")
    .limit(20);

  const scholarships = (rawScholarships ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.scholarship, locale)
  );

  // Parse images stored as JSON array or comma-separated
  let images: string[] = [];
  if (uni.u_img) {
    try {
      const parsed = JSON.parse(uni.u_img);
      images = Array.isArray(parsed) ? parsed : [uni.u_img];
    } catch {
      images = uni.u_img
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  const levelMap: Record<number, string> = {
    1: "Foundation / Pre-U",
    2: "Diploma",
    3: "Advanced Diploma",
    4: "Degree",
    5: "Masters",
    6: "PhD",
    7: "Professional",
  };

  return (
    <div className="pb-20">
      <style>{`
        .uni-img-slider { width: 100%; height: 420px; object-fit: cover; display: block; }
        .uni-slider-wrap { position: relative; }
        .btn-navi { background: #FFF; border-radius: 100px; border: 1px solid #E4E4E4; }
        .separator-right { border-right: 1px solid #E4E4E4; height: 40px; }
        .course-card { border: 1px solid #E4E4E4; border-radius: 12px; padding: 16px; }
        .course-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .tab-pill { border: 1px solid #1A124E; border-radius: 100px; padding: 8px 24px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; }
        .tab-pill.active { background: #1A124E; color: white; }
        .tab-pill:not(.active) { background: white; color: #1A124E; }
      `}</style>

      {/* Full-bleed hero image behind the fixed header */}
      {images.length > 0 && (
        <div className="mb-20">
          <img
            src={`${CDN}/images/university/images/${images[0]}`}
            className="uni-img-slider"
            alt={uni.u_name}
          />
          {images.length > 1 && (
            <div className="mw-1200 mx-auto px-5 px-lg-0">
              <div className="d-flex gap-2 mt-3 overflow-auto">
                {images.slice(1).map((img: string, i: number) => (
                  <img
                    key={i}
                    src={`${CDN}/images/university/images/${img}`}
                    alt={`${uni.u_name} ${i + 2}`}
                    style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!images.length && <div className="pt-80" />}

      <div className="mw-1200 mx-auto px-5 px-lg-0">
        {/* Header */}
        <div className="row">
          <div className="col-12 col-lg-3 mb-5 mb-lg-0">
            {uni.u_logo && (
              <img
                src={`${CDN}/images/university/logo/${uni.u_logo}`}
                className="uni-logo"
                alt={uni.u_name}
              />
            )}
          </div>
          <div className="col-12 col-lg-9 mt-lg-10">
            <div className="col-12 d-flex justify-content-between align-items-start flex-wrap gap-3">
              <span className="uni-name-1">{uni.u_name}</span>
              <Link href={`/visit-campus`} className="visit-campus">
                {t("visitTheCampus")}
              </Link>
            </div>
            <div className="col-12 d-flex mt-5 flex-wrap gap-3">
              {uni.u_has_rank === 1 && uni.u_ranking && (
                <>
                  <div>
                    <span className="d-block uni-name">{uni.u_ranking}</span>
                    <span className="d-block uni-location">{t("globalRanking")}</span>
                  </div>
                  <div className="mx-5 separator-right d-none d-lg-block" />
                </>
              )}
              <div>
                <span className="d-block uni-name">&gt; {uni.u_student?.toLocaleString()}</span>
                <span className="d-block uni-location">{t("studentNum")}</span>
              </div>
              <div className="mx-5 separator-right d-none d-lg-block" />
              <div>
                <span className="d-block uni-name">&gt; {uni.u_staff?.toLocaleString()}</span>
                <span className="d-block uni-location">{t("staffRatio")}</span>
              </div>
              <div className="mx-5 separator-right d-none d-lg-block" />
              <div>
                <span className="d-block uni-name">{uni.u_year}</span>
                <span className="d-block uni-location">{t("foundedYear")}</span>
              </div>
            </div>

            {uni.u_addr && (
              <div className="mt-5 d-flex align-items-start gap-2">
                <MapPin weight="light" size={24} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
                <span className="uni-location">{uni.u_addr}</span>
              </div>
            )}

            {uni.u_desc && (
              <div className="mt-7">
                <span className="d-block uni-name">{uni.u_desc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Courses section */}
        <div className="mt-15">
          <span className="criteria d-block mb-8">{t("courses")}</span>
          {courses.length > 0 ? (
            <div className="row g-5">
              {courses.map((course) => (
                <div className="col-12 col-md-6 col-lg-4" key={course.c_id}>
                  <Link href={`/course-details/${course.c_url_code || course.c_id}`} className="text-decoration-none">
                    <div className="course-card h-100">
                      <span className="d-block uni-name-1" style={{ fontSize: 15 }}>{course.c_name}</span>
                      <span className="d-block uni-location mt-2">
                        {levelMap[course.c_level] || `Level ${course.c_level}`}
                      </span>
                      {course.c_duration > 0 && (
                        <span className="d-block uni-location">{t("durationLabel")}: {course.c_duration} {course.c_duration === 1 ? t("yearSingular") : t("years")}</span>
                      )}
                      {course.c_award && (
                        <span className="d-block uni-location">{t("award")}: {course.c_award}</span>
                      )}
                      {course.c_amount > 0 && (
                        <span className="d-block mt-3" style={{ color: "#1A124E", fontWeight: 600 }}>
                          {formatMoney(course.c_amount)}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <span className="uni-location">{t("noCoursesAvailable")}</span>
            </div>
          )}
        </div>

        {/* Scholarships section */}
        <div className="mt-15 mb-10">
          <span className="criteria d-block mb-8">{t("scholarships")}</span>
          {scholarships.length > 0 ? (
            <div className="row g-5">
              {scholarships.map((sch) => (
                <div className="col-12 col-md-6" key={sch.s_id}>
                  <Link href={`/scholarship/${sch.s_url_code || sch.s_id}`} className="text-decoration-none">
                    <div className="course-card h-100">
                      <span className="d-block uni-name-1" style={{ fontSize: 15 }}>{sch.s_title}</span>
                      {sch.s_level_id && sch.s_level_id !== "0" && (
                        <span className="d-block uni-location mt-2">{t("level")}: {sch.s_level_id}</span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <span className="uni-location">{t("noScholarshipsAvailable")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
