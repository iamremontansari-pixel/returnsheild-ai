import type { Metadata } from "next";
import { Solutions } from "@/components/landing/Solutions";
import { Problems } from "@/components/landing/Problems";
import { CtaBand } from "@/components/landing/CtaBand";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <>
      <Solutions title="Features built around the returns you can still prevent." />
      <Problems />
      <CtaBand />
    </>
  );
}
