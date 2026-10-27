"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlan } from "../lib/usePlan";

type Props = {
  title: string;
  children: ReactNode; // real content, Pro only
  preview: ReactNode; // fake sample content, shown blurred to free users
};

export default function PaywallGate({ title, children, preview }: Props) {
  const { isPro } = usePlan();
  if (isPro) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-lg border border-emerald-900/60">
      <div className="pointer-events-none select-none blur-md" aria-hidden="true">
        {preview}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-emerald-400"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <p className="font-mono text-sm uppercase tracking-widest text-emerald-300">
          {title} · Pro
        </p>
        <p className="max-w-sm text-sm text-gray-300">
          Unlock your riskiest pincodes, cities and products with AI advice.
        </p>
        <Link
          href="/billing"
          className="rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
