"use client";

import type { MemberProfilePayload } from "@/lib/member/profile";

type DocItem = { id: number; name: string; img: string; status?: number };

type Props = {
  data: MemberProfilePayload;
  t: (key: string) => string;
  documentStatusLabel: (status: number) => string;
  icFrontFile: File | null;
  icBackFile: File | null;
  resultFiles: File[];
  resumeFiles: File[];
  onIcFrontChange: (file: File | null) => void;
  onIcBackChange: (file: File | null) => void;
  onResultChange: (files: File[]) => void;
  onResumeChange: (files: File[]) => void;
  onRemoveDocument: (id: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  docMsg: string;
  docError: boolean;
  docSaving: boolean;
};

function translateText(t: (key: string) => string, key: string, fallback: string): string {
  const value = t(key);
  return value !== key ? value : fallback;
}

function statusVariant(status: number): "approved" | "rejected" | "pending" {
  if (status === 2) return "approved";
  if (status === 3) return "rejected";
  return "pending";
}

function formatChosenFiles(file: File | null, files: File[]): string {
  if (file) return file.name;
  if (files.length === 1) return files[0].name;
  if (files.length > 1) return `${files.length} files selected`;
  return "No file chosen";
}

function DocumentFileField({
  id,
  label,
  visibleLabel,
  multiple,
  accept,
  chosenLabel,
  onChange,
}: {
  id: string;
  label: string;
  visibleLabel?: string;
  multiple?: boolean;
  accept: string;
  chosenLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="edu-account-docs-field">
      {visibleLabel ? <span className="edu-account-docs-meta">{visibleLabel}</span> : null}
      <div className="edu-account-docs-upload">
        <label htmlFor={id} className="edu-account-docs-upload-btn">
          {multiple ? "Choose files" : "Choose file"}
        </label>
        <span className="edu-account-docs-file-name" title={chosenLabel}>
          {chosenLabel}
        </span>
        <input
          id={id}
          type="file"
          className="edu-account-docs-input-hidden"
          accept={accept}
          multiple={multiple}
          aria-label={label}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function UploadedFileRow({
  name,
  href,
  status,
  statusLabel,
  onRemove,
  removeLabel,
}: {
  name: string;
  href: string;
  status?: number;
  statusLabel?: string;
  onRemove?: () => void;
  removeLabel: string;
}) {
  return (
    <div className="edu-account-docs-row">
      <div className="edu-account-docs-row-main">
        <a href={href} target="_blank" rel="noreferrer" className="edu-account-docs-link">
          {name}
        </a>
        {status !== undefined && statusLabel ? (
          <span className={`edu-account-docs-status edu-account-docs-status--${statusVariant(status)}`}>
            {statusLabel}
          </span>
        ) : null}
      </div>
      {onRemove ? (
        <button type="button" className="edu-account-docs-remove" onClick={onRemove}>
          {removeLabel}
        </button>
      ) : null}
    </div>
  );
}

export function MemberAccountDocumentsPanel({
  data,
  t,
  documentStatusLabel,
  icFrontFile,
  icBackFile,
  resultFiles,
  resumeFiles,
  onIcFrontChange,
  onIcBackChange,
  onResultChange,
  onResumeChange,
  onRemoveDocument,
  onSubmit,
  docMsg,
  docError,
  docSaving,
}: Props) {
  const frontIc = data.details.ic_front[0];
  const backIc = data.details.ic_back[0];
  const frontIcLabel = translateText(t, "frontIC", "Front of IC");
  const backIcLabel = translateText(t, "backIC", "Back of IC");
  const fileTypesHint = translateText(
    t,
    "uploadDoscDesc",
    "Only jpg, png or pdf below 5mb are supported",
  );

  return (
    <div className="edu-profile-panel edu-account-docs" id="document_profile">
      <form className="edu-account-docs-form" onSubmit={onSubmit}>
        <section className="edu-account-docs-section">
          <h2 className="edu-account-docs-heading">{t("verificationDocument")}</h2>
          <p className="edu-account-docs-lead">{t("uploadVerificationDocument")}</p>

          {(frontIc || backIc) && (
            <div className="edu-account-docs-existing">
              {frontIc ? (
                <UploadedFileRow
                  name={frontIcLabel}
                  href={frontIc.img}
                  status={frontIc.status}
                  statusLabel={documentStatusLabel(frontIc.status)}
                  removeLabel={t("removeDocument")}
                />
              ) : null}
              {backIc ? (
                <UploadedFileRow
                  name={backIcLabel}
                  href={backIc.img}
                  status={backIc.status}
                  statusLabel={documentStatusLabel(backIc.status)}
                  removeLabel={t("removeDocument")}
                />
              ) : null}
            </div>
          )}

          <div className="edu-account-docs-grid-2">
            <DocumentFileField
              id="account_ic_front"
              label={frontIcLabel}
              visibleLabel={frontIcLabel}
              accept=".jpg,.jpeg,.png,.pdf"
              chosenLabel={formatChosenFiles(icFrontFile, [])}
              onChange={(e) => onIcFrontChange(e.target.files?.[0] ?? null)}
            />
            <DocumentFileField
              id="account_ic_back"
              label={backIcLabel}
              visibleLabel={backIcLabel}
              accept=".jpg,.jpeg,.png,.pdf"
              chosenLabel={formatChosenFiles(icBackFile, [])}
              onChange={(e) => onIcBackChange(e.target.files?.[0] ?? null)}
            />
          </div>
          <p className="edu-account-docs-meta edu-account-docs-meta--tight">{fileTypesHint}</p>
        </section>

        <section className="edu-account-docs-section">
          <h2 className="edu-account-docs-heading">{t("proofAcademic")}</h2>
          <p className="edu-account-docs-lead">{t("uploadTranscript")}</p>
          {data.details.result.length > 0 ? (
            <div className="edu-account-docs-existing">
              {data.details.result.map((doc: DocItem) => (
                <UploadedFileRow
                  key={doc.id}
                  name={doc.name}
                  href={doc.img}
                  onRemove={() => void onRemoveDocument(doc.id)}
                  removeLabel={t("removeDocument")}
                />
              ))}
            </div>
          ) : null}
          <DocumentFileField
            id="account_result_files"
            label={translateText(t, "uploadTranscript", "Upload transcript")}
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            chosenLabel={formatChosenFiles(null, resultFiles)}
            onChange={(e) => onResultChange(Array.from(e.target.files ?? []))}
          />
        </section>

        <section className="edu-account-docs-section">
          <h2 className="edu-account-docs-heading">{t("myResume")}</h2>
          <p className="edu-account-docs-lead">
            {translateText(t, "uploadResumeDocument", "Upload your resume to unlock more features.")}
          </p>
          {data.details.resume.length > 0 ? (
            <div className="edu-account-docs-existing">
              {data.details.resume.map((doc: DocItem) => (
                <UploadedFileRow
                  key={doc.id}
                  name={doc.name}
                  href={doc.img}
                  onRemove={() => void onRemoveDocument(doc.id)}
                  removeLabel={t("removeDocument")}
                />
              ))}
            </div>
          ) : null}
          <DocumentFileField
            id="account_resume_files"
            label={translateText(t, "uploadResume", "Upload resume")}
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            chosenLabel={formatChosenFiles(null, resumeFiles)}
            onChange={(e) => onResumeChange(Array.from(e.target.files ?? []))}
          />
        </section>

        <div className="edu-account-docs-footer">
          {docMsg ? (
            <p
              className={`edu-account-docs-feedback${docError ? " edu-account-docs-feedback--error" : " edu-account-docs-feedback--success"}`}
              role="status"
            >
              {docMsg}
            </p>
          ) : (
            <span className="edu-account-docs-footer-spacer" aria-hidden />
          )}
          <button type="submit" className="btn-submit-contact-us edu-account-docs-save" disabled={docSaving}>
            {docSaving ? t("loading") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
