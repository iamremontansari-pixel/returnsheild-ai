import { Banknote, MapPinOff, Ruler, ThumbsDown, Truck, EyeOff } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { FeatureCard } from "@/components/ui/FeatureCard";

export function Problems() {
  return (
    <Section
      title="Most return losses start before the parcel ships."
      intro="Sellers usually see the cost only after the return arrives, with little idea why it happened."
      tone="mist"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={Banknote} title="COD-related RTO" text="Cash-on-delivery orders without confirmation are more likely to come back undelivered." />
        <FeatureCard icon={MapPinOff} title="Incomplete addresses" text="Missing landmarks or pin codes lead to failed deliveries and extra shipping costs." />
        <FeatureCard icon={Ruler} title="Size uncertainty" text="Buyers unsure about fit order, then return the product." />
        <FeatureCard icon={ThumbsDown} title="Repeated quality complaints" text="The same product issue shows up in return reasons again and again." />
        <FeatureCard icon={Truck} title="Failed delivery follow-up" text="Missed delivery attempts go unattended and turn into RTO." />
        <FeatureCard icon={EyeOff} title="Hidden return costs" text="Shipping, handling and lost stock rarely appear in a single view." />
      </div>
    </Section>
  );
}
