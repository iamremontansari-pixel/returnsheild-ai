import { BarChart3, BrainCircuit, MessageSquare, Radar, Search, Truck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { FeatureCard } from "@/components/ui/FeatureCard";

export const solutionItems = [
  { icon: BrainCircuit, title: "Return-risk prediction", text: "Separate estimates for RTO and customer returns on each order, with the reasons behind them." },
  { icon: MessageSquare, title: "Customer communication assistance", text: "Suggested confirmation messages that you review before anything is sent." },
  { icon: Search, title: "Product feedback analysis", text: "Return reasons grouped into patterns for each product." },
  { icon: Truck, title: "Delivery monitoring", text: "Failed delivery attempts surfaced so follow-up is not missed." },
  { icon: Radar, title: "Return anomaly detection", text: "Unusual jumps in returns flagged for your review." },
  { icon: BarChart3, title: "Return-cost analytics", text: "Costs calculated from your data and kept separate from estimates." },
];

export function Solutions({ title = "See the risk, understand it, then decide." }: { title?: string }) {
  return (
    <Section
      title={title}
      intro="Predictions are estimates shown with their reasons and uncertainty. You approve every action."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {solutionItems.map((s) => (
          <FeatureCard key={s.title} {...s} />
        ))}
      </div>
    </Section>
  );
}
