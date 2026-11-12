"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import {
  CounsellorRequestForm,
  counsellorFormStyles,
  type CounsellorFormSummary,
  type Qualification,
} from "@/components/counsellor/CounsellorRequestForm";

interface Props {
  courseId: number;
  courseName: string;
  universityName: string;
  qualifications: Qualification[];
}

export default function ConsultCounsellorForm({ courseId, courseName, universityName, qualifications }: Props) {
  const t = useT();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<CounsellorFormSummary>({});

  if (submitted) {
    return (
      <div style={{ paddingTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CheckCircle weight="fill" size={24} color="#29DC50" />
        </div>
        <span className="visit-campus-text" style={{ display: "block", paddingTop: 12 }}>{t("submitSuccess")}</span>
        <span className="uni-name" style={{ display: "block", paddingTop: 8 }}>{t("counsellorWillContact")}</span>
        <span className="submission-details-text" style={{ display: "block", paddingTop: 40 }}>{t("submitDetails")}</span>

        <div style={{ maxWidth: 560, margin: "20px auto 0" }}>
          <div className="submission-div">
            {[
              [t("salutation"), summary.salutation],
              [t("fullName"), summary.name],
              [t("gender"), summary.gender],
              [t("dateOfBirth"), summary.dob],
              [t("secondarySchool"), summary.school_name],
              [t("mobileNumber"), summary.contact_no],
              [t("homePhoneNumber"), summary.home_contact_no],
              [t("prefCourse"), summary.preferred_course],
              [t("highestQ"), summary.qualification],
              [t("remarks"), summary.remarks],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", marginBottom: 8 }}>
                <span className="submission-user-label" style={{ minWidth: 200 }}>{label}</span>
                <span className="submission-user-details">{value || "-"}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              className="btn-submit-visit-form"
              style={{ maxWidth: 260 }}
              onClick={() => router.push("/")}
            >
              {t("backToHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-form counsellor-form-shell" style={{ marginTop: 40 }}>
      <style>{counsellorFormStyles}</style>
      <span className="visit-campus-text" style={{ display: "block" }}>{t("consultOurCounsellor")}</span>
      <span className="uni-name" style={{ display: "block", paddingTop: 12 }}>
        {t("consultCounsellorLead")}{" "}
        <strong>{courseName}</strong> ({universityName}).
      </span>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <CounsellorRequestForm
          courseId={courseId}
          qualifications={qualifications}
          onSuccess={(s) => {
            setSummary(s);
            setSubmitted(true);
            window.scrollTo(0, 0);
          }}
        />
      </div>
    </div>
  );
}
