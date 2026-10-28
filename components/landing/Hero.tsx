import { LinkButton } from "@/components/ui/LinkButton";
import { ProductPreview } from "@/components/landing/ProductPreview";
export function Hero() {
  return (
    <section className="bg-linear-to-b from-navy to-navy-2 pb-20 pt-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="hero-in max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Stop Returns Before They Cost You.
        </h1>
        <p className="hero-in mt-6 max-w-2xl text-lg leading-relaxed text-soft sm:text-xl" style={{ animationDelay: "80ms" }}>
          AI-powered insights that help e-commerce sellers identify return risks, reduce preventable RTO, and protect profit margins.
        </p>
        <div className="hero-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: "160ms" }}>
          <LinkButton href="/register">Start Free</LinkButton>
          <LinkButton href="#preview" variant="outline">
          See Live Demo  
          </LinkButton>
        </div>
        <div id="preview" className="mt-14 scroll-mt-24">
       <ProductPreview /> 
        </div>
      </div>
    </section>
  );
}
