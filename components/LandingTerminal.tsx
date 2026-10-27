"use client";

import { useState } from "react";
import { Menu, X, ShieldCheck, ArrowRight, Terminal } from "lucide-react";

import { DashboardPreview } from "@/components/dashboard/DashboardPreview";
const NAV = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "How it works", href: "#how" },
];

// Change these to your real routes.
const START_HREF = "/signup";
const DASHBOARD_HREF = "#dashboard";

const STATS = [
  { k: "RTO REDUCTION GOAL", v: "UP TO 30%" },
  { k: "COD RISK SCORING", v: "PER ORDER" },
  { k: "SETUP", v: "MINUTES" },
  { k: "ACTIONS", v: "YOU APPROVE" },
];

const FEATURES = [
  {
    tag: "01",
    title: "Predict RTO before dispatch",
    body: "Every COD order gets a risk score from pincode, order value, buyer history and payment mode.",
  },
  {
    tag: "02",
    title: "Know why it is risky",
    body: "Each flag comes with a plain-language reason, so you are never guessing at what the model saw.",
  },
  {
    tag: "03",
    title: "Act with one click",
    body: "Confirm by call, request a prepaid switch, or hold the order. Nothing runs without your approval.",
  },
];

const terminalCss = `
@keyframes ls-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.ls-blink { animation: ls-blink 1.1s steps(1) infinite; }
.ls-grid {
  background-image:
    linear-gradient(rgba(255,176,0,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,176,0,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
}
@media (prefers-reduced-motion: reduce) { .ls-blink { animation: none; } }
`;

export function LandingTerminal() {
  const [open, setOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-black font-mono text-[#ffb000]">
      <style>{terminalCss}</style>

      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 border-b border-[#ffb000]/30 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center bg-[#ffb000] text-black">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-sm font-bold tracking-[0.2em]">
              RETURN<span className="text-white">SHIELD</span>{" "}
              <span className="bg-[#ffb000] px-1 text-[10px] text-black">AI</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c79a3a] transition-colors hover:text-[#ffb000]"
              >
                {n.label}
              </a>
            ))}
            <a
              href={START_HREF}
              className="border border-[#ffb000] bg-[#ffb000] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-transparent hover:text-[#ffb000]"
            >
              Start Free
            </a>
          </nav>

          <button
            type="button"
            className="border border-[#ffb000]/40 p-1.5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <nav
            className="border-t border-[#ffb000]/30 bg-black px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {NAV.map((n) => (
                <li key={n.label}>
                  <a
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-[#ffb000]/10 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#ffb000]"
                  >
                    <span className="mr-2 text-[#8a6a2a]">&gt;</span>
                    {n.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href={START_HREF}
                  className="block bg-[#ffb000] py-2.5 text-center text-xs font-bold uppercase tracking-[0.18em] text-black"
                >
                  Start Free
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section id="top" className="relative overflow-hidden">
        <div className="ls-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-24 top-0 size-96 rounded-full bg-[#ffb000]/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-[#22d3ee]/[0.05] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 border border-[#ffb000]/30 bg-[#ffb000]/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Terminal className="size-3.5" />
            <span className="text-[#8a6a2a]">&gt;</span> return risk engine online
            <span className="ls-blink h-3 w-1.5 bg-[#ffb000]" />
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Stop returns before they{" "}
            <span
              className="text-[#ffb000]"
              style={{ textShadow: "0 0 30px rgba(255,176,0,0.45)" }}
            >
              cost you.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#c79a3a] sm:text-base">
            AI-powered insights that help e-commerce sellers identify return risks, reduce
            preventable RTO, and protect profit margins.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={START_HREF}
              className="group inline-flex items-center gap-2 border border-[#ffb000] bg-[#ffb000] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_30px_rgba(255,176,0,0.25)] transition-all hover:bg-transparent hover:text-[#ffb000]"
            >
              Start Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={DASHBOARD_HREF}
              className="inline-flex items-center gap-2 border border-[#ffb000]/50 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ffb000] transition-colors hover:border-[#ffb000] hover:bg-[#ffb000]/10"
            >
              Explore Dashboard
            </a>
          </div>

          {/* stat strip */}
          <dl className="mt-12 grid grid-cols-2 border border-[#ffb000]/25 bg-[#050505] lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.k}
                className={`p-4 ${i % 2 === 0 ? "border-r border-[#ffb000]/25" : ""} ${
                  i < 2 ? "border-b border-[#ffb000]/25 lg:border-b-0" : ""
                } ${i === 1 ? "lg:border-r lg:border-[#ffb000]/25" : ""} ${
                  i === 2 ? "lg:border-r lg:border-[#ffb000]/25" : ""
                }`}
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6a2a]">
                  {s.k}
                </dt>
                <dd className="mt-1 text-lg font-bold tracking-wide text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== Dashboard ===== */}
      <section id="dashboard" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-16 sm:px-6">
        <DashboardPreview />
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-20 sm:px-6">
        <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6a2a]">
          &gt; capabilities
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.tag}
              className="border border-[#ffb000]/25 bg-[#050505] p-5 transition-colors hover:border-[#ffb000]/70"
            >
              <span className="bg-[#ffb000] px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-black">
                {f.tag}
              </span>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#c79a3a]">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer
        id="how"
        className="border-t border-[#ffb000]/25 px-4 py-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8a6a2a]"
      >
        © ReturnShield AI · Built for sellers
      </footer>
    </main>
  );
}
