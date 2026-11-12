import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Edu4u",
  description: "Find your path to the right university, course, and scholarship",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

const htmlLang: Record<string, string> = {
  en: "en",
  ch: "zh-Hans",
  bm: "ms",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={htmlLang[locale] ?? "en"} translate="no">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700&display=swap"
        />
        <link
          href="/assets/plugins/global/plugins.bundle.css"
          rel="stylesheet"
          type="text/css"
        />
        <link href="/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/assets/css/custom.css?v=20261112b" rel="stylesheet" type="text/css" />
        <link
          href="https://cdn.jsdelivr.net/npm/owl.carousel@2.3.4/dist/assets/owl.carousel.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
