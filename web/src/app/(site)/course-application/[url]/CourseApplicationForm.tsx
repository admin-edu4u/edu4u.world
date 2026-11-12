"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { MalaysianPhoneInput } from "@/components/ui/MalaysianPhoneInput";
import { malaysianPhoneError } from "@/lib/phone";
import { useT } from "@/components/LocaleProvider";

type Qualification = { q_id: number; q_level: string };

interface Props {
  courseId: number;
  courseName: string;
  universityName: string;
  qualifications: Qualification[];
}

const YEAR = new Date().getFullYear();

const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

export default function CourseApplicationForm({ courseId, courseName, universityName, qualifications }: Props) {
  const t = useT();
  const router = useRouter();
  const months = useMemo(() => MONTH_KEYS.map((k) => t(k)), [t]);
  const yesNoOptions = useMemo(
    () => [
      { value: "1", label: t("yes") },
      { value: "2", label: t("no") },
    ],
    [t],
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDisability, setShowDisability] = useState(false);
  const [sameAddr, setSameAddr] = useState(false);
  const [summary, setSummary] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";

    const homeContact = get("home_contact_no");
    const mobile = get("contact_no");
    const emergencyContact = get("emergency_contact_no");
    const phoneErr =
      malaysianPhoneError(mobile, { label: t("mobileNumber") }) ||
      malaysianPhoneError(emergencyContact, { label: t("emergencyContactNo") }) ||
      malaysianPhoneError(homeContact, { optional: true, label: t("homePhoneNumber") });
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    setLoading(true);

    const body = {
      course_id: courseId,
      salutation: get("salutation"),
      name: get("name"),
      dob_date: get("dob_date"),
      dob_month: get("dob_month"),
      dob_year: get("dob_year"),
      ic_num: get("ic_num"),
      gender: get("gender"),
      nationality: get("nationality"),
      martial_status: get("martial_status"),
      ethnicity: get("ethnicity"),
      religion: get("religion"),
      home_contact_no: homeContact,
      contact_no: mobile,
      email: get("email"),
      emergency_contact_name: get("emergency_contact_name"),
      emergency_contact_no: emergencyContact,
      emergency_contact_email: get("emergency_contact_email"),
      relationship: get("relationship"),
      p_addr: get("p_addr"),
      p_city: get("p_city"),
      p_state: get("p_state"),
      p_country: get("p_country"),
      p_postcode: get("p_postcode"),
      m_addr: get("m_addr"),
      m_city: get("m_city"),
      m_state: get("m_state"),
      m_country: get("m_country"),
      m_postcode: get("m_postcode"),
      qualification: get("qualification"),
      school_name: get("school_name"),
      year_completion: get("year_completion"),
      credit_transfer: get("credit_transfer"),
      member_uni: get("member_uni"),
      english_q: get("english_q"),
      english_score: get("english_score"),
      english_year: get("english_year"),
      income: get("income"),
      programme_name: get("programme_name"),
      programme_month: get("programme_month"),
      programme_year: get("programme_year"),
      disability: get("disability"),
      disability_name: get("disability_name"),
    };

    const qualLabel = qualifications.find((q) => String(q.q_id) === body.qualification)?.q_level ?? body.qualification;

    setSummary({
      salutation: body.salutation,
      name: body.name,
      dob: `${body.dob_date}/${body.dob_month}/${body.dob_year}`,
      ic_num: body.ic_num,
      gender: body.gender === "1" ? t("male") : body.gender === "2" ? t("female") : body.gender,
      nationality: body.nationality === "1" ? t("malaysian") : body.nationality === "2" ? t("nonMalaysian") : body.nationality,
      martial_status:
        body.martial_status === "1" ? t("single") :
        body.martial_status === "2" ? t("married") :
        body.martial_status === "3" ? t("divorced") :
        body.martial_status === "4" ? t("widowed") : body.martial_status,
      ethnicity:
        body.ethnicity === "1" ? t("malay") :
        body.ethnicity === "2" ? t("chinese") :
        body.ethnicity === "3" ? t("indian") :
        body.ethnicity === "4" ? t("others") : body.ethnicity,
      religion:
        body.religion === "1" ? t("muslim") :
        body.religion === "2" ? t("christian") :
        body.religion === "3" ? t("hindus") :
        body.religion === "4" ? t("others") : body.religion,
      home_phone: body.home_contact_no || "-",
      mobile: body.contact_no,
      email: body.email,
      e_name: body.emergency_contact_name,
      e_contact: body.emergency_contact_no,
      e_email: body.emergency_contact_email,
      relationship:
        body.relationship === "1" ? t("parents") :
        body.relationship === "2" ? t("siblings") :
        body.relationship === "3" ? t("partner") :
        body.relationship === "4" ? t("others") : body.relationship,
      p_addr: body.p_addr, p_city: body.p_city, p_state: body.p_state,
      p_country: body.p_country, p_postcode: body.p_postcode,
      m_addr: body.m_addr || body.p_addr, m_city: body.m_city || body.p_city,
      m_state: body.m_state || body.p_state, m_country: body.m_country || body.p_country,
      m_postcode: body.m_postcode || body.p_postcode,
      qualification: qualLabel,
      school_name: body.school_name, year_completion: body.year_completion,
      credit_transfer: body.credit_transfer === "1" ? t("yes") : body.credit_transfer === "2" ? t("no") : body.credit_transfer,
      member_uni: body.member_uni === "1" ? t("yes") : body.member_uni === "2" ? t("no") : body.member_uni,
      english_q:
        body.english_q === "1" ? "MUET" :
        body.english_q === "2" ? "IELTS" :
        body.english_q === "3" ? "TOEFL" :
        body.english_q === "4" ? "GCSE/GCE 'O' Level" : body.english_q,
      english_score: body.english_score, english_year: body.english_year,
      income:
        body.income === "1" ? t("incomeBelow4000") :
        body.income === "2" ? t("incomeBelow8000") :
        body.income === "3" ? t("incomeAbove8000") : body.income,
      programme_name: body.programme_name,
      programme_month: months[Number(body.programme_month) - 1] ?? body.programme_month,
      programme_year: body.programme_year,
      disability: body.disability === "1" ? t("yes") : body.disability === "2" ? t("no") : body.disability,
      disability_desc: body.disability_name || "-",
    });

    try {
      const res = await fetch("/api/course-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("somethingWentWrong"));
        setLoading(false);
        return;
      }
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="sucess-submission pt-10">
        <div className="success-icon-wrap">
          <CheckCircle weight="fill" size={24} color="#29DC50" />
        </div>
        <span className="pt-3 d-block visit-campus-text">{t("applicationSubmitted")}</span>
        <span className="d-block uni-name pt-3">{t("counsellorWillContact")}</span>
        <span className="d-block pt-20 submission-details-text" style={{ paddingTop: "40px" }}>{t("submitDetails")}</span>

        <div style={{ maxWidth: 560, margin: "20px auto 0" }}>
          <div className="submission-div">
            <SummarySection title={`1. ${t("personalDetails")}`} rows={[
              [t("salutation"), summary.salutation],
              [t("fullName"), summary.name],
              [t("dateOfBirth"), summary.dob],
              [t("nricPassport"), summary.ic_num],
              [t("gender"), summary.gender],
              [t("nationality"), summary.nationality],
              [t("martialStatus"), summary.martial_status],
              [t("ethnicity"), summary.ethnicity],
              [t("religion"), summary.religion],
              [t("homePhoneNumber"), summary.home_phone],
              [t("mobileNumber"), summary.mobile],
              [t("emailAddr"), summary.email],
            ]} />
            <SummarySection title={`2. ${t("emergencyContact")}`} rows={[
              [t("name"), summary.e_name],
              [t("contactNum"), summary.e_contact],
              [t("emailAddr"), summary.e_email],
              [t("relationship"), summary.relationship],
            ]} />
            <SummarySection title={`3. ${t("permanentAddr")}`} rows={[
              [t("addr"), summary.p_addr],
              [t("cityTown"), summary.p_city],
              [t("state"), summary.p_state],
              [t("country"), summary.p_country],
              [t("postCode"), summary.p_postcode],
            ]} />
            <SummarySection title={`4. ${t("mailingAddr")}`} rows={[
              [t("addr"), summary.m_addr],
              [t("cityTown"), summary.m_city],
              [t("state"), summary.m_state],
              [t("country"), summary.m_country],
              [t("postCode"), summary.m_postcode],
            ]} />
            <SummarySection title={`5. ${t("lastAcademic")}`} rows={[
              [t("nameQualification"), summary.qualification],
              [t("schoolInstitutionName"), summary.school_name],
              [t("yearCompletion"), summary.year_completion],
              [t("applyCreditTransfer"), summary.credit_transfer],
              [t("firstInFamilyUniversity"), summary.member_uni],
            ]} />
            <SummarySection title={`6. ${t("engQualification")}`} rows={[
              [t("nameQualification"), summary.english_q],
              [t("score"), summary.english_score],
              [t("yearTaken"), summary.english_year],
            ]} />
            <SummarySection title={`7. ${t("householdIncome")}`} rows={[
              [t("totalIncome"), summary.income],
            ]} />
            <SummarySection title={`8. ${t("programmePreferrences")}`} rows={[
              [t("programmeName"), summary.programme_name],
              [t("intakeMonth"), summary.programme_month],
              [t("intakeYear"), summary.programme_year],
            ]} />
            <SummarySection title={`9. ${t("disability")}`} rows={[
              [t("hasDisability"), summary.disability],
              [t("summaryDetails"), summary.disability_desc],
            ]} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="btn-submit-visit-form" style={{ maxWidth: 260 }} onClick={() => router.push("/")}>
              {t("backToHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-form">
      <span className="d-block visit-campus-text">{t("courseApplication")}</span>
      <span className="d-block uni-name pt-3">{t("courseApplicationIntro")}</span>

      <div style={{ maxWidth: 560, margin: "20px auto 0" }} className="course-application-div">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <span className="course-application-text-1" style={{ minWidth: 120 }}>{t("institution")}</span>
          <span className="course-application-text-2">{universityName}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="course-application-text-1" style={{ minWidth: 120 }}>{t("course")}</span>
          <span className="course-application-text-2">{courseName}</span>
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: 560, margin: "12px auto 0", background: "#fff0f0", border: "1px solid #f88", borderRadius: 8, padding: "12px 16px", color: "#c00", fontSize: 14 }}>
          {error}
        </div>
      )}

      <form id="course_application_form" onSubmit={handleSubmit}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>

          <div className="separator-top mt-10 mb-5">
            <span className="d-block application-title mb-5 ms-3" style={{ paddingTop: 20 }}>1. {t("personalDetails")}</span>
          </div>
          <FormSelect name="salutation" label={t("salutation")} placeholder={t("selectSalutation")} required options={[
            { value: "Mr", label: t("mr") },
            { value: "Ms", label: t("ms") },
            { value: "Mrs", label: t("mrs") },
          ]} />
          <FormInput name="name" label={t("fullName")} placeholder={t("enterFullname")} required />
          <div className="mb-5">
            <label className="form-label">{t("dateOfBirth")}</label>
            <div className="row">
              <div className="col-4">
                <input type="text" name="dob_date" className="form-control-solid" placeholder={t("dd")} required maxLength={2} style={{ padding: "18px 16px", borderRadius: 8, backgroundColor: "#F6F6F6", border: "1px solid #E4E4E4", fontSize: 14, width: "100%", outline: "none" }} />
              </div>
              <div className="col-4">
                <input type="text" name="dob_month" className="form-control-solid" placeholder={t("mm")} required maxLength={2} style={{ padding: "18px 16px", borderRadius: 8, backgroundColor: "#F6F6F6", border: "1px solid #E4E4E4", fontSize: 14, width: "100%", outline: "none" }} />
              </div>
              <div className="col-4">
                <input type="text" name="dob_year" className="form-control-solid" placeholder={t("yyyy")} required maxLength={4} style={{ padding: "18px 16px", borderRadius: 8, backgroundColor: "#F6F6F6", border: "1px solid #E4E4E4", fontSize: 14, width: "100%", outline: "none" }} />
              </div>
            </div>
          </div>
          <FormInput name="ic_num" label={t("nricPassportNumber")} placeholder={t("enterNricOrPassport")} required />
          <FormSelect name="gender" label={t("gender")} placeholder={t("selectGender")} required options={[
            { value: "1", label: t("male") },
            { value: "2", label: t("female") },
          ]} />
          <FormSelect name="nationality" label={t("nationality")} placeholder={t("selectNationality")} required options={[
            { value: "1", label: t("malaysian") },
            { value: "2", label: t("nonMalaysian") },
          ]} />
          <FormSelect name="martial_status" label={t("martialStatus")} placeholder={t("selectMaritalStatus")} required options={[
            { value: "1", label: t("single") },
            { value: "2", label: t("married") },
            { value: "3", label: t("divorced") },
            { value: "4", label: t("widowed") },
          ]} />
          <FormSelect name="ethnicity" label={t("ethnicity")} placeholder={t("selectEthnicity")} required options={[
            { value: "1", label: t("malay") },
            { value: "2", label: t("chinese") },
            { value: "3", label: t("indian") },
            { value: "4", label: t("others") },
          ]} />
          <FormSelect name="religion" label={t("religion")} placeholder={t("selectReligion")} required options={[
            { value: "1", label: t("muslim") },
            { value: "2", label: t("christian") },
            { value: "3", label: t("hindus") },
            { value: "4", label: t("others") },
          ]} />
          <FormPhone
            name="home_contact_no"
            label={<>{t("homePhoneNumber")} <span className="option-text">{t("optional")}</span></>}
          />
          <FormPhone name="contact_no" label={t("mobileNumber")} required />
          <FormInput name="email" label={t("emailAddr")} placeholder={t("enterEmailAddr")} required type="email" />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">2. {t("emergencyContact")}</span>
          </div>
          <FormInput name="emergency_contact_name" label={t("emergencyContactName")} placeholder={t("enterEmergencyContactName")} required />
          <FormPhone name="emergency_contact_no" label={t("emergencyContactNo")} required />
          <FormInput name="emergency_contact_email" label={t("emergencyContactEmailAddr")} placeholder={t("enterEmergencyContactEmailAddr")} required type="email" />
          <FormSelect name="relationship" label={t("relationship")} placeholder={t("selectRelationship")} required options={[
            { value: "1", label: t("parents") },
            { value: "2", label: t("siblings") },
            { value: "3", label: t("partner") },
            { value: "4", label: t("others") },
          ]} />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">3. {t("permanentAddr")}</span>
          </div>
          <FormInput name="p_addr" label={t("addr")} placeholder={t("enterAddr")} required />
          <FormInput name="p_city" label={t("cityTown")} placeholder={t("enterCityTown")} required />
          <FormInput name="p_state" label={t("state")} placeholder={t("enterState")} required />
          <FormInput name="p_country" label={t("country")} placeholder={t("enterCountry")} required />
          <FormInput name="p_postcode" label={t("postCode")} placeholder={t("enterPostCode")} required />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">4. {t("mailingAddr")}</span>
          </div>
          <div className="mb-5" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="is_same_addr"
              name="is_same_addr"
              className="form-check-input"
              checked={sameAddr}
              onChange={(e) => setSameAddr(e.target.checked)}
            />
            <label htmlFor="is_same_addr" className="p_addr_label">
              {t("pleaseTick")}
            </label>
          </div>
          {!sameAddr && (
            <>
              <FormInput name="m_addr" label={t("addr")} placeholder={t("enterAddr")} />
              <FormInput name="m_city" label={t("cityTown")} placeholder={t("enterCityTown")} />
              <FormInput name="m_state" label={t("state")} placeholder={t("enterState")} />
              <FormInput name="m_country" label={t("country")} placeholder={t("enterCountry")} />
              <FormInput name="m_postcode" label={t("postCode")} placeholder={t("enterPostCode")} />
            </>
          )}

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">5. {t("lastAcademic")}</span>
          </div>
          <FormSelect name="qualification" label={t("nameQualification")} placeholder={t("selectQualification")} required options={
            qualifications.map((q) => ({ value: String(q.q_id), label: q.q_level }))
          } />
          <div className="mb-5">
            <label className="form-label">
              {t("schoolInstitutionName")}
              <br />
              <span className="personality-counter" style={{ fontWeight: 400, fontSize: 12, color: "#999" }}>
                ({t("schoolNameExamples")})
              </span>
            </label>
            <input type="text" name="school_name" className="form-control-solid" placeholder={t("enterSchoolInstitution")} required style={{ padding: "18px 16px", borderRadius: 8, backgroundColor: "#F6F6F6", border: "1px solid #E4E4E4", fontSize: 14, width: "100%", outline: "none" }} />
          </div>
          <FormInput name="year_completion" label={t("yearCompletion")} placeholder={t("enterYearCompletion")} required />
          <FormSelect name="credit_transfer" label={t("applyCreditTransfer")} placeholder={t("selectOption")} required options={yesNoOptions} />
          <FormSelect name="member_uni" label={t("firstInFamilyUniversity")} placeholder={t("selectOption")} required options={yesNoOptions} />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">{t("englishLangQualSection")}</span>
          </div>
          <FormSelect name="english_q" label={t("engQualification")} placeholder={t("selectQualification")} required options={[
            { value: "1", label: "MUET" },
            { value: "2", label: "IELTS" },
            { value: "3", label: "TOEFL" },
            { value: "4", label: "GCSE/GCE 'O' Level" },
          ]} />
          <FormInput name="english_score" label={t("score")} placeholder={t("enterScore")} required />
          <FormInput name="english_year" label={t("yearTaken")} placeholder={t("enterYearTaken")} required type="number" />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">7. {t("householdIncome")}</span>
          </div>
          <FormSelect name="income" label={t("totalIncome")} placeholder={t("selectTotalIncome")} required options={[
            { value: "1", label: t("incomeBelow4000") },
            { value: "2", label: t("incomeBelow8000") },
            { value: "3", label: t("incomeAbove8000") },
          ]} />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">8. {t("programmePreferrences")}</span>
          </div>
          <FormInput name="programme_name" label={t("programmeName")} placeholder={t("enterProgrammeName")} required />
          <FormSelect name="programme_month" label={t("intakeMonth")} placeholder={t("selectIntakeMonth")} required options={
            months.map((m, i) => ({ value: String(i + 1), label: m }))
          } />
          <FormSelect name="programme_year" label={t("intakeYear")} placeholder={t("selectIntakeYear")} required options={[
            { value: String(YEAR), label: String(YEAR) },
            { value: String(YEAR + 1), label: String(YEAR + 1) },
          ]} />

          <div className="separator-top mt-10 mb-5" style={{ paddingTop: 20 }}>
            <span className="d-block application-title mb-5 ms-3">9. {t("disability")}</span>
          </div>
          <FormSelect name="disability" label={t("disabilityAnyQuestion")} placeholder={t("selectOption")} required options={yesNoOptions} onChange={(v) => setShowDisability(v === "1")} />
          {showDisability && (
            <FormInput name="disability_name" label={t("pleaseSpecify")} placeholder={t("describeDisability")} />
          )}

          <button className="btn-submit-visit-form" type="submit" disabled={loading}>
            {loading ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- Shared sub-components ---- */

const phoneInputStyle: React.CSSProperties = {
  padding: "18px 16px",
  borderRadius: 8,
  backgroundColor: "#F6F6F6",
  border: "1px solid #E4E4E4",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

function FormInput({
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: React.ReactNode;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="mb-5">
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        className="form-control-solid"
        placeholder={placeholder}
        required={required}
        style={phoneInputStyle}
      />
    </div>
  );
}

function FormPhone({
  name,
  label,
  required,
}: {
  name: string;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-5">
      <label className="form-label">{label}</label>
      <MalaysianPhoneInput
        name={name}
        className="form-control-solid"
        required={required}
        style={phoneInputStyle}
      />
    </div>
  );
}

function FormSelect({
  name,
  label,
  placeholder,
  required,
  options,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="form-label">{label}</label>
      <SearchableSelect
        name={name}
        required={required}
        placeholder={placeholder}
        options={options}
        onChange={onChange ? (v) => onChange(String(v)) : undefined}
        inputClassName="form-control form-control-solid"
      />
    </div>
  );
}

function SummarySection({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <>
      <span className="course-application-details-header d-block" style={{ marginBottom: 12, marginTop: 20 }}>{title}</span>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "flex", marginBottom: 8 }}>
          <span className="submission-user-label" style={{ minWidth: 200 }}>{label}</span>
          <span className="submission-user-details">{value || "-"}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid #E4E4E4", marginTop: 12 }} />
    </>
  );
}
