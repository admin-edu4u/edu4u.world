"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { useT } from "@/components/LocaleProvider";

type Course = {
  c_id: number;
  c_url_code: string | null;
  c_name: string;
  c_uni: number;
  c_level: number;
  c_duration: number;
  c_award: string | null;
  c_amount: number;
  u_name?: string;
  u_country?: string;
  u_state?: string;
};

const levelMap: Record<number, string> = {
  1: "Foundation / Pre-U",
  2: "Diploma",
  3: "Advanced Diploma",
  4: "Degree",
  5: "Masters",
  6: "PhD",
  7: "Professional",
};

export default function CompareCourseClient({ allCourses }: { allCourses: Course[] }) {
  const t = useT();
  const [selected, setSelected] = useState<(Course | null)[]>([null, null, null]);
  const [modalSlot, setModalSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  function openModal(slot: number) {
    setSearch("");
    setModalSlot(slot);
  }

  function pickCourse(course: Course) {
    if (modalSlot === null) return;
    const next = [...selected];
    next[modalSlot] = course;
    setSelected(next);
    setModalSlot(null);
  }

  function removeCourse(slot: number) {
    const next = [...selected];
    next[slot] = null;
    setSelected(next);
  }

  const filtered = allCourses.filter((c) =>
    search.length === 0 ||
    c.c_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.u_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const rows: { label: string; key: keyof Course | ((c: Course) => string) }[] = useMemo(
    () => [
      { label: t("country"), key: (c) => c.u_country || t("malaysia") },
      { label: t("state"), key: (c) => c.u_state || "-" },
      { label: t("fieldOfStudy"), key: "c_name" },
      { label: t("level"), key: (c) => levelMap[c.c_level] || `${t("level")} ${c.c_level}` },
      {
        label: t("durationLabel"),
        key: (c) => `${c.c_duration} ${t("monthsWord")}`,
      },
      { label: t("award"), key: (c) => c.c_award || "-" },
      { label: t("fees"), key: (c) => (c.c_amount > 0 ? formatMoney(c.c_amount) : "-") },
    ],
    [t],
  );

  return (
    <div className="mw-1200 mx-auto pt-80 pb-20 px-5 px-lg-0">
      <style>{`
        .compare-course-table th { vertical-align: middle; }
        .compare-course-table .compare-label-cell { text-align: left; padding: 18px 16px; }
        .compare-course-table .compare-value-cell { text-align: center; padding: 18px 16px; }
        .table-sub-header { font-size: 14px; font-weight: 700; color: #1F1F1F; }
        .table-sub-text { font-size: 13px; font-weight: 500; color: #1F1F1F; }
        .table-border { border-left: 1px solid #E4E4E4; }
        .add-course { font-size: 13px; color: #999; margin-top: 8px; }
        .no-border { border: none; }
        .course-col-header { padding: 24px 20px; text-align: center; position: relative; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
        .course-col-title { font-size: 13px; font-weight: 600; color: #1F1F1F; text-align: center; line-height: 1.45; max-width: 100%; padding: 0 28px; }
        .course-col-uni { font-size: 12px; color: #999; text-align: center; line-height: 1.4; }
        .course-remove-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; cursor: pointer; color: #999; font-size: 20px; line-height: 1; padding: 4px; }
        .compare-add-slot { padding: 32px 16px; }
        .apply-scholarship-btn { border: 2px solid #1A124E !important; border-radius: 8px; padding: 10px 20px; background: #1A124E; color: white; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-block; }
        .apply-scholarship-btn:hover { background-color: white !important; color: #1A124E !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal-box { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
        .modal-header-bar { padding: 16px 20px; border-bottom: 1px solid #E4E4E4; font-weight: 700; font-size: 16px; }
        .modal-search { padding: 12px 20px; border-bottom: 1px solid #E4E4E4; }
        .modal-list { overflow-y: auto; flex: 1; }
        .modal-item { padding: 12px 20px; cursor: pointer; border-bottom: 1px solid #F0F0F0; font-size: 14px; }
        .modal-item:hover { background: #F8F8FF; }
        .modal-footer { padding: 12px 20px; border-top: 1px solid #E4E4E4; text-align: center; position: sticky; bottom: 0; background: white; }
        @media (max-width: 991.98px) {
          .modal-overlay { align-items: flex-end; justify-content: center; padding: 0; }
          .modal-box { width: 100%; max-width: 100%; border-radius: 20px 20px 0 0; max-height: min(92vh, 860px); padding-bottom: env(safe-area-inset-bottom, 0px); }
        }
        [data-kt-button="true"] { transition: box-shadow 0.3s ease; border-radius: 1rem; }
        [data-kt-button="true"]:hover { box-shadow: 0 0 10px rgba(0,0,0,0.4); }
        .btn-uni-filter { padding: 24px !important; border-radius: 12px !important; border: 1px solid #E4E4E4 !important; background: #FFF !important; }
        .visit-campus-text { font-size: 24px; font-weight: 700; color: #1F1F1F; }
      `}</style>

      <span className="d-block visit-campus-text text-start">{t("compareCoursesTitle")}</span>

      <div style={{ overflowX: "auto" }}>
        <table className="compare-course-table mt-10 w-100" style={{ borderCollapse: "collapse" }}>
          {/* Header row */}
          <tbody>
            <tr className="no-border">
              <th className="table-sub-header table-border compare-label-cell" style={{ width: "25%" }}>{t("basicInformation")}</th>
              {[0, 1, 2].map((slot) => (
                <th key={slot} className="table-border compare-value-cell p-0" style={{ width: "25%" }}>
                  {selected[slot] ? (
                    <div className="course-col-header">
                      <button
                        type="button"
                        className="course-remove-btn"
                        onClick={() => removeCourse(slot)}
                        aria-label={t("remove")}
                      >
                        &times;
                      </button>
                      <span className="course-col-title">{selected[slot]!.c_name}</span>
                      {selected[slot]!.u_name && (
                        <span className="course-col-uni">{selected[slot]!.u_name}</span>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-center compare-add-slot"
                      onClick={() => openModal(slot)}
                      style={{ cursor: "pointer" }}
                      id={`add_course${slot + 1}`}
                    >
                      <Plus weight="light" size={24} color="#999999" />
                      <span className="d-block add-course">{t("addCourse")}</span>
                    </div>
                  )}
                </th>
              ))}
            </tr>

            {/* Data rows */}
            {rows.map((row, ri) => (
              <tr key={ri}>
                <th className="table-sub-text table-border compare-label-cell">{row.label}</th>
                {[0, 1, 2].map((slot) => (
                  <th
                    key={slot}
                    className={`table-sub-text compare-value-cell ${slot < 2 ? "table-border" : ""}`}
                    style={slot === 2 ? { borderRight: 0 } : {}}
                  >
                    {selected[slot]
                      ? typeof row.key === "function"
                        ? row.key(selected[slot]!)
                        : String(selected[slot]![row.key] ?? "-")
                      : ""}
                  </th>
                ))}
              </tr>
            ))}

            {/* Apply row */}
            <tr>
              <th className="table-sub-header table-border compare-label-cell">{t("application")}</th>
              {[0, 1, 2].map((slot) => (
                <th
                  key={slot}
                  className={`table-sub-text compare-value-cell ${slot < 2 ? "table-border" : ""}`}
                  style={slot === 2 ? { borderRight: 0 } : {}}
                >
                  {selected[slot] && (
                    <Link
                      href={`/course-application/${selected[slot]!.c_url_code || selected[slot]!.c_id}`}
                      className="apply-scholarship-btn"
                    >
                      {t("applyNowUncap")}
                    </Link>
                  )}
                </th>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalSlot !== null && (
        <div className="modal-overlay" onClick={() => setModalSlot(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">{t("selectCourseCap")}</div>
            <div className="modal-search">
              <input
                type="text"
                placeholder={t("searchCoursesPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
                style={{ border: "1px solid #E4E4E4", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%" }}
                autoFocus
              />
            </div>
            <div className="modal-list">
              {filtered.length === 0 && (
                <div className="modal-item" style={{ color: "#999" }}>{t("noCoursesFound")}</div>
              )}
              {filtered.map((c) => (
                <div key={c.c_id} className="modal-item" onClick={() => pickCourse(c)}>
                  <span style={{ fontWeight: 600 }}>{c.c_name}</span>
                  {c.u_name && (
                    <span style={{ color: "#999", fontSize: 12, display: "block" }}>{c.u_name}</span>
                  )}
                  <span style={{ color: "#1A124E", fontSize: 12 }}>
                    {levelMap[c.c_level] || ""}{c.c_duration > 0 ? ` · ${c.c_duration} ${t("monthsWord")}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setModalSlot(null)}
                style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 1000, width: 44, height: 44, cursor: "pointer", color: "white", fontSize: 20, lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
