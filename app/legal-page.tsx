import type { ReactNode } from "react";

export function LegalPage({ eyebrow, title, children, updatedLabel = "Effective July 10, 2026" }: { eyebrow: string; title: string; children: ReactNode; updatedLabel?: string }) {
  return <main className="legal-shell">
    <header className="topbar detail-topbar"><a className="brand" href="/"><span className="brand-mark">R</span><span><strong>RIVALS</strong><small>TEAM-UP</small></span></a><a className="detail-back" href="/">← BACK TO DIRECTORY</a></header>
    <article className="legal-document"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="legal-updated">{updatedLabel}</p>{children}</article>
    <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // COMMUNITY META</span><nav className="legal-links"><a href="/about">ABOUT &amp; METHODOLOGY</a><a href="/contact">CONTACT</a><a href="/legal-notice">LEGAL NOTICE</a><a href="/privacy-policy">PRIVACY</a><a href="/terms-of-use">TERMS</a><a href="/cookie-policy">COOKIES</a></nav><a href="/">DIRECTORY ↑</a></footer>
  </main>;
}
