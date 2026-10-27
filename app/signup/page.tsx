"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

const PLATFORMS = [
  "Shopify",
  "WooCommerce",
  "My own website",
  "Instagram / WhatsApp",
  "Amazon / Flipkart",
  "Other",
];

const ORDER_SIZES = ["Under 100", "100 - 500", "500 - 2,000", "2,000+"];

type Errors = Partial<Record<"name" | "email" | "store", string>>;

const inputClass =
  "w-full border border-[#34d399]/40 bg-black px-3 py-2.5 text-xs tracking-wide text-[#34d399] outline-none transition-colors placeholder:text-[#2f5a45] focus:border-[#34d399] focus:shadow-[0_0_0_1px_#34d399]";

const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f9a7e]";

export default function SignupPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [firstName, setFirstName] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const store = String(data.get("store") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (!store) next.store = "Please enter your store name.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);

    // TODO (step 4): send this data to your backend, for example:
    // await fetch("/api/signup", { method: "POST", body: data });
    await new Promise((r) => setTimeout(r, 600)); // pretend to save

    setFirstName(name.split(" ")[0]);
    setSending(false);
    setDone(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 font-mono text-[#34d399]">
      <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-[#34d399]/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-[#22d3ee]/[0.05] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5f9a7e] transition-colors hover:text-[#34d399]"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>

        <section className="relative border border-[#34d399]/30 bg-[#050505] shadow-[inset_0_0_40px_rgba(52,211,153,0.04)]">
          <span className="pointer-events-none absolute -left-px -top-px size-2 border-l-2 border-t-2 border-[#34d399]" />
          <span className="pointer-events-none absolute -right-px -top-px size-2 border-r-2 border-t-2 border-[#34d399]" />
          <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-[#34d399]" />
          <span className="pointer-events-none absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-[#34d399]" />

          <header className="flex items-center gap-2 border-b border-[#34d399]/30 bg-[#34d399]/[0.06] px-4 py-3">
            <span className="flex size-7 items-center justify-center bg-[#34d399] text-black">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-sm font-bold tracking-[0.2em]">
              RETURN<span className="text-white">SHIELD</span>{" "}
              <span className="bg-[#34d399] px-1 text-[10px] text-black">AI</span>
            </span>
          </header>

          {done ? (
            <div className="p-6 text-center" role="status">
              <CheckCircle2 className="mx-auto size-10 text-[#a3e635]" />
              <h1 className="mt-4 text-lg font-bold uppercase tracking-[0.14em] text-white">
                You are in{firstName ? `, ${firstName}` : ""}!
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-[#9fd9bb]">
                Thank you for signing up. We will contact you by email with the next steps.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 border border-[#34d399] bg-[#34d399] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-transparent hover:text-[#34d399]"
              >
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5 sm:p-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5f9a7e]">
                  &gt; start free
                </div>
                <h1 className="mt-1 text-xl font-bold uppercase tracking-[0.1em] text-white">
                  Create your account
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-[#9fd9bb]">
                  Tell us a little about your store. It takes less than one minute.
                </p>
              </div>

              <div>
                <label htmlFor="name" className={labelClass}>
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Rahul Sharma"
                  className={inputClass}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-[11px] text-[#ff3b5c]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourstore.com"
                  className={inputClass}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-[11px] text-[#ff3b5c]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="store" className={labelClass}>
                  Store name
                </label>
                <input
                  id="store"
                  name="store"
                  autoComplete="organization"
                  placeholder="e.g. Sharma Fashion"
                  className={inputClass}
                  aria-invalid={!!errors.store}
                  aria-describedby={errors.store ? "store-error" : undefined}
                />
                {errors.store && (
                  <p id="store-error" className="mt-1 text-[11px] text-[#ff3b5c]">
                    {errors.store}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="platform" className={labelClass}>
                    Where do you sell?
                  </label>
                  <select id="platform" name="platform" className={inputClass} defaultValue={PLATFORMS[0]}>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p} className="bg-black">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="orders" className={labelClass}>
                    Orders per month
                  </label>
                  <select id="orders" name="orders" className={inputClass} defaultValue={ORDER_SIZES[0]}>
                    {ORDER_SIZES.map((o) => (
                      <option key={o} value={o} className="bg-black">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="group flex w-full items-center justify-center gap-2 border border-[#34d399] bg-[#34d399] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_30px_rgba(52,211,153,0.25)] transition-all hover:bg-transparent hover:text-[#34d399] disabled:opacity-60"
              >
                {sending ? "Please wait..." : "Start Free"}
                {!sending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
              </button>

              <p className="text-center text-[10px] uppercase tracking-widest text-[#5f9a7e]">
                No card needed · We never act on your orders without your approval
              </p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
