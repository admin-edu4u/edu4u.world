"use client";

import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useSiteFlags, useT } from "@/components/LocaleProvider";
import { useMemberAuth } from "@/components/MemberAuthProvider";
import type { Locale } from "@/lib/i18n/config";
import { isValidEmail } from "@/lib/email";
import { signupPasswordErrorKey } from "@/lib/password";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ACCOUNT_ROUTES } from "@/lib/member/accountSections";

type ModalKind = "login" | "signup" | "pathway" | "language" | null;

const LANG_OPTIONS: { locale: Locale; label: string; native: string }[] = [
  { locale: "en", label: "EN", native: "English" },
  { locale: "ch", label: "中文", native: "简体中文" },
  { locale: "bm", label: "BM", native: "Bahasa Melayu" },
];

const CloseSvg = () => (
  <X weight="light" size={24} color="white" />
);

const CheckSvg = () => (
  <Check weight="light" size={24} color="#1A124E" className="me-2" />
);

const LangCheckSvg = () => (
  <Check weight="light" size={24} color="#1A124E" aria-hidden />
);

function isActionTarget(el: Element | null, id: string) {
  if (!el) return false;
  const node = el as HTMLElement;
  if (node.id === id) return true;
  return Boolean(node.closest?.(`#${id}`));
}

export function SiteModals() {
  const t = useT();
  const { locale } = useLocale();
  const { careersHidden } = useSiteFlags();
  const router = useRouter();
  const { member, logout } = useMemberAuth();
  const [mounted, setMounted] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [pathwayName, setPathwayName] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1" && !member) {
      setModal("login");
      router.replace("/", { scroll: false });
    }
  }, [mounted, member, router]);

  useEffect(() => {
    if (!mounted) return;
    const onOpenModal = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: ModalKind; modal?: ModalKind }>).detail;
      const kind = detail?.kind ?? detail?.modal ?? null;
      if (
        kind === "login" ||
        kind === "signup" ||
        kind === "pathway" ||
        kind === "language"
      ) {
        setDrawerOpen(false);
        setModal(kind);
      }
    };
    const onOpenDrawer = () => setDrawerOpen(true);

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (isActionTarget(target, "login_btn")) {
        e.preventDefault();
        setDrawerOpen(false);
        setModal("login");
        return;
      }
      if (isActionTarget(target, "join_btn")) {
        e.preventDefault();
        setDrawerOpen(false);
        setModal("signup");
        return;
      }
      if (isActionTarget(target, "pathway")) {
        const anchor = (target as HTMLElement)?.closest?.("a[href]");
        if (anchor && (anchor as HTMLAnchorElement).getAttribute("href")?.startsWith("/")) {
          return;
        }
        e.preventDefault();
        setDrawerOpen(false);
        setModal("pathway");
        return;
      }
      if (isActionTarget(target, "kt_drawer_example_dismiss_button")) {
        e.preventDefault();
        setDrawerOpen(true);
        return;
      }
      if ((target as HTMLElement)?.closest?.("[data-kt-drawer-dismiss]")) {
        setDrawerOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modal) closeModal();
        else if (drawerOpen) setDrawerOpen(false);
      }
    };

    window.addEventListener("edu4u:open-modal", onOpenModal);
    window.addEventListener("edu4u:open-drawer", onOpenDrawer);
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("edu4u:open-modal", onOpenModal);
      window.removeEventListener("edu4u:open-drawer", onOpenDrawer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, modal, drawerOpen, closeModal, member]);

  useEffect(() => {
    if (modal || drawerOpen) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [modal, drawerOpen]);

  useEffect(() => {
    if (modal !== "signup") setSignupError("");
    if (modal !== "login") setLoginError("");
  }, [modal]);

  const onLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!isValidEmail(email)) {
      setLoginError(t("invalidEmailAddress"));
      return;
    }
    if (!password) {
      setLoginError(t("pleaseEnterPassword"));
      return;
    }

    setLoginLoading(true);
    const form = e.currentTarget;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        status?: boolean;
        msg?: string;
        userId?: number;
        email?: string;
      };
      if (!data.status) {
        const msg = data.msg ?? "";
        if (msg === "Email address is not registered.") {
          setLoginError(t("emailNotRegistered"));
        } else if (msg === "Please enter password.") {
          setLoginError(t("pleaseEnterPassword"));
        } else if (msg === "Please enter a valid email address.") {
          setLoginError(t("invalidEmailAddress"));
        } else if (msg === "errSystem" || msg === "System Error! Please contact support team!") {
          setLoginError(t("errSystem"));
        } else if (msg && t(msg) !== msg) {
          setLoginError(t(msg));
        } else {
          setLoginError(msg || t("somethingWentWrong"));
        }
        return;
      }
      form.reset();
      closeModal();
      router.refresh();
      window.dispatchEvent(
        new CustomEvent("edu4u:member-login", {
          detail: { userId: data.userId, email: data.email ?? email },
        }),
      );
    } catch {
      setLoginError(t("networkError"));
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirm_password") ?? "");

    if (!isValidEmail(email)) {
      setSignupError(t("invalidEmailAddress"));
      return;
    }
    const passwordKey = signupPasswordErrorKey(password);
    if (passwordKey) {
      setSignupError(t(passwordKey));
      return;
    }
    if (password !== confirmPassword) {
      setSignupError(t("passwordsMustMatch"));
      return;
    }

    setSignupLoading(true);
    const form = e.currentTarget;
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });
      const data = (await res.json()) as { status?: boolean; msg?: string };
      if (!data.status) {
        const msg = data.msg ?? "";
        if (msg === "Email is already registered.") {
          setSignupError(t("emailAlreadyRegistered"));
        } else if (msg && t(msg) !== msg) {
          setSignupError(t(msg));
        } else {
          setSignupError(msg || t("somethingWentWrong"));
        }
        return;
      }
      form.reset();
      setModal("login");
    } catch {
      setSignupError(t("networkError"));
    } finally {
      setSignupLoading(false);
    }
  };

  const onPathwayStart = (e: React.FormEvent) => {
    e.preventDefault();
    const name = pathwayName.trim();
    if (!name) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pathway_username", name);
    }
    closeModal();
    router.push("/personality");
  };

  const onLogout = async () => {
    setDrawerOpen(false);
    await logout();
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Login modal */}
      <div
        className={`modal fade edu-site-modal${modal === "login" ? " show" : ""}`}
        tabIndex={-1}
        id="login_modal"
        role="dialog"
        aria-modal={modal === "login"}
        style={{
          background: "rgba(0, 0, 0, 0.50)",
          display: modal === "login" ? "flex" : "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-dialog modal-dialog-centered edu-modal-dialog">
          <div className="modal-content br-12 edu-modal-content" style={{ padding: 24 }}>
            <div className="edu-sheet-handle" aria-hidden />
            <div className="modal-header p-0">
              <h3 className="modal-title login_title">{t("logIn")}</h3>
              <div className="btn btn-icon btn-sm ms-2 btn-close-modal" onClick={closeModal} aria-label="Close" role="button" tabIndex={0}>
                <CloseSvg />
              </div>
            </div>
            <div className="modal-body p-0">
              <form id="login_form" onSubmit={onLoginSubmit} noValidate>
                <div className="mt-8">
                  {loginError ? (
                    <div
                      className="mb-3"
                      role="alert"
                      style={{
                        background: "#fff0f0",
                        border: "1px solid #f88",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#c00",
                        fontSize: 14,
                      }}
                    >
                      {loginError}
                    </div>
                  ) : null}
                  <div className="mb-3">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      className="form-control form-control-solid login-input"
                      name="email"
                      placeholder={t("emailAddressPlaceholder")}
                      onChange={() => loginError && setLoginError("")}
                    />
                  </div>
                  <div className="mb-3">
                    <PasswordInput
                      name="password"
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="current-password"
                    />
                  </div>
                  <button type="submit" className="w-100 apply-scholarship-btn" disabled={loginLoading}>
                    {loginLoading ? t("loading") : t("logIn")}
                  </button>
                  <button
                    type="button"
                    className="forget-pass mt-3 d-block text-center w-100 border-0 bg-transparent"
                    onClick={() => setModal("signup")}
                  >
                    {t("createAnAccount")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Signup modal */}
      <div
        className={`modal fade edu-site-modal${modal === "signup" ? " show" : ""}`}
        tabIndex={-1}
        id="signup_modal"
        role="dialog"
        aria-modal={modal === "signup"}
        style={{
          background: "rgba(0, 0, 0, 0.50)",
          display: modal === "signup" ? "flex" : "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable edu-modal-dialog">
          <div className="modal-content br-12 edu-modal-content" style={{ padding: 24 }}>
            <div className="edu-sheet-handle" aria-hidden />
            <div className="modal-header p-0">
              <h3 className="modal-title login_title">{t("signUp")}</h3>
              <div className="btn btn-icon btn-sm ms-2 btn-close-modal" onClick={closeModal} aria-label="Close" role="button" tabIndex={0}>
                <CloseSvg />
              </div>
            </div>
            <div className="modal-body p-0">
              <div className="mt-3">
                <span className="mb-5 d-block sign-up-title">{t("signUpDesc")}</span>
                <span className="d-block mt-2 sign-up-benifits"><CheckSvg />{t("scholarshipMatching")}</span>
                <span className="d-block mt-2 sign-up-benifits"><CheckSvg />{t("freeCounselling")}</span>
                <span className="d-block mt-2 sign-up-benifits"><CheckSvg />{t("onlineApplication")}</span>
                <span className="d-block mt-2 sign-up-benifits"><CheckSvg />{t("exclusiveDiscount")}</span>
                <div className="sign-up-benifits-desc my-5">
                  <span>{t("savingsDesc")}</span>
                </div>
                <form id="sign_up_form" onSubmit={onSignupSubmit} noValidate>
                  {signupError ? (
                    <div
                      className="mb-4"
                      role="alert"
                      style={{
                        background: "#fff0f0",
                        border: "1px solid #f88",
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: "#c00",
                        fontSize: 14,
                      }}
                    >
                      {signupError}
                    </div>
                  ) : null}
                  <div className="mb-4">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      className="form-control form-control-solid login-input"
                      name="email"
                      placeholder={t("enterEmailAddr")}
                      onChange={() => signupError && setSignupError("")}
                    />
                  </div>
                  <div className="mb-4">
                    <PasswordInput
                      name="password"
                      placeholder={t("createPasswordPlaceholder")}
                      autoComplete="new-password"
                      onChange={() => signupError && setSignupError("")}
                    />
                    <div className="d-flex mt-3">
                      <div className="ms-3"><span className="pwd-guide">{t("atLeast8Chars")}</span></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <PasswordInput
                      name="confirm_password"
                      placeholder={t("repeatPasswordPlaceholder")}
                      autoComplete="new-password"
                      onChange={() => signupError && setSignupError("")}
                    />
                    <div className="d-flex mt-3">
                      <div className="ms-3"><span className="pwd-guide">{t("passwordsMustMatch")}</span></div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-100 apply-scholarship-btn"
                    id="sign_up_btn_submit"
                    disabled={signupLoading}
                  >
                    {signupLoading ? t("submitting") : t("signUp")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pathway360 intro modal */}
      <div
        className={`modal fade edu-site-modal${modal === "pathway" ? " show" : ""}`}
        tabIndex={-1}
        id="pathway_modal"
        role="dialog"
        aria-modal={modal === "pathway"}
        style={{
          background: "rgba(0, 0, 0, 0.50)",
          display: modal === "pathway" ? "flex" : "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="edu-pathway-modal-stack">
          <div className="modal-dialog modal-dialog-centered edu-modal-dialog">
            <div className="modal-content edu-modal-content" style={{ padding: 36 }}>
              <div className="edu-sheet-handle" aria-hidden />
              <div className="modal-body p-0">
                <span className="modal-pathway-title d-block">{t("pleaseTellAboutYourself")}</span>
                <span className="d-block modal-pathway-desc mt-1">
                  {t("pathwayModalDesc")}
                </span>
                <form onSubmit={onPathwayStart}>
                  <div className="mt-8">
                    <div className="mb-3">
                      <label htmlFor="pathway_username" className="form-label">{t("whatsYourName")}</label>
                      <input
                        id="pathway_username"
                        type="text"
                        className="form-control form-control-solid login-input"
                        name="username"
                        placeholder={t("enterFullname")}
                        value={pathwayName}
                        onChange={(e) => setPathwayName(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="w-100 apply-scholarship-btn mt-10" id="pathway_start_btn">
                      {t("start")}
                    </button>
                    <span className="pathway-agree-terms mt-10 d-block text-center">
                      {t("byClickingStart")}{" "}
                      <Link className="pathway-agree-terms-link" href="/terms">{t("termsOfService")}</Link>
                      {" "}{t("and")}{" "}
                      <Link className="pathway-agree-terms-link" href="/privacy">{t("privacyPolicy")}</Link>
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn cursor" onClick={closeModal} aria-label="Close">
            <X weight="light" size={24} color="white" />
          </button>
        </div>
      </div>

      {/* Language modal / bottom sheet */}
      <div
        className={`modal fade edu-site-modal${modal === "language" ? " show" : ""}`}
        tabIndex={-1}
        id="language_modal"
        role="dialog"
        aria-modal={modal === "language"}
        aria-labelledby="language_modal_title"
        style={{
          background: "rgba(0, 0, 0, 0.50)",
          display: modal === "language" ? "flex" : "none",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-dialog modal-dialog-centered edu-modal-dialog edu-lang-dialog">
          <div className="modal-content br-12 edu-modal-content" style={{ padding: 24 }}>
            <div className="edu-sheet-handle" aria-hidden />
            <div className="modal-header p-0 border-0">
              <h3 className="modal-title login_title" id="language_modal_title">{t("selectLanguage")}</h3>
              <div className="btn btn-icon btn-sm ms-2 btn-close-modal" onClick={closeModal} aria-label="Close" role="button" tabIndex={0}>
                <CloseSvg />
              </div>
            </div>
            <div className="modal-body p-0 mt-4">
              <ul className="edu-lang-list">
                {LANG_OPTIONS.map((opt) => {
                  const active = locale === opt.locale;
                  return (
                    <li key={opt.locale}>
                      <a
                        href={`/change-language/${opt.locale}`}
                        className={`edu-lang-option${active ? " is-active" : ""}`}
                        aria-current={active ? "true" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          closeModal();
                          window.location.assign(`/change-language/${opt.locale}`);
                        }}
                      >
                        <span className="edu-lang-option-text">
                          <span className="edu-lang-option-label">{opt.label}</span>
                          <span className="edu-lang-option-native">{opt.native}</span>
                        </span>
                        {active ? <LangCheckSvg /> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer (Metronic drawer markup, React-controlled) */}
      {drawerOpen && (
        <div
          className="drawer-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1040 }}
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        id="kt_drawer_example_dismiss"
        className="bg-white"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(100%, 500px)",
          zIndex: 1050,
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
        }}
      >
        <div className="col-12">
          <div>
            <div className="d-flex justify-content-between">
              <div className="text-start mt-6" />
              <div className="text-end mt-9 me-8" data-kt-drawer-dismiss="true" role="button" tabIndex={0}>
                <X weight="light" size={24} color="#9C9C9C" data-kt-drawer-dismiss="true" />
              </div>
            </div>
            <div className="col-11 mt-5 mx-auto text-center row pb-10">
              <a
                className="mobile-sidebar-option mt-5 text-start cursor exploreaccordion accordion-button collapsed"
                style={{ fontWeight: 500 }}
                onClick={() => setExploreOpen((v) => !v)}
                role="button"
                tabIndex={0}
              >
                {t("explore")}
              </a>
              {exploreOpen && (
                <div className="accordion-body text-start mb-auto mx-auto">
                  <Link href="/explore?tab=university" className="explore-tab d-block mb-3" style={{ fontSize: 16, color: "#666" }} onClick={() => setDrawerOpen(false)}>{t("uni")}</Link>
                  <Link href="/explore?tab=course" className="explore-tab d-block mb-3" style={{ fontSize: 16, color: "#666" }} onClick={() => setDrawerOpen(false)}>{t("courses")}</Link>
                  <Link href="/compare-course" className="explore-tab d-block mb-3" style={{ fontSize: 16, color: "#666" }} onClick={() => setDrawerOpen(false)}>{t("compareCourse")}</Link>
                  <Link href="/explore?tab=scholarship" className="explore-tab d-block mb-3" style={{ fontSize: 16, color: "#666" }} onClick={() => setDrawerOpen(false)}>{t("scholarships")}</Link>
                  <Link href="/visit-campus" className="explore-tab d-block" style={{ fontSize: 16, color: "#666" }} onClick={() => setDrawerOpen(false)}>{t("campusVisit")}</Link>
                </div>
              )}

              {!careersHidden ? (
                <Link className="mobile-sidebar-option mt-5 text-start cursor" style={{ fontWeight: 500 }} href="/careers" onClick={() => setDrawerOpen(false)}>{t("careers")}</Link>
              ) : null}
              <Link className="mobile-sidebar-option mt-5 text-start cursor" style={{ fontWeight: 500 }} href="/blog" onClick={() => setDrawerOpen(false)}>{t("blog")}</Link>
              <a className="mobile-sidebar-option mt-5 text-start cursor" style={{ fontWeight: 500 }} id="pathway">{t("pathway360")}</a>
              <Link className="mobile-sidebar-option mt-5 text-start cursor" style={{ fontWeight: 500 }} href="/contact-us" onClick={() => setDrawerOpen(false)}>{t("enquireNow")}</Link>

              <div className="col-12 row mx-auto p-0 mt-10" id="mobile-sidebar-login">
                {member ? (
                  <div className="col-12 text-start px-2">
                    <p className="mb-3" style={{ fontSize: 14, color: "#666" }}>
                      {member.email}
                    </p>
                    <Link
                      className="sidebar-login d-block text-center w-100 mb-2"
                      href={ACCOUNT_ROUTES.account}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {t("myAccount")}
                    </Link>
                    <Link
                      className="sidebar-login d-block text-center w-100 mb-2"
                      href={ACCOUNT_ROUTES["student-profile"]}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {t("studentProfile")}
                    </Link>
                    <Link
                      className="sidebar-login d-block text-center w-100 mb-3"
                      href={ACCOUNT_ROUTES.documents}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {t("myDocument")}
                    </Link>
                    <button type="button" className="sidebar-login d-block text-center w-100" onClick={onLogout}>
                      {t("logOut")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="col-6">
                      <a className="sidebar-login d-block text-center w-100" id="login_btn">{t("logIn")}</a>
                    </div>
                    <div className="col-6">
                      <a className="sidebar-get-started d-block w-100" id="pathway">{t("homeGetStarted")}</a>
                    </div>
                  </>
                )}
              </div>
              <div className="col-12">
                <Link className="d-block w-100 sidebar-apply-now mt-5" href="/explore/?tab=course" onClick={() => setDrawerOpen(false)}>{t("applyNowUncap")}</Link>
              </div>
              {/* Language selector lives in the header next to the hamburger (globe icon) */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
