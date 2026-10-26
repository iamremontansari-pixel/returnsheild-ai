import Link from "next/link";

const columns = [
  { title: "Product", links: [["Features", "/features"], ["How it works", "/how-it-works"], ["Pricing", "/pricing"]] },
  { title: "Account", links: [["Log in", "/login"], ["Create account", "/register"]] },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#070d22] text-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-extrabold text-white">
            ReturnShield <span className="text-cyan">AI</span>
          </p>
          <p className="mt-3 max-w-sm leading-relaxed">
            Return-risk insights for e-commerce sellers. Predictions are estimates and results vary by business.
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-semibold text-white">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-cyan">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-sm">
        Contact, privacy policy and terms pages will be added before launch. © 2026 ReturnShield AI
      </div>
    </footer>
  );
}
