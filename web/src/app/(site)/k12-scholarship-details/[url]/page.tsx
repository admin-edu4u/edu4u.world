import { Medal } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { formatMoney } from "@/lib/money";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

type Params = { url: string };

export default async function K12ScholarshipDetailsPage({ params }: { params: Promise<Params> }) {
  const { url } = await params;
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const { data: rawScholarship } = await supabase
    .from("int_scholarship")
    .select("*")
    .eq("s_url_code", url)
    .eq("s_status", 1)
    .single();

  if (!rawScholarship) notFound();

  const scholarship = pickLocalizedFields(rawScholarship, CMS_I18N_FIELDS.k12Scholarship, locale);

  // Fetch school
  const { data: rawSchool } =
    scholarship.s_int_id && scholarship.s_int_id !== 0
      ? await supabase
          .from("international_school")
          .select("int_id,int_url_code,int_name,int_logo,i18n")
          .eq("int_id", scholarship.s_int_id)
          .single()
      : { data: null };

  const school = rawSchool ? pickLocalizedFields(rawSchool, CMS_I18N_FIELDS.k12, locale) : null;

  // Fetch discount tiers
  const { data: discounts } = await supabase
    .from("int_scholarship_discount")
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
    : school?.int_logo
    ? `${CDN}/images/internationalschool/logo/${school.int_logo}`
    : null;

  const entityName = scholarship.s_is_corporate
    ? scholarship.s_c_name
    : school?.int_name || "";

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
            <span className="uni-name-1">{scholarship.s_title}</span>
            {entityName && <span className="review-desc d-block">{entityName}</span>}

            {maxDiscount && (
              <div className="d-flex align-items-center mt-5 gap-3">
                <Medal weight="light" size={24} color="#1F1F1F" />
                <span className="award-text">{t("awardsUpTo")}</span>
                <span className="award-amt">{maxDiscount}</span>
              </div>
            )}

            {entityName && (
              <div className="col-12 mt-8 d-flex align-items-center gap-2">
                <span className="submission-user-label">{t("locationLabel")}:</span>
                <span className="course-details">{entityName}</span>
              </div>
            )}

            {scholarship.s_criteria && (
              <div className="mt-10">
                <span className="criteria d-block">{t("criteria")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_criteria }} />
              </div>
            )}

            {scholarship.s_details && (
              <div className="mt-20">
                <span className="criteria d-block">{t("details")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_details }} />
              </div>
            )}

            {scholarship.s_application && (
              <div className="mt-20">
                <span className="criteria d-block">{t("howToApply")}</span>
                <div className="mt-5" dangerouslySetInnerHTML={{ __html: scholarship.s_application }} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
