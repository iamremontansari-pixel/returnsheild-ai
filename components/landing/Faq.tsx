"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { faqs } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <Section title="Common questions" tone="mist">
      <div className="max-w-3xl space-y-3">
        {faqs.map((f, i) => {
          const open = openIndex === i;
          return (
            <div key={f.q} className="rounded-xl border border-line bg-white">
              <h3>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                  aria-expanded={open}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  {f.q}
                  <ChevronDown className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")} aria-hidden="true" />
                </button>
              </h3>
              {open && (
                <p id={`faq-${i}`} className="px-5 pb-5 leading-relaxed text-muted">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
