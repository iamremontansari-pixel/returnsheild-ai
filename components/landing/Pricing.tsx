import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/LinkButton";
import { cn } from "@/lib/utils";

// Change the Pro price here. This is the only place you need to edit.
const PRO_PRICE = "₹999";

const plans = [
  {
    name: "Free",
    price: "₹0",
    note: "No card needed",
    blurb: "See your real return numbers from your own Shopify orders.",
    features: [
      "Upload your Shopify orders as a CSV",
      "COD and prepaid return rates",
      "Value of returned orders",
      "Risk score for single orders",
    ],
    cta: "Start free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: PRO_PRICE,
    note: "per month",
    blurb:
      "Find the pincodes, cities and products that cost you the most, and see what to do about them.",
    features: [
      "Everything in Free",
      "Riskiest pincodes, cities and products",
      "Risk drivers and financial exposure for each order",
      "AI recommendations on what to do next",
    ],
    cta: "Upgrade to Pro",
    href: "/billing",
    highlighted: true,
  },
];

export function Pricing({
  title = "Start free. Upgrade when you are ready to act.",
}: {
  title?: string;
}) {
  return (
    <Section
      title={title}
      intro="Upload your Shopify orders for free. Pro shows you where returns come from and what to do about them."
    >
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              "flex flex-col rounded-xl border bg-white p-8",
              p.highlighted ? "border-2 border-brand" : "border-line",
            )}
          >
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="mt-4 text-4xl font-bold">{p.price}</p>
            <p className="mt-1 text-sm text-muted">{p.note}</p>
            <p className="mt-5 leading-relaxed text-muted">{p.blurb}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check
                    className="mt-1 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
            </ul>
            <LinkButton
              href={p.href}
              variant={p.highlighted ? "primary" : "dark"}
              className="mt-8"
            >
              {p.cta}
            </LinkButton>
          </div>
        ))}
      </div>
    </Section>
  );
}
