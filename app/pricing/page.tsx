import type { Metadata } from "next";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <Pricing title="Pricing for sellers of every size (proposed)." />
      <Faq />
    </>
  );
}
