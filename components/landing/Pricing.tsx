import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/LinkButton";
import { plans } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Pricing({ title = "Three plans, proposed." }: { title?: string }) {
  return (
    <Section title={title} intro="All prices are proposed and subject to validation. Replace the [YOUR PRICE] placeholders before launch.">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={cn("flex flex-col rounded-xl border bg-white p-6", p.highlighted ? "border-2 border-brand" : "border-line")}>
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="mt-3 text-3xl font-extrabold">{p.price}</p>
            <p className="mt-1 text-sm text-muted">Proposed price</p>
            <p className="mt-4 leading-relaxed text-muted">{p.blurb}</p>
            <ul className="mt-5 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <LinkButton href="/register" variant={p.highlighted ? "primary" : "dark"} className="mt-6">
              Choose {p.name}
            </LinkButton>
          </div>
        ))}
      </div>
    </Section>
  );
}
