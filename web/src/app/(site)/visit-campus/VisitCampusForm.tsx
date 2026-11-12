"use client";

import { CheckCircle, Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { MalaysianPhoneInput } from "@/components/ui/MalaysianPhoneInput";
import { useT } from "@/components/LocaleProvider";
import { malaysianPhoneError } from "@/lib/phone";

type University = { u_id: number; u_name: string };

const YEAR = new Date().getFullYear();

export default function VisitCampusForm({ universities }: { universities: University[] }) {
  const t = useT();
  const [pax, setPax] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const monthKeys = useMemo(
    () =>
      [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ] as const,
    [],
  );

  const months = useMemo(() => monthKeys.map((key) => t(key)), [monthKeys, t]);

  const timeOptions = useMemo(
    () => ({
      "1": t("timeSlot1"),
      "2": t("timeSlot2"),
      "3": t("timeSlot3"),
      "4": t("timeSlot4"),
    }),
    [t],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const contactNo = String(fd.get("contact_no") || "");
    const phoneErr = malaysianPhoneError(contactNo, { label: t("contactNumber") });
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    setLoading(true);
    const body = {
      vc_uni_id: fd.getAll("university[]").join(","),
      vc_salutation: fd.get("salutation"),
      vc_name: fd.get("full_name"),
      vc_ic_num: fd.get("ic_num"),
      vc_contact_no: contactNo,
      vc_pax: pax,
      vc_date: Number(fd.get("date") || 0),
      vc_month: Number(fd.get("month") || 0),
      vc_year: Number(fd.get("year") || 0),
      vc_time: Number(fd.get("time") || 0),
      vc_remarks: fd.get("remarks"),
    };
    setFormData({
      uni_name: universities
        .filter((u) => body.vc_uni_id.split(",").includes(String(u.u_id)))
        .map((u) => u.u_name)
        .join(", "),
      full_name: String(body.vc_name),
      ic_num: String(body.vc_ic_num),
      contact_num: String(body.vc_contact_no),
      preferred_date: `${body.vc_date} ${months[(body.vc_month as number) - 1] || ""} ${body.vc_year}`,
      preferred_time: timeOptions[String(body.vc_time) as keyof typeof timeOptions] || String(body.vc_time),
    });
    try {
      const res = await fetch("/api/visit-campus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError(t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="sucess-submission text-center py-20">
        <div className="text-center">
          <CheckCircle weight="fill" size={24} color="#29DC50" />
        </div>
        <span className="pt-3 d-block visit-campus-text">{t("submitSuccess")}</span>
        <span className="d-block uni-name text-center pt-3">{t("submitWhatsapp")}</span>
        <span className="d-block pt-20 submission-details-text">{t("submitDetails")}</span>

        <div className="col-12 col-lg-6 mx-auto mt-5">
          <div className="submission-div">
            {[
              [t("uniPreference"), formData.uni_name],
              [t("fullName"), formData.full_name],
              [t("icNumber"), formData.ic_num],
              [t("contactNumber"), formData.contact_num],
              [t("preferredDate"), formData.preferred_date],
              [t("preferredTime"), formData.preferred_time],
            ].map(([label, value]) => (
              <div className="col-12 row" key={String(label)}>
                <div className="col-4 text-start">
                  <span className="submission-user-label">{label}</span>
                </div>
                <div className="col-8 text-end">
                  <span className="submission-user-details">{value}</span>
                </div>
                <div className="separator my-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-form">
      <span className="d-block visit-campus-text">{t("campusVisit")}</span>
      <span className="d-block uni-name text-center pt-3">{t("visitFormDesc")}</span>
      <form id="visit_campus_form" onSubmit={handleSubmit}>
        <div className="col-12 col-lg-4 mx-auto">

          <div className="mt-10 mb-5">
            <label className="form-label">{t("uniPreference")}</label>
            <SearchableSelect
              name="university[]"
              multiple
              required
              placeholder={t("searchUni")}
              inputClassName="form-control form-control-solid"
              options={universities.map((u) => ({ value: String(u.u_id), label: u.u_name }))}
            />
            <span className="uni-location d-block mt-2" style={{ fontSize: 12 }}>
              {t("searchSelectUnis")}
            </span>
          </div>

          <div className="mb-5">
            <label className="form-label">{t("salutation")}</label>
            <SearchableSelect
              name="salutation"
              required
              placeholder={t("selectSalutation")}
              inputClassName="form-control form-control-solid"
              options={[
                { value: "Mr", label: t("mr") },
                { value: "Ms", label: t("ms") },
                { value: "Mrs", label: t("mrs") },
              ]}
            />
          </div>

          <div className="mb-5">
            <label className="form-label">{t("fullName")}</label>
            <input type="text" name="full_name" className="form-control form-control-solid" placeholder={t("enterFullname")} required />
          </div>

          <div className="mb-5">
            <label className="form-label">{t("icNumber")}</label>
            <input type="text" name="ic_num" className="form-control form-control-solid" placeholder={t("enterICNum")} required />
          </div>

          <div className="mb-5">
            <label className="form-label">{t("contactNumber")}</label>
            <MalaysianPhoneInput name="contact_no" className="form-control form-control-solid" required />
          </div>

          <div className="mb-5">
            <label className="form-label">{t("numberOfPax")}</label>
            <div className="d-flex align-items-center gap-4">
              <button
                type="button"
                className="btn btn-icon btn-outline"
                onClick={() => setPax((p) => Math.max(1, p - 1))}
                style={{ border: "1px solid #1A124E", borderRadius: "50%", width: 36, height: 36 }}
              >
                <Minus weight="light" size={24} color="#999999" />
              </button>
              <input type="text" name="pax" className="form-control text-center" readOnly value={pax} style={{ width: 60, border: 0 }} />
              <button
                type="button"
                className="btn btn-icon btn-outline"
                onClick={() => setPax((p) => p + 1)}
                style={{ border: "1px solid #1A124E", borderRadius: "50%", width: 36, height: 36, background: "#1A124E" }}
              >
                <Plus weight="light" size={24} color="white" />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label">{t("preferredDate")}</label>
            <span className="d-block uni-location pb-5" style={{ fontSize: 12 }}>
              {t("preferredDateHint")}
            </span>
            <div className="col-12 row g-2">
              <div className="col-4">
                <SearchableSelect
                  name="date"
                  required
                  placeholder={t("day")}
                  inputClassName="form-control form-control-solid"
                  options={Array.from({ length: 31 }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  }))}
                />
              </div>
              <div className="col-4">
                <SearchableSelect
                  name="month"
                  required
                  placeholder={t("month")}
                  inputClassName="form-control form-control-solid"
                  options={months.map((m, i) => ({ value: String(i + 1), label: m }))}
                />
              </div>
              <div className="col-4">
                <SearchableSelect
                  name="year"
                  required
                  placeholder={t("vcyear")}
                  inputClassName="form-control form-control-solid"
                  options={[
                    { value: String(YEAR), label: String(YEAR) },
                    { value: String(YEAR + 1), label: String(YEAR + 1) },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label">{t("preferredTime")}</label>
            <span className="d-block uni-location pb-5" style={{ fontSize: 12 }}>
              {t("preferredTimeHint")}
            </span>
            <SearchableSelect
              name="time"
              required
              placeholder={t("searchTime")}
              inputClassName="form-control form-control-solid"
              options={Object.entries(timeOptions).map(([val, label]) => ({
                value: val,
                label,
              }))}
            />
          </div>

          <div className="mb-5">
            <label className="form-label">{t("remarks")}</label>
            <textarea className="form-control form-control-solid" name="remarks" rows={3} placeholder={t("enterRemarks")} />
          </div>

          {error && <p style={{ color: "red", fontSize: 14, marginBottom: 8 }}>{error}</p>}

          <button type="submit" className="w-100 mt-5 btn-submit-visit-form" disabled={loading}>
            {loading ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
