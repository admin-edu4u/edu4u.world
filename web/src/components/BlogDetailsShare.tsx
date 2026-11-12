"use client";

import { Share } from "@phosphor-icons/react/dist/ssr";

export function BlogDetailsShare() {
  function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <Share size={24}
      weight="light"
      color="#999999"
      onClick={copyUrl}
      className="cursor"
      style={{ cursor: "pointer" }}
    />
  );
}