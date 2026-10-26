import { Hero } from "@/components/landing/Hero";
import { Problems } from "@/components/landing/Problems";
import { Solutions } from "@/components/landing/Solutions";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { CtaBand } from "@/components/landing/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problems />
      <Solutions />
      <HowItWorks />
      <Pricing />
      <Faq />
      <CtaBand />
    </>
  );
}
