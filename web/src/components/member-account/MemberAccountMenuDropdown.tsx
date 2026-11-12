"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import { useMemberAuth } from "@/components/MemberAuthProvider";
import { ACCOUNT_ROUTES } from "@/lib/member/accountSections";

type Props = {
  profileButton: React.ReactNode;
  memberEmail?: string;
};

export function MemberAccountMenuDropdown({ profileButton, memberEmail }: Props) {
  const t = useT();
  const router = useRouter();
  const { logout } = useMemberAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onLogout = async () => {
    setOpen(false);
    await logout();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="edu-member-account-menu position-relative" ref={rootRef}>
      <button
        type="button"
        className="d-inline-flex border-0 bg-transparent p-0 ms-3"
        id="profile_btn"
        aria-label={t("myAccount")}
        aria-expanded={open}
        aria-haspopup="menu"
        title={memberEmail}
        onClick={() => setOpen((v) => !v)}
      >
        {profileButton}
      </button>
      {open ? (
        <div className="edu-member-account-menu-panel" role="menu">
          {memberEmail ? (
            <p className="edu-member-account-menu-email" role="presentation">
              {memberEmail}
            </p>
          ) : null}
          <Link
            className="edu-member-account-menu-item"
            href={ACCOUNT_ROUTES.account}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {t("myAccount")}
          </Link>
          <Link
            className="edu-member-account-menu-item"
            href={ACCOUNT_ROUTES["student-profile"]}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {t("studentProfile")}
          </Link>
          <Link
            className="edu-member-account-menu-item"
            href={ACCOUNT_ROUTES.documents}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {t("myDocument")}
          </Link>
          <button type="button" className="edu-member-account-menu-item edu-member-account-menu-logout" role="menuitem" onClick={() => void onLogout()}>
            {t("logOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MemberAccountMenuDropdownMobile({ profileButton }: Props) {
  const t = useT();
  const router = useRouter();
  const { logout } = useMemberAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onLogout = async () => {
    setOpen(false);
    await logout();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="edu-member-account-menu position-relative" ref={rootRef}>
      <button
        type="button"
        className="d-inline-flex border-0 bg-transparent p-0"
        aria-label={t("myAccount")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {profileButton}
      </button>
      {open ? (
        <div className="edu-member-account-menu-panel edu-member-account-menu-panel-mobile" role="menu">
          <button type="button" className="edu-member-account-menu-item w-100 text-start" onClick={() => go(ACCOUNT_ROUTES.account)}>
            {t("myAccount")}
          </button>
          <button type="button" className="edu-member-account-menu-item w-100 text-start" onClick={() => go(ACCOUNT_ROUTES["student-profile"])}>
            {t("studentProfile")}
          </button>
          <button type="button" className="edu-member-account-menu-item w-100 text-start" onClick={() => go(ACCOUNT_ROUTES.documents)}>
            {t("myDocument")}
          </button>
          <button type="button" className="edu-member-account-menu-item edu-member-account-menu-logout w-100 text-start" onClick={() => void onLogout()}>
            {t("logOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
