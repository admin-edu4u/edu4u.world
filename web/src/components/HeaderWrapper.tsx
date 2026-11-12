"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

/**
 * Renders SiteHeader for every page except the home page ("/"),
 * which renders its own header directly in page.tsx.
 */
export function HeaderWrapper() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <SiteHeader />;
}
