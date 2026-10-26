import { Section } from "@/components/ui/Section";

export const steps = [
  { title: "Connect or upload order data", text: "Start with a file of past orders and their outcomes." },
  { title: "Analyse historical patterns", text: "See which products, payment methods and areas lose the most to returns." },
  { title: "Identify potential risks", text: "New orders are flagged with the reasons behind each flag." },
  { title: "Recommend preventive actions", text: "Suggested next steps wait for your approval." },
  { title: "Measure actual outcomes", text: "Compare what happened with what was predicted." },
];

export function HowItWorks({ title = "From order data to measured outcomes." }: { title?: string }) {
  return (
    <Section title={title} tone="dark">
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-white/10 bg-navy-2 p-5">
            <span className="text-2xl font-extrabold text-cyan">{i + 1}</span>
            <h3 className="mt-3 font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-soft">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-2xl text-soft">Results vary by business and data quality. ReturnShield AI does not guarantee a reduction in returns.</p>
    </Section>
  );
}
