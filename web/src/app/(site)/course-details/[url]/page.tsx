import { Briefcase, Calendar, Clock, Medal } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { formatMoney } from "@/lib/money";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

type Params = { url: string };

const levelMap: Record<number, string> = {
  1: "Foundation / Pre-U",
  2: "Diploma",
  3: "Advanced Diploma",
  4: "Degree",
  5: "Masters",
  6: "PhD",
  7: "Professional",
};

export default async function CourseDetailsPage({ params }: { params: Promise<Params> }) {
  const { url } = await params;
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  // Fetch course with university info via join
  const { data: rawCourse } = await supabase
    .from("courses")
    .select("*")
    .eq("c_url_code", url)
    .eq("c_status", 1)
    .single();

  if (!rawCourse) notFound();

  const course = pickLocalizedFields(rawCourse, CMS_I18N_FIELDS.course, locale);

  // Fetch university info
  const { data: rawUni } = await supabase
    .from("universities")
    .select("u_id,u_url_code,u_name,u_logo,u_desc,u_addr,i18n")
    .eq("u_id", course.c_uni)
    .single();

  const uni = rawUni ? pickLocalizedFields(rawUni, CMS_I18N_FIELDS.university, locale) : null;

  // Fees
  const { data: fees } = await supabase
    .from("course_fees")
    .select("*")
    .eq("cf_c_id", course.c_id)
    .eq("cf_status", 1);

  const intakeStr = course.c_intake || "";
  const year = new Date().getFullYear();
  const nextYear = year + 1;

  return (
    <div className="pb-20">
      <style>{`
        .image-container {
          background-color: #f8f8f8;
          top: 0; left: 0;
          min-height: 460px;
          z-index: 0;
        }
        .course-outer-div { padding: 20px 0; }
        .uni-logo { width: 80px; height: 80px; object-fit: contain; border-radius: 8px; border: 1px solid #E4E4E4; }
        .course-details-div {
          border: 1px solid #E4E4E4;
          border-radius: 12px;
          padding: 16px;
          height: 100%;
        }
        .course-details-course-intake { font-size: 16px; font-weight: 600; color: #1F1F1F; }
        .course-details-course-intake-desc { font-size: 12px; color: #999; }
        .course-details-desc { font-size: 14px; color: #666; }
        .course-details-uni-name { font-size: 15px; color: #666; }
        .programme-outline { margin-top: 50px; }
        .details-div-border-right { border-right: 1px solid #E4E4E4; }
        .criteria { font-size: 20px; font-weight: 700; color: #1F1F1F; }
        .options-toggle { font-size: 14px; font-weight: 500; color: #1F1F1F; border-bottom: 2px solid transparent; border-radius: 0; padding: 6px 2px 8px; }
        .options-toggle.active { border-bottom-color: #1A124E; color: #1A124E; }
        .do-next-btn-1 { border: 2px solid #1A124E; border-radius: 8px; padding: 12px 24px; background: #1A124E; color: white; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; }
        .do-next-btn-1:hover { color: #1A124E; background-color: white; }
        .do-next-btn-2 { border: 2px solid white; border-radius: 8px; padding: 12px 24px; background: #666; color: white; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; }
        .do-next-btn-2:hover { color: white; background-color: #1A124E; }
        @media (max-width: 768px) { .details-div-border-right { border-right: 0; } }
      `}</style>

      <div>
        <div className="image-container">
          <div className="mw-1200 mx-auto" style={{ paddingTop: 86 }}>
            <div className="col-12 mx-auto course-outer-div row align-items-start">
              <div className="col-12 col-lg-2 mb-4 mb-lg-0">
                {uni?.u_logo && (
                  <img
                    src={`${CDN}/images/university/logo/${uni.u_logo}`}
                    className="uni-logo"
                    alt={uni?.u_name}
                  />
                )}
              </div>
              <div className="col-12 col-lg-10 mt-2">
                <div className="ms-0 ms-lg-5">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <span className="d-block visit-campus-text text-start">{course.c_name}</span>
                  </div>
                  {uni && (
                    <Link href={`/university/${uni.u_url_code || uni.u_id}`} className="d-block course-details-uni-name text-start pt-3" style={{ color: "#666" }}>
                      {uni.u_name}
                    </Link>
                  )}

                  {/* Info cards */}
                  <div className="col-12 row mt-10">
                    {/* Intake */}
                    <div className="col-6 col-lg-3 px-1 mb-3">
                      <div className="course-details-div">
                        <Calendar weight="light" size={24} color="#1F1F1F" />
                        <span className="course-details-course-intake d-block pt-2">{intakeStr}</span>
                        <span className="course-details-course-intake-desc pt-1 d-block">{t("intakeFor")}{year} / {nextYear}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-6 col-lg-3 px-1 mb-3">
                      <div className="course-details-div">
                        <Clock weight="light" size={24} color="#1F1F1F" />
                        <span className="course-details-course-intake d-block pt-2">{course.c_duration} {course.c_duration === 1 ? t("yearSingular") : t("years")}</span>
                        <span className="course-details-course-intake-desc pt-1 d-block">{t("durationOfStudies")}</span>
                      </div>
                    </div>

                    {/* Award */}
                    <div className="col-6 col-lg-3 px-1 mb-3">
                      <div className="course-details-div">
                        <Medal weight="light" size={24} color="#1F1F1F" />
                        <span className="course-details-course-intake d-block pt-2">{course.c_award || "-"}</span>
                        <span className="course-details-course-intake-desc pt-1 d-block">{t("award")}</span>
                      </div>
                    </div>

                    {/* Internship */}
                    <div className="col-6 col-lg-3 px-1 mb-3">
                      <div className="course-details-div">
                        <Briefcase weight="light" size={24} color="black" />
                        <span className="course-details-course-intake d-block pt-2">
                          {course.c_has_internship
                            ? `${course.c_internship_duration || ""} ${t("monthsWord")}`
                            : t("noInternship")}
                        </span>
                        <span className="course-details-course-intake-desc pt-1 d-block">{t("internship")}</span>
                      </div>
                    </div>
                  </div>

                  {uni?.u_desc && (
                    <span className="course-details-desc d-block pt-10">{uni.u_desc}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Programme outline + sidebar */}
        <div className="programme-outline mw-1200 mx-auto px-5 px-lg-0">
          <div className="col-12 row m-0">
            <div className="col-12 col-lg-8 details-div-border-right pe-lg-10">
              {/* Outline */}
              <div>
                <span className="criteria d-block">{t("programmeOutline")}</span>
                <div
                  className="mt-5"
                  dangerouslySetInnerHTML={{ __html: course.c_outline || "" }}
                />
              </div>

              {/* Core / Elective / Others tabs */}
              {(course.c_core || course.c_elective || course.c_other) && (
                <div className="mt-15">
                  <ul className="nav nav-pills mt-4 gap-5" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="me-5 nav-link options-toggle active" data-bs-toggle="pill" data-bs-target="#pills-core" type="button">{t("core")}</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="me-5 nav-link options-toggle" data-bs-toggle="pill" data-bs-target="#pills-elective" type="button">{t("elective")}</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link options-toggle" data-bs-toggle="pill" data-bs-target="#pills-others" type="button">{t("others")}</button>
                    </li>
                  </ul>
                  <div className="tab-content mt-5 mb-10" id="pills-tabContent">
                    <div className="tab-pane fade show active" id="pills-core" role="tabpanel">
                      <div className="col-12 mb-5" dangerouslySetInnerHTML={{ __html: course.c_core || "" }} />
                    </div>
                    <div className="tab-pane fade" id="pills-elective" role="tabpanel">
                      <div className="col-12 mb-5" dangerouslySetInnerHTML={{ __html: course.c_elective || "" }} />
                    </div>
                    <div className="tab-pane fade" id="pills-others" role="tabpanel">
                      <div className="col-12 mb-5" dangerouslySetInnerHTML={{ __html: course.c_other || "" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Entry requirements */}
              {course.c_entry_req && (
                <div className="mt-15">
                  <span className="criteria d-block">{t("entryRequirements")}</span>
                  <div className="mt-5" dangerouslySetInnerHTML={{ __html: course.c_entry_req }} />
                </div>
              )}

              {/* Level */}
              <div className="mt-10">
                <span className="uni-location">{t("level")}: {levelMap[course.c_level] || course.c_level}</span>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-12 col-lg-4 ps-lg-10 mt-10 mt-lg-0">
              {/* Fees */}
              <div className="course-details-div mb-8">
                <span className="criteria d-block mb-5" style={{ fontSize: 16 }}>{t("fees")}</span>
                {fees && fees.length > 0 ? (
                  fees.map((f) => (
                    <div key={f.cf_id} className="d-flex justify-content-between align-items-center mb-3">
                      <span className="uni-location">{f.cf_name}</span>
                      <span style={{ fontWeight: 600, color: "#1A124E" }}>{formatMoney(f.cf_amount)}</span>
                    </div>
                  ))
                ) : course.c_amount > 0 ? (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="uni-location">{t("totalFees")}</span>
                    <span style={{ fontWeight: 600, color: "#1A124E" }}>{formatMoney(course.c_amount)}</span>
                  </div>
                ) : (
                  <span className="uni-location">{t("contactForFees")}</span>
                )}
              </div>

              {/* CTAs */}
              <div className="d-flex flex-column gap-4">
                <Link href={`/course-application/${course.c_url_code || course.c_id}`} className="do-next-btn-1 text-center">
                  {t("applyNowUncap")}
                </Link>
                <Link href={`/consult-counsellor/${course.c_url_code || course.c_id}`} className="do-next-btn-2 text-center">
                  {t("consultOurCounsellor")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
