"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { MemberProfilePayload } from "@/lib/member/profile";
import type { AccountSection } from "@/lib/member/accountSections";
import { accountSectionFromPath } from "@/lib/member/accountSections";
import {
  MemberAccountMobileNav,
  MemberAccountSidebar,
} from "@/components/member-account/MemberAccountSidebar";
import { MemberAccountDocumentsPanel } from "@/components/member-account/MemberAccountDocumentsPanel";
import { usePathname } from "next/navigation";

const CloseSvg = () => (
  <X weight="light" size={24} color="white" />
);

type Props = {
  /** @deprecated Section is derived from the URL when using account layout. */
  section?: AccountSection;
};

export function MemberAccountPage({ section: sectionProp }: Props = {}) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const section =
    sectionProp ?? accountSectionFromPath(pathname ?? "") ?? "account";
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MemberProfilePayload | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [docSaving, setDocSaving] = useState(false);
  const [docMsg, setDocMsg] = useState("");
  const [docError, setDocError] = useState(false);
  const [icFrontFile, setIcFrontFile] = useState<File | null>(null);
  const [icBackFile, setIcBackFile] = useState<File | null>(null);
  const [resultFiles, setResultFiles] = useState<File[]>([]);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  const loadProfile = useCallback(async () => {
    setSaveMsg("");
    try {
      const res = await fetch("/api/member/profile", { credentials: "include" });
      const json = (await res.json()) as MemberProfilePayload | { status: false };
      if (json.status && "details" in json) {
        setData(json);
        setName(json.details.name);
        setContact(json.details.contact_no);
        setPhotoPreview(json.details.profile_pic || "/assets/media/svg/avatars/blank_1.svg");
      }
    } catch {
      /* profile fetch failed; shell stays visible */
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("contact_no", contact);
      if (photoFile) form.set("profile_pic", photoFile);
      const res = await fetch("/api/member/profile", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const json = (await res.json()) as { status?: boolean; msg?: string };
      if (json.status) {
        setSaveMsg(t("saveSuccess") !== "saveSuccess" ? t("saveSuccess") : json.msg ?? "Saved");
        setPhotoFile(null);
        router.refresh();
        await loadProfile();
      } else {
        setSaveMsg(json.msg && t(json.msg) !== json.msg ? t(json.msg) : t("errSystem"));
      }
    } catch {
      setSaveMsg(t("networkError"));
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdError("");
    const fd = new FormData(e.currentTarget);
    setPwdSaving(true);
    try {
      const res = await fetch("/api/member/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curr_pass: fd.get("curr_pass"),
          pass: fd.get("pass"),
          confirm_pass: fd.get("confirm_pass"),
        }),
      });
      const json = (await res.json()) as { status?: boolean; msg?: string };
      if (json.status) {
        setPwdOpen(false);
        e.currentTarget.reset();
      } else {
        const msg = json.msg ?? "";
        setPwdError(msg && t(msg) !== msg ? t(msg) : msg || t("errSystem"));
      }
    } catch {
      setPwdError(t("networkError"));
    } finally {
      setPwdSaving(false);
    }
  };

  const documentStatusLabel = (status: number) => {
    if (status === 2) return t("documentApproved");
    if (status === 3) return t("documentRejectedUpload");
    return t("documentReviewing");
  };

  const onSaveDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocSaving(true);
    setDocMsg("");
    setDocError(false);
    try {
      const form = new FormData();
      if (icFrontFile) form.set("ic_front", icFrontFile);
      if (icBackFile) form.set("ic_back", icBackFile);
      resultFiles.forEach((f) => form.append("result[]", f));
      resumeFiles.forEach((f) => form.append("resume[]", f));
      const res = await fetch("/api/member/documents", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const json = (await res.json()) as { status?: boolean; msg?: string };
      if (json.status) {
        setDocMsg(t("documentSavedSuccess"));
        setIcFrontFile(null);
        setIcBackFile(null);
        setResultFiles([]);
        setResumeFiles([]);
        await loadProfile();
      } else {
        setDocError(true);
        const key = json.msg ?? "errSystem";
        setDocMsg(t(key) !== key ? t(key) : t("errSystem"));
      }
    } catch {
      setDocError(true);
      setDocMsg(t("networkError"));
    } finally {
      setDocSaving(false);
    }
  };

  const onRemoveDocument = async (id: number) => {
    setDocMsg("");
    setDocError(false);
    try {
      const res = await fetch(`/api/member/documents?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { status?: boolean };
      if (json.status) {
        await loadProfile();
      } else {
        setDocError(true);
        setDocMsg(t("errSystem"));
      }
    } catch {
      setDocError(true);
      setDocMsg(t("networkError"));
    }
  };

  return (
    <>
      <div className="edu-member-account-page">
        <div className="container edu-member-account-container">
          <h1 className="edu-member-account-title">{t("account")}</h1>
          <div className="edu-member-account-layout edu-profile-modal-layout">
            <MemberAccountMobileNav active={section} />
            <MemberAccountSidebar active={section} />
            <div className="edu-profile-main edu-member-account-main">
                    {section === "account" && (
                      <div className="edu-profile-panel" id="my_account">
                        <form id="update_user_form" onSubmit={onSaveAccount}>
                          <div
                            className="d-flex align-items-center image-input image-input-outline"
                            style={{
                              backgroundImage: "url('/assets/media/svg/avatars/blank_1.svg')",
                            }}
                          >
                            <div
                              className="image-input-wrapper w-100px h-100px modal-profile-img"
                              style={{
                                backgroundImage: `url('${photoPreview || "/assets/media/svg/avatars/blank_1.svg"}')`,
                              }}
                            />
                            <div className="ms-5 modal-upload-img">
                              <label>
                                <span>{t("uploadPhoto") !== "uploadPhoto" ? t("uploadPhoto") : "Upload photo"}</span>
                                <input
                                  type="file"
                                  name="profile_pic"
                                  accept=".png,.jpg,.jpeg"
                                  className="d-none"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;
                                    setPhotoFile(f);
                                    setPhotoPreview(URL.createObjectURL(f));
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="mt-10">
                            <div className="mb-8">
                              <label className="form-label modal-profile-title" htmlFor="profile_name">
                                {t("name")}
                              </label>
                              <input
                                type="text"
                                id="profile_name"
                                className="form-control form-control-solid"
                                name="name"
                                value={name}
                                placeholder={t("enterFullname")}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                            <div className="mb-8">
                              <label className="form-label modal-profile-title" htmlFor="profile_contact">
                                {t("phoneNumber")}
                              </label>
                              <input
                                type="tel"
                                id="profile_contact"
                                className="form-control form-control-solid"
                                name="contact_no"
                                value={contact}
                                placeholder={t("enterPhoneNum")}
                                onChange={(e) => setContact(e.target.value)}
                              />
                            </div>
                            <div className="mb-8">
                              <span className="modal-profile-title d-block">{t("emailPassword")}</span>
                              <span className="modal-email-desc d-block">
                                {t("youCanLogin")}
                                <a href={`mailto:${data?.details.email ?? ""}`}>{data?.details.email}</a>
                                {t("andYourPassword")}
                              </span>
                              <button
                                type="button"
                                className="modal-upload-img mt-3 chnage-pwd-btn"
                                onClick={() => setPwdOpen(true)}
                              >
                                {t("changePassword")}
                              </button>
                            </div>
                          </div>
                          {saveMsg ? <p className="text-success small">{saveMsg}</p> : null}
                          <button type="submit" className="btn-submit-contact-us float-end" disabled={saving}>
                            {saving ? t("loading") : t("save")}
                          </button>
                        </form>
                      </div>
                    )}

                    {section === "student-profile" && data && (
                      <div className="edu-profile-panel" id="student_profile">
                        <span className="modal-profile-title">{t("myAcademicResult")}</span>
                        <div id="academic_result_list" className="mt-3">
                          {data.result.length === 0 ? (
                            <p className="profile-character-desc">{t("noData") !== "noData" ? t("noData") : "—"}</p>
                          ) : (
                            <ul className="list-unstyled">
                              {data.result.map((r) => (
                                <li key={r.id} className="profile-character-desc">
                                  {r.name}: {r.grade}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span className="modal-profile-title d-block pt-10">{t("top3Characters")}</span>
                        <span className="d-block profile-character-desc pt-2">{t("selectCharacter")}</span>
                        <div className="mt-5 row g-3">
                          {data.character.map((c) => (
                            <div key={c.id} className="col-4 text-center">
                              {c.img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.img} alt="" className="character-img w-100" />
                              ) : null}
                              <span className="character-profile-title d-block mt-2">{c.name}</span>
                            </div>
                          ))}
                        </div>
                        <Link className="text-edit-pathway d-block pt-10" href="/characters">
                          {t("editProfile")}
                        </Link>
                      </div>
                    )}

                    {section === "documents" && data ? (
                      <MemberAccountDocumentsPanel
                        data={data}
                        t={t}
                        documentStatusLabel={documentStatusLabel}
                        icFrontFile={icFrontFile}
                        icBackFile={icBackFile}
                        resultFiles={resultFiles}
                        resumeFiles={resumeFiles}
                        onIcFrontChange={setIcFrontFile}
                        onIcBackChange={setIcBackFile}
                        onResultChange={setResultFiles}
                        onResumeChange={setResumeFiles}
                        onRemoveDocument={(id) => void onRemoveDocument(id)}
                        onSubmit={onSaveDocuments}
                        docMsg={docMsg}
                        docError={docError}
                        docSaving={docSaving}
                      />
                    ) : null}
                  </div>
            </div>
        </div>
      </div>

      {pwdOpen ? (
        <div
          className="modal fade edu-site-modal show"
          tabIndex={-1}
          id="profile_change_pwd_modal"
          role="dialog"
          aria-modal
          style={{ background: "rgba(0, 0, 0, 0.50)", display: "flex", zIndex: 1060 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPwdOpen(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered edu-modal-dialog">
            <div className="modal-content edu-modal-content" style={{ padding: 24 }}>
              <div className="modal-header p-0">
                <h3 className="modal-title">{t("changePassword")}</h3>
                <div
                  className="btn btn-icon btn-sm ms-2 btn-close-modal"
                  onClick={() => setPwdOpen(false)}
                  role="button"
                  tabIndex={0}
                  aria-label="Close"
                >
                  <CloseSvg />
                </div>
              </div>
              <div className="separator-top mt-4" />
              <div className="modal-body p-0 mt-8">
                <form id="forget_password_form" onSubmit={onChangePassword}>
                  {pwdError ? (
                    <p className="text-danger small mb-3" role="alert">
                      {pwdError}
                    </p>
                  ) : null}
                  <div className="mb-8">
                    <label className="form-label modal-profile-title">{t("currentPassword")}</label>
                    <PasswordInput
                      name="curr_pass"
                      placeholder={t("currentPassword")}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="mb-8">
                    <label className="form-label modal-profile-title">{t("newPassword")}</label>
                    <PasswordInput
                      name="pass"
                      placeholder={t("newPassword")}
                      autoComplete="new-password"
                    />
                    <div className="ms-3 mt-3">
                      <span className="pwd-guide">{t("newPasswordReq")}</span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <label className="form-label modal-profile-title">{t("repeatNewPassword")}</label>
                    <PasswordInput
                      name="confirm_pass"
                      placeholder={t("repeatNewPassword")}
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="w-100 apply-scholarship-btn" disabled={pwdSaving}>
                    {pwdSaving ? t("loading") : t("confirm")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
