
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Analysis = {
  riskLevel: "Low" | "Medium" | "High";
  reasons: string[];
  recommendations: string[];
  disclaimer: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [product, setProduct] = useState("");
  const [payment, setPayment] = useState("COD");
  const [amount, setAmount] = useState("1000");
  const [delivery, setDelivery] = useState("Standard");
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setIsAuthenticated(true);
      setCheckingAuth(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        setIsAuthenticated(false);
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function analyzeOrder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        router.replace("/login");
        throw new Error("Please log in again to analyze orders.");
      }

      const response = await fetch("/api/analyze-return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product,
          payment,
          amount: Number(amount),
          delivery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          [data.error, data.details].filter(Boolean).join(": ") ||
            "Analysis failed. Please try again.",
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#071126] p-10 text-white">
        Checking your login...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071126] px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-cyan-300 hover:text-white">
          ← ReturnShield AI
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            AI-powered operations
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            Return Risk Analyzer
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Analyze order details, understand possible return risks, and
            discover practical ways to reduce avoidable returns.
          </p>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form
            onSubmit={analyzeOrder}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-xl font-bold">Order details</h2>

            <label className="mt-5 block text-sm text-slate-300">
              Product name or category
              <input
                required
                maxLength={120}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Wireless headphones"
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b1933] p-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="mt-4 block text-sm text-slate-300">
              Order value (₹)
              <input
                required
                type="number"
                min="1"
                max="10000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b1933] p-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="mt-4 block text-sm text-slate-300">
              Payment method
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b1933] p-3 text-white"
              >
                <option value="COD">Cash on delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </label>

            <label className="mt-4 block text-sm text-slate-300">
              Delivery type
              <select
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#0b1933] p-3 text-white"
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-cyan-400 px-5 py-3 font-bold text-[#071126] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze return risk"}
            </button>

            <p className="mt-3 text-xs text-slate-400">
              This tool provides an estimate, not a verified prediction.
            </p>
          </form>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Analysis results</h2>

            {!result && !loading && !error && (
              <p className="mt-5 text-slate-400">
                Your analysis will appear here after you submit the order
                details.
              </p>
            )}

            {loading && (
              <p className="mt-5 text-cyan-300">
                Reviewing your order details...
              </p>
            )}

            {error && (
              <p role="alert" className="mt-5 text-rose-300">
                {error}
              </p>
            )}

            {result && (
              <div className="mt-5">
                <p className="text-sm text-slate-400">
                  Estimated risk level
                </p>
                <p
                  className={`mt-2 inline-block rounded-full px-4 py-2 font-bold ${
                    result.riskLevel === "High"
                      ? "bg-rose-500/20 text-rose-300"
                      : result.riskLevel === "Medium"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {result.riskLevel} risk
                </p>

                <h3 className="mt-6 font-semibold">
                  Possible risk factors
                </h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-300">
                  {result.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>

                <h3 className="mt-6 font-semibold">
                  Recommended actions
                </h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-300">
                  {result.recommendations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <p className="mt-6 rounded-lg bg-white/5 p-3 text-xs text-slate-400">
                  {result.disclaimer}
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
