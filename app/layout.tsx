import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://rivalsteamups.com"),
  title: "Marvel Rivals Teamups — Vote for the Best Team-Ups | Season 9.5",
  description: "Compare every Marvel Rivals teamup, filter community votes by rank and platform, and discover which anchor combinations players prefer.",
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
    title: "Marvel Rivals Teamups — Vote for the Best Team-Ups | Season 9.5",
    description: "Compare Marvel Rivals Team-Ups, community votes by rank and platform, and Enhanced anchor effects.",
    type: "website",
    images: [{ url: "/og-rivalsteamups-v3.png", width: 1672, height: 943, alt: "Rivals Team-Up community meta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marvel Rivals Teamups — Vote for the Best Team-Ups | Season 9.5",
    description: "Compare Marvel Rivals Team-Ups, vote for your favorites, and explore results by rank and platform.",
    images: ["/og-rivalsteamups-v3.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rivals Team-Up Meta",
    alternateName: "RivalsTeamups.com",
    url: "https://rivalsteamups.com",
    description: "Marvel Rivals Team-Up community voting, rank breakdowns, platform comparisons, and player insights.",
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MCKT43QC" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }} />
        {children}
      </body>
    </html>
  );
}
