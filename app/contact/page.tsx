import type { Metadata } from "next";
import { LegalPage } from "@/app/legal-page";

export const metadata: Metadata = {
  title: "Contact Rivals Team-Ups",
  description: "Contact the creator of Rivals Team-Ups, support the project, or follow development updates.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <LegalPage eyebrow="GET IN TOUCH" title="Contact Us">
    <h2>Email</h2>
    <p>Questions, corrections, partnership ideas, or site feedback are welcome at <a href="mailto:NeckBeardDev@gmail.com">NeckBeardDev@gmail.com</a>.</p>
    <h2>Support the project</h2>
    <p>If Rivals Team-Ups has helped you, you can support its continued development on <a href="https://buymeacoffee.com/neckbearddt" target="_blank" rel="noreferrer">Buy Me a Coffee</a>.</p>
    <h2>Follow the developer</h2>
    <p>Connect with DeAngelo Robinson on <a href="https://www.linkedin.com/in/deangelo-robinson/" target="_blank" rel="noreferrer">LinkedIn</a> or follow <a href="https://x.com/NeckBeardDev" target="_blank" rel="noreferrer">@NeckBeardDev on X</a> for updates.</p>
  </LegalPage>;
}
