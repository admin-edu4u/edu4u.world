"use client";

import { CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";
import {
  CounsellorRequestForm,
  counsellorFormStyles,
  type CounsellorFormSummary,
  type Qualification,
} from "@/components/counsellor/CounsellorRequestForm";

const CloseSvg = () => (
  <X weight="light" size={24} color="white" />
);

export type ConsultCounsellorModalProps = {
  open: boolean;
  onClose: () => void;
  qualifications: Qualification[];
  courseId?: number | null;
  pathwayCharacterName?: string;
  defaultPreferredCourse?: string;
};

export function ConsultCounsellorModal({
  open,
  onClose,
  qualifications,
  courseId = null,
  pathwayCharacterName,
  defaultPreferredCourse,
}: ConsultCounsellorModalProps) {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSuccess(_summary: CounsellorFormSummary) {
    setSubmitted(true);
  }

  return (
    <>
      <style>{counsellorFormStyles}</style>
      <div
        className="modal fade edu-site-modal show"
        tabIndex={-1}
        role="dialog"
        aria-modal
        style={{ background: "rgba(0, 0, 0, 0.50)", display: "flex" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable edu-modal-dialog">
          <div className="modal-content br-12 edu-modal-content" style={{ padding: 24 }}>
            <div className="edu-sheet-handle" aria-hidden />
            <div className="modal-header p-0">
              <h3 className="modal-title login_title">{t("consultOurCounsellor")}</h3>
              <div
                className="btn btn-icon btn-sm ms-2 btn-close-modal"
                onClick={onClose}
                aria-label={t("ok")}
                role="button"
                tabIndex={0}
              >
                <CloseSvg />
              </div>
            </div>
            <div className="modal-body p-0 counsellor-form-shell">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "24px 8px 8px" }}>
                  <CheckCircle weight="fill" size={24} color="#29DC50" />
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1F1F1F", marginTop: 16 }}>{t("submitSuccess")}</p>
                  <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>{t("counsellorWillContact")}</p>
                  <button type="button" className="apply-scholarship-btn w-100 mt-5" onClick={onClose}>
                    {t("ok")}
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 20, lineHeight: 1.5 }}>
                    {pathwayCharacterName ? (
                      <>
                        {t("consultCounsellorLead")}{" "}
                        <strong>{pathwayCharacterName}</strong>.
                      </>
                    ) : (
                      t("consultCounsellorModalIntro")
                    )}
                  </p>
                  <CounsellorRequestForm
                    courseId={courseId}
                    qualifications={qualifications}
                    pathwayCharacterName={pathwayCharacterName}
                    defaultPreferredCourse={defaultPreferredCourse}
                    onSuccess={handleSuccess}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
