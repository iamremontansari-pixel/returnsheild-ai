import { LinkButton } from "@/components/ui/LinkButton";

export function CtaBand() {
  return (
    <section className="bg-navy py-16 text-center text-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-extrabold tracking-tight">See where your returns really come from.</h2>
        <LinkButton href="/register" className="mt-6">
          Start Free
        </LinkButton>
      </div>
    </section>
  );
}
