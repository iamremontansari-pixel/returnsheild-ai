"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FooterLink = readonly [string, string];

const productLinks: readonly FooterLink[] = [
  ["Features", "/features"],
  ["How it works", "/how-it-works"],
  ["Pricing", "/pricing"],
];

const signedOutLinks: readonly FooterLink[] = [
  ["Log in", "/login"],
  ["Create account", "/register"],
];

const signedInLinks: readonly FooterLink[] = [
  ["Dashboard", "/dashboard"],
  ["Upload orders", "/upload"],
  ["Billing", "/billing"],
];

export function Footer() {
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSignedIn(Boolean(data.session));
        setChecking(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const columns: { title: string; links: readonly FooterLink[] }[] = [
    { title: "Product", links: productLinks },
    {
      title: "Account",
      links: checking ? [] : signedIn ? signedInLinks : signedOutLinks,
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">
            ReturnShield <span className="text-[#34d399]">AI</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Return-risk insights for e-commerce sellers. Predictions are
            estimates and results vary by business.
          </p>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-[#34d399]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/50">
        © 2026 ReturnShield AI. Contact, privacy and terms pages are coming
        soon.
      </div>
    </footer>
  );
}
