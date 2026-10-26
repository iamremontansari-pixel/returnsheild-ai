import type { LucideIcon } from "lucide-react";

export function FeatureCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <Icon className="size-6 text-brand" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{text}</p>
    </div>
  );
}
