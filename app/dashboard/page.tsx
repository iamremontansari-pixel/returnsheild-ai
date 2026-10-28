"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PaywallGate from "@/components/PaywallGate";

type RiskLevel = "Low" | "Medium" | "High";

type RiskFactor = {
  name: string;
  points: number;
  explanation: string;
  evidence: string;
};

type Analysis = {
  riskLevel: RiskLevel;
  riskScore?: number;
  scoreType?: string;
  scoreDrivers?: RiskFactor[];
  executiveSummary?: string;
  reasons: string[];
  recommendations: string[];
  dataGaps?: string[];
  confidence?: "Low" | "Moderate";
  actionPriority?: "Routine" | "Review" | "Urgent review";
  financialExposure?: {
    orderValueINR: number;
    maximumOrderValueAtRiskINR: number;
    estimatedLossINR: number | null;
    note: string;
  };
  disclaimer: string;
};

const card = "rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6";

const field =
  "mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#34d399]";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const levelColor = (level: RiskLevel) =>
  level === "High" ? "#ff3b5c" : level === "Medium" ? "#ffb000" : "#34d399";

function RiskRing({ score, level }: { score: number; level: RiskLevel }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 43;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke={levelColor(level)}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safeScore / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-white">{safeScore}</span>
        <span className="text-xs text-white/60">out of 100</span>
      </div>
    </div>
  );
}

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

    void checkSession();

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

  async function analyzeOrder(event: React.FormEvent<HTMLFormElement>) {
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
        throw new Error("Please log in again to continue.");
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

      setResult(data as Analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Unable to log out. Please try again.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/80">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[#34d399]" />
        Checking your login...
      </div>
    );
  }

  const score = result?.riskScore;
  const factors = result?.scoreDrivers ?? [];
  const dataGaps = result?.dataGaps ?? [];
  const exposure = result?.financialExposure;

  return (
    <div className="min-h-screen text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ReturnShield <span className="text-[#34d399]">AI</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link href="/upload" className="rounded-lg bg-[#34d399] px-4 py-2 font-semibold text-black transition-colors hover:bg-[#6ee7b7]">
              Upload orders
            </Link>
            <Link href="/billing" className="text-white/80 transition-colors hover:text-[#34d399]">
              Billing
            </Link>
            <Link href="/" className="text-white/80 transition-colors hover:text-[#34d399]">
              Main site
            </Link>
            <button
              type="button"
              onClick={logOut}
              className="flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Check one order</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          Enter the details of an order and we will tell you how likely it is to come back.
          Have a whole file of orders? Use{" "}
          <Link href="/upload" className="font-semibold text-[#34d399] underline underline-offset-4">
            Upload orders
          </Link>
          .
        </p>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Form */}
          <form onSubmit={analyzeOrder} className={card}>
            <h2 className="text-lg font-semibold tracking-tight">Order details</h2>

            <label className="mt-4 block text-sm font-medium">
              Product or category
              <input
                required
                maxLength={120}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Running shoes"
                className={field}
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Order value (₹)
              <input
                required
                type="number"
                min="1"
                max="10000000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={field}
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Payment method
              <select value={payment} onChange={(e) => setPayment(e.target.value)} className={field}>
                <option value="COD">Cash on delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </label>

            <label className="mt-4 block text-sm font-medium">
              Delivery type
              <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={field}>
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#34d399] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#6ee7b7] disabled:opacity-60"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Checking..." : "Check this order"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="mt-4 text-xs leading-relaxed text-white/50">
              We use only the details you enter here. The result is an estimate, not a promise.
            </p>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#ff8097]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Could not check this order
                </div>
                <p className="mt-2 break-words text-sm leading-relaxed text-[#ff8097]/90">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="mt-2 text-sm text-[#34d399] underline underline-offset-4"
                >
                  Close
                </button>
              </div>
            )}
          </form>

          {/* Results */}
          <div className="min-w-0 space-y-5">
            <section className={card}>
              <h2 className="text-lg font-semibold tracking-tight">Return risk</h2>

              {result && typeof score === "number" ? (
                <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                  <RiskRing score={score} level={result.riskLevel} />
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold" style={{ color: levelColor(result.riskLevel) }}>
                      {result.riskLevel} risk
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {result.scoreType || "This score is an estimate from the details you entered."}
                    </p>
                    <p className="mt-3 text-sm text-white/50">
                      This is a guide, not an exact chance of return.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Your result will show here. Fill in the order details and press
                  &ldquo;Check this order&rdquo;.
                </p>
              )}
            </section>

            {/* ===== LOCK START: reasons, money and advice (Pro) ===== */}
            <PaywallGate
              title="Why it is risky and what to do"
              description="See what pushes this order's risk up, how much money is at stake, and what to do about it."
            >
              <section className={card}>
                <h2 className="text-lg font-semibold tracking-tight">What pushes the risk up</h2>

                {factors.length > 0 ? (
                  <div className="mt-5 space-y-5">
                    {factors.map((factor, index) => {
                      const width = Math.max(0, Math.min(100, Math.abs(factor.points)));
                      return (
                        <div key={`${factor.name}-${index}`}>
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <p className="font-semibold">{factor.name}</p>
                            <span className="font-bold tabular-nums text-[#34d399]">
                              {factor.points > 0 ? "+" : ""}
                              {factor.points} points
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#34d399]" style={{ width: `${width}%` }} />
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">{factor.explanation}</p>
                          <p className="text-xs leading-relaxed text-white/50">Based on: {factor.evidence}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/60">
                    The reasons will show here after you check an order.
                  </p>
                )}
              </section>

              <section className={`${card} mt-5`}>
                <h2 className="text-lg font-semibold tracking-tight">Money at stake</h2>

                {result && exposure ? (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm text-white/60">Order value</p>
                        <p className="mt-1 text-xl font-bold tabular-nums">{money(exposure.orderValueINR)}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm text-white/60">Estimated loss</p>
                        <p className="mt-1 text-xl font-bold tabular-nums">
                          {exposure.estimatedLossINR == null
                            ? "Not known yet"
                            : money(exposure.estimatedLossINR)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{exposure.note}</p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-white/60">
                    The money at stake will show here after you check an order.
                  </p>
                )}
              </section>

              <section className={`${card} mt-5`}>
                <h2 className="text-lg font-semibold tracking-tight">Summary and advice</h2>

                {result ? (
                  <div className="mt-4 space-y-5">
                    {result.executiveSummary && (
                      <p className="text-sm leading-relaxed text-white/80">{result.executiveSummary}</p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span className="text-white/60">
                        How sure we are: <span className="font-semibold text-white">{result.confidence || "Not given"}</span>
                      </span>
                      <span className="text-white/60">
                        How soon to act: <span className="font-semibold text-white">{result.actionPriority || "Review"}</span>
                      </span>
                    </div>

                    {result.reasons.length > 0 && (
                      <div className="border-t border-white/10 pt-5">
                        <p className="mb-2 text-sm font-semibold">What we noticed</p>
                        <ul className="space-y-2">
                          {result.reasons.map((reason, index) => (
                            <li key={`reason-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#34d399]" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendations.length > 0 && (
                      <div className="border-t border-white/10 pt-5">
                        <p className="mb-2 text-sm font-semibold">What you can do</p>
                        <ul className="space-y-2.5">
                          {result.recommendations.map((item, index) => (
                            <li key={`recommendation-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dataGaps.length > 0 && (
                      <div className="border-t border-white/10 pt-5">
                        <p className="mb-2 text-sm font-semibold text-[#ffb000]">Information we are missing</p>
                        <ul className="space-y-2">
                          {dataGaps.map((gap, index) => (
                            <li key={`gap-${index}`} className="text-sm leading-relaxed text-white/80">
                              • {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
                      {result.disclaimer}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/60">
                    The summary and advice will show here after you check an order.
                  </p>
                )}
              </section>
            </PaywallGate>
            {/* ===== LOCK END ===== */}
          </div>
        </div>
      </main>
    </div>
  );
}
