import { Medal, MapPin, GraduationCap, BookOpen } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { formatMoney } from "@/lib/money";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

type Params = { url: string };

export default async function ScholarshipPage({ params }: { params: Promise<Params> }) {
  const { url } = await params;
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  let { data: scholarship } = await supabase
    .from("scholarships")
    .select("*")
    .eq("s_url_code", url)
    .eq("s_status", 1)
    .maybeSingle();

  // Imported dump soft-deletes many scholarships as status 99; still show by slug.
  if (!scholarship) {
    const fallback = await supabase
      .from("scholarships")
      .select("*")
      .eq("s_url_code", url)
      .maybeSingle();
    scholarship = fallback.data;
  }

  if (!scholarship) notFound();

  scholarship = pickLocalizedFields(scholarship, CMS_I18N_FIELDS.scholarship, locale);

  // Fetch university
  const { data: rawUni } =
    scholarship.s_uni_id && scholarship.s_uni_id !== 0
      ? await supabase
          .from("universities")
          .select("u_id,u_url_code,u_name,u_logo,i18n")
          .eq("u_id", scholarship.s_uni_id)
          .single()
      : { data: null };

  const uni = rawUni ? pickLocalizedFields(rawUni, CMS_I18N_FIELDS.university, locale) : null;

  // Fetch discount tiers
  const { data: discounts } = await supabase
    .from("scholarship_discount")
    .select("*")
    .eq("sd_s_id", scholarship.s_id)
    .eq("sd_status", 1)
    .order("sd_level_id");

  // Max discount
  let maxDiscount = "";
  if (discounts && discounts.length > 0) {
    const maxPct = Math.max(...discounts.map((d) => d.sd_percentage || 0));
    const maxAmt = Math.max(...discounts.map((d) => d.sd_amt || 0));
    if (maxPct > 0) maxDiscount = `${maxPct}%`;
    else if (maxAmt > 0) maxDiscount = formatMoney(maxAmt);
  }

  const logo = scholarship.s_is_corporate
    ? scholarship.s_c_logo
      ? `${CDN}/images/corporate/${scholarship.s_c_logo}`
      : null
    : uni?.u_logo
    ? `${CDN}/images/university/logo/${uni.u_logo}`
    : null;

  const entityName = scholarship.s_is_corporate
    ? scholarship.s_c_name
    : uni?.u_name || "";

  const levelIds: string[] = scholarship.s_level_id
    ? String(scholarship.s_level_id)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const levelMap: Record<string, string> = {
    "1": "Foundation / Pre-U",
    "2": "Diploma",
    "3": "Advanced Diploma",
    "4": "Degree",
    "5": "Masters",
    "6": "PhD",
    "7": "Professional",
  };

  return (
    <div className="mw-1200 mx-auto pt-140 pb-20 px-5 px-lg-0">
      <style>{`
        .award-text { font-size: 14px; font-weight: 600; color: #1F1F1F; }
        .award-amt { font-size: 24px; font-weight: 700; color: #1A124E; }
        .submission-user-label { font-size: 13px; color: #999; }
        .course-details { font-size: 14px; color: #1F1F1F; }
        .criteria { font-size: 20px; font-weight: 700; color: #1F1F1F; }
        .table-header { font-size: 13px; font-weight: 600; color: #999; padding-bottom: 8px; border-bottom: 1px solid #E4E4E4; overflow-wrap: anywhere; }
        .table-body { font-size: 14px; color: #1F1F1F; padding: 8px 0; border-bottom: 1px solid #E4E4E4; vertical-align: top; overflow-wrap: anywhere; }
        .uni-name-1 { font-size: 22px; font-weight: 700; color: #1F1F1F; }
        .review-desc { font-size: 15px; color: #666; }
        .uni-logo { width: 80px; height: 80px; object-fit: contain; border-radius: 8px; border: 1px solid #E4E4E4; }
        .home-btn-get-started-2 { border: 2px solid #1A124E; border-radius: 8px; padding: 12px 24px; background: #1A124E; color: white; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; }
        .home-btn-get-started-2:hover { background-color: white; color: #1A124E; }
      `}</style>

      <div className="row">
        <div className="col-12 col-lg-2 mb-4 mb-lg-0">
          {logo ? (
            <img src={logo} className="uni-logo" alt={entityName} />
          ) : (
            <div className="uni-logo d-flex align-items-center justify-content-center" style={{ background: "#f8f8f8" }}>
              <span style={{ fontSize: 10, color: "#999" }}>{t("noLogo")}</span>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-10 mt-2">
          <div className="ms-0 ms-lg-5">
            <div className="col-12 d-flex justify-content-between flex-wrap gap-2">
              <span className="uni-name-1">{scholarship.s_title}</span>
            </div>
            {entityName && <span className="review-desc d-block">{entityName}</span>}

            {/* Max award */}
            {maxDiscount && (
              <div className="d-flex align-items-center mt-5 gap-3">
                <Medal weight="light" size={24} color="#1F1F1F" />
                <span className="award-text">{t("awardsUpTo")}</span>
                <span className="award-amt">{maxDiscount}</span>
              </div>
            )}

            {/* Location */}
            {entityName && (
              <div className="col-12 mt-8 d-flex align-items-center gap-2">
                <MapPin weight="light" size={24} color="#999999" />
                <span className="submission-user-label">{t("locationLabel")}:</span>
                <span className="course-details">{entityName}</span>
              </div>
            )}

            {/* Level */}
            {levelIds.length > 0 && (
              <div className="col-12 mt-3 d-flex align-items-center gap-2">
                <GraduationCap weight="light" size={24} color="#999999" />
                <span className="submission-user-label">{t("courseLevel")}:</span>
                <span className="course-details">
                  {levelIds.map((id) => levelMap[id] || id).join(", ")}
                </span>
              </div>
            )}

            {/* Field of study */}
            {scholarship.s_study_field && (
              <div className="col-12 mt-3 d-flex align-items-center gap-2">
                <BookOpen weight="light" size={24} color="#999999" />
                <span className="submission-user-label">{t("fieldOfStudy")}:</span>
                <span className="course-details">{scholarship.s_study_field}</span>
              </div>
            )}

            {/* Criteria */}
            {scholarship.s_criteria && (
              <div className="mt-10">
                <span className="criteria d-block">{t("criteria")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_criteria }} />
              </div>
            )}

            {/* Highlights */}
            {scholarship.s_highlights && (
              <div className="mt-20">
                <span className="criteria d-block">{t("highlights")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_highlights }} />
              </div>
            )}

            {/* Awards detail */}
            {scholarship.s_award && (
              <div className="mt-20">
                <span className="criteria d-block">{t("award")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_award }} />
              </div>
            )}

            {/* Discount table */}
            {discounts && discounts.length > 0 && (
              <div className="mt-8">
                <table className="col-12">
                  <thead>
                    <tr>
                      <th className="col-4 award-text table-header">{t("course")}</th>
                      <th className="col-4 award-text table-header">{t("grade")}</th>
                      <th className="col-4 award-text table-header">{t("scholarshipAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((d) => (
                      <tr key={d.sd_id}>
                        <td className="award-text table-body">{d.sd_desc || "-"}</td>
                        <td className="table-body">
                          <span className="award-text d-block pt-3">
                            {d.sd_is_above ? "≥" : ""} {d.sd_grade}
                            {d.sd_count > 0 ? ` (min ${d.sd_count})` : ""}
                          </span>
                        </td>
                        <td className="table-body">
                          <span className="award-text d-block pt-3">
                            {d.sd_is_amt
                              ? formatMoney(d.sd_amt)
                              : `${d.sd_percentage}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Application */}
            {scholarship.s_application && (
              <div className="mt-20">
                <span className="criteria d-block">{t("howToApply")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_application }} />
              </div>
            )}

            {/* Details */}
            {scholarship.s_details && (
              <div className="mt-20">
                <span className="criteria d-block">{t("details")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_details }} />
              </div>
            )}

            {/* Back link */}
            <div className="mt-15">
              {uni && (
                <Link href={`/university/${uni.u_url_code || uni.u_id}`} className="home-btn-get-started-2">
                  {t("viewUniversity")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
