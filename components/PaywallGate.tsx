"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlan } from "@/lib/usePlan";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  preview?: ReactNode;
};

function SamplePreview() {
  return (
    <div className="space-y-4 p-4" aria-hidden="true">
      {[80, 55, 70, 40].map((w, i) => (
        <div key={i}>
          <div className="h-3 w-1/3 rounded bg-[#263449]" />
          <div className="mt-2 h-1.5 rounded-full bg-[#263449]">
            <div
              className="h-full rounded-full bg-[#35BFAF]"
              style={{ width: `${w}%` }}
            />
          </div>
          <div className="mt-2 h-2 w-2/3 rounded bg-[#1B2A3F]" />
        </div>
      ))}
    </div>
  );
}

export default function PaywallGate({
  title,
  description,
  children,
  preview,
}: Props) {
  const { isPro } = usePlan();
  if (isPro) return <>{children}</>;

  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-lg border border-[#29374B] bg-[#101B2C]">
      <div className="pointer-events-none select-none blur-sm">
        {preview ?? <SamplePreview />}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080F1C]/80 p-6 text-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#35C9B7]"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#55D7C7]">
          {title} · Pro
        </p>
        <p className="max-w-xs text-xs leading-5 text-[#A9B8CA]">
          {description ??
            "Unlock detailed risk drivers, financial exposure and recommended actions."}
        </p>
        <Link
          href="/billing"
          className="rounded-md bg-[#25B9AA] px-5 py-2 text-xs font-semibold text-[#06151B] hover:bg-[#35C9B7]"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
