import type { Metadata } from "next";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Faq } from "@/components/landing/Faq";
import { CtaBand } from "@/components/landing/CtaBand";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks title="How ReturnShield AI works, step by step." />
      <Faq />
      <CtaBand />
    </>
  );
}
