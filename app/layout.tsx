import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const roundedFallback = Nunito({
  variable: "--font-rounded-fallback",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rivalsteamups.com"),
  title: "Marvel Rivals Teamups — Live Community Voting | Season 10.5",
  description: "Compare every Marvel Rivals Team-Up, see live community vote totals by rank and platform, watch hero guides, and cast your Season 10.5 vote.",
  alternates: { canonical: "/", languages: { en: "/", es: "/es", "x-default": "/" } },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Marvel Rivals Teamups — Live Community Voting | Season 10.5",
    description: "Compare Season 10.5 Team-Ups, watch hero guides, and explore live community votes by rank and platform.",
    type: "website",
    images: [{ url: "/og-rivalsteamups-v3.png", width: 1672, height: 943, alt: "Rivals Team-Up community meta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marvel Rivals Teamups — Live Community Voting | Season 10.5",
    description: "Watch hero guides, compare Marvel Rivals Team-Ups, and vote with the Season 10.5 community.",
    images: ["/og-rivalsteamups-v3.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Marvel Rivals Team-Ups — Season 10.5",
    alternateName: "RivalsTeamups.com",
    url: "https://rivalsteamups.com",
    description: "Season 10.5 Marvel Rivals Team-Up community voting with live results, hero watch pages, rank breakdowns, and player insights.",
    dateModified: "2026-10-08",
  };
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MCKT43QC');` }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3283640813977777"
          crossOrigin="anonymous"
        />
      </head>
      <body className={roundedFallback.variable}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MCKT43QC" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }} />
        {children}
      </body>
    </html>
  );
}
