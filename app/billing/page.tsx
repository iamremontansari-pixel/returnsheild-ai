"use client";

import { usePlan, setPlan } from "../../lib/usePlan";

export default function BillingPage() {
  const { plan } = usePlan();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
        &gt; Billing
      </p>
      <h1 className="font-mono text-2xl font-bold uppercase text-white">
        Your plan: {plan}
      </h1>
      <p className="text-sm text-gray-300">
        Pro unlocks riskiest pincodes, cities, products and AI advice. Online
        payment is coming soon.
      </p>

      {/* TEMPORARY: testing switch. Delete before real launch. */}
      <button
        onClick={() => setPlan(plan === "pro" ? "free" : "pro")}
        className="rounded border border-dashed border-gray-600 px-4 py-2 text-xs text-gray-400 hover:text-white"
      >
        Test: switch to {plan === "pro" ? "Free" : "Pro"}
      </button>
    </main>
  );
}
