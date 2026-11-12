"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  Image,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  School,
  Search,
  Sparkles,
  Tags,
  UserRound,
  Users,
  type LucideProps,
} from "lucide-react";
import { AdminCommandPalette, type AdminSearchItem } from "./AdminCommandPalette";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<LucideProps>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: "Home",
    items: [
      { href: "/admin/hero", label: "Hero banners", icon: Image },
      { href: "/admin/popup", label: "Pop up", icon: Sparkles },
      { href: "/admin/home", label: "Background", icon: Image },
    ],
  },
  {
    title: "Blog",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
    ],
  },
  {
    title: "Careers",
    items: [
      { href: "/admin/job", label: "Careers", icon: Briefcase },
    ],
  },
  {
    title: "University",
    items: [
      { href: "/admin/university", label: "University", icon: Building2 },
      { href: "/admin/universitytype", label: "Type", icon: Layers },
      { href: "/admin/course", label: "Course", icon: BookOpen },
      { href: "/admin/category", label: "Category", icon: Tags },
      { href: "/admin/scholarship", label: "Scholarship", icon: GraduationCap },
    ],
  },
  {
    title: "K-12",
    items: [
      { href: "/admin/k-12", label: "K-12 study", icon: School },
      { href: "/admin/k12scholarship", label: "K-12 scholarship", icon: GraduationCap },
    ],
  },
  {
    title: "Subjects",
    items: [
      { href: "/admin/subjects", label: "Subjects", icon: Layers },
      { href: "/admin/subjectsgrades", label: "Grades", icon: ClipboardList },
    ],
  },
  {
    title: "Users & pathway",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/characters", label: "Characters", icon: UserRound },
      { href: "/admin/personality", label: "Personality", icon: Sparkles },
      { href: "/admin/schools", label: "Schools", icon: School },
    ],
  },
  {
    title: "Inbound",
    items: [
      { href: "/admin/courseapplication", label: "Course applications", icon: ClipboardList },
      { href: "/admin/counsellor", label: "Counsellor", icon: MessageCircle },
      { href: "/admin/visitcampus", label: "Campus visits", icon: MapPin },
      { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
    ],
  },
];

function NavIcon({ icon: Icon }: { icon: ComponentType<LucideProps> }) {
  return <Icon className="admin-nav-icon" strokeWidth={1.75} aria-hidden />;
}

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("⌘K");

  const searchItems = useMemo<AdminSearchItem[]>(() => {
    const aliases: Record<string, string[]> = {
      "/admin/dashboard": ["home", "overview", "dashboard"],
      "/admin/job": ["careers", "jobs", "vacancies"],
      "/admin/blog": ["posts", "articles", "news"],
      "/admin/k-12": ["k12", "schools", "international"],
      "/admin/courseapplication": ["applications", "apply"],
      "/admin/counsellor": ["consult", "counselor", "advise"],
      "/admin/visitcampus": ["campus", "tour", "visit"],
      "/admin/enquiries": ["contact", "messages", "inbox"],
      "/admin/users": ["accounts", "students", "members"],
      "/admin/personality": ["pathway", "quiz"],
      "/admin/characters": ["pathway", "avatars"],
    };
    const home: AdminSearchItem = {
      href: "/admin/dashboard",
      label: "Account home",
      section: "Home",
      icon: LayoutDashboard,
      keywords: aliases["/admin/dashboard"],
    };
    const fromNav = SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        href: item.href,
        label: item.label,
        section: section.title,
        icon: item.icon,
        keywords: aliases[item.href],
      })),
    );
    return [home, ...fromNav];
  }, []);

  useEffect(() => {
    setShortcutLabel(isMacPlatform() ? "⌘K" : "Ctrl K");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/sign-in");
    router.refresh();
  }

  const initial = (username || "A").slice(0, 1).toUpperCase();

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <div className="admin-sidebar-spacer" aria-hidden />
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <Link href="/admin/dashboard" className="admin-sidebar-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo/edu4ulogo.jpg" alt="Edu4u" />
            </Link>
          </div>

          <div className="admin-sidebar-scroll">
            <button
              type="button"
              className="admin-search"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
            >
              <Search size={14} strokeWidth={1.75} aria-hidden />
              <span className="admin-search-placeholder">Quick search...</span>
              <kbd>{shortcutLabel}</kbd>
            </button>

            <Link
              href="/admin/dashboard"
              className={`admin-nav-link ${pathname === "/admin/dashboard" ? "is-active" : ""}`}
            >
              <NavIcon icon={LayoutDashboard} />
              Account home
            </Link>

            {SECTIONS.map((section) => (
              <div key={section.title} className="admin-nav-section">
                <div className="admin-nav-section-title">{section.title}</div>
                {section.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`admin-nav-link ${active ? "is-active" : ""}`}
                    >
                      <NavIcon icon={item.icon} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <a href="/" target="_blank" rel="noreferrer" className="admin-topbar-link">
              View site
            </a>
            <div className="admin-topbar-account">
              <div className="admin-topbar-user">
                <div className="admin-sidebar-avatar" aria-hidden>
                  {initial}
                </div>
                <div className="admin-topbar-user-meta">
                  <strong>{username}</strong>
                  <span>Administrator</span>
                </div>
              </div>
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={logout}>
                Sign out
              </button>
            </div>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>

      <AdminCommandPalette open={searchOpen} onOpenChange={setSearchOpen} items={searchItems} />
    </div>
  );
}
