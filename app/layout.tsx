import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://rivalsteamups.com"),
  title: "Rivals Team-Up Meta | Season 9 Community Voting",
  description: "Build and compare Marvel Rivals Team-Up ability drafts by hero, role, and anchor partner context.",
  icons: { icon: "/rivals-icon.ico", shortcut: "/rivals-icon.ico", apple: "/rivals-icon.ico" },
  openGraph: {
    title: "Rivals Team-Up Meta | Season 9 Community Voting",
    description: "Scout the roster, lock two abilities, and preview enhanced anchor-partner effects.",
    type: "website",
    images: [{ url: "/og.png", width: 1672, height: 943, alt: "Rivals Team-Up community meta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rivals Team-Up Meta | Season 9 Community Voting",
    description: "Build and compare Team-Up ability drafts by hero, role, and anchor partner context.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
