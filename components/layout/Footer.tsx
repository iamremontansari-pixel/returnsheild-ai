import Link from "next/link";

const columns = [
  { title: "Product", links: [["Features", "/features"], ["How it works", "/how-it-works"], ["Pricing", "/pricing"]] },
  { title: "Account", links: [["Log in", "/login"], ["Create account", "/register"]] },
] as const;

export function Footer() {
  return (
    <footer className="relative border-t border-[#34d399]/30 bg-black font-mono text-[#9fd9bb]">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#34d399] to-transparent opacity-60" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-white">
            <span className="flex size-6 items-center justify-center bg-[#34d399] text-[10px] font-extrabold text-black">
              R
            </span>
            RETURN<span className="text-[#34d399]">SHIELD</span>
            <span className="bg-[#34d399] px-1 text-[10px] text-black">AI</span>
          </p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed">
            Return-risk insights for e-commerce sellers. Predictions are estimates and results vary by business.
          </p>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#34d399]">
              {c.title}
            </p>
            <ul className="mt-4 space-y-2.5 text-xs">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-[#34d399]"
                  >
                    <span className="mr-2 text-[#5f9a7e]">&gt;</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-[#34d399]/20 px-6 py-5 text-center text-[10px] uppercase tracking-[0.18em] text-[#5f9a7e]">
        Contact, privacy policy and terms pages will be added before launch. © 2026 ReturnShield AI
      </div>
    </footer>
  );
}
