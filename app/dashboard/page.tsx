
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  FileSearch,
  Fingerprint,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

const inputClass =
  "mt-2.5 w-full rounded-md border border-[#29374B] bg-[#0A1424] px-3.5 py-3 text-sm text-[#E6EDF5] outline-none transition placeholder:text-[#64748B] focus:border-[#35C9B7] focus:ring-1 focus:ring-[#35C9B7]/30";

const panelClass =
  "rounded-lg border border-[#263449] bg-[#101B2C]";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles = {
    Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    High: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs font-semibold ${styles[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level.toUpperCase()} RISK
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8193AA]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-base font-semibold tracking-tight text-[#EDF3FA]">
        {title}
      </h2>
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
        throw new Error("Your session has expired. Please log in again.");
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
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080F1C] text-[#DCE6F2]">
        <div className="flex items-center gap-3 text-sm text-[#91A2B8]">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#35C9B7]" />
          Verifying secure session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080F1C] text-[#DCE6F2]">
      <header className="sticky top-0 z-20 border-b border-[#263449] bg-[#0B1423]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[66px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-7">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#35C9B7]/30 bg-[#35C9B7]/10">
              <ShieldCheck className="h-5 w-5 text-[#35C9B7]" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">
                ReturnShield <span className="text-[#35C9B7]">AI</span>
              </p>
              <p className="mt-0.5 hidden text-[9px] uppercase tracking-[0.16em] text-[#8091A8] sm:block">
                Risk intelligence platform
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs sm:gap-7">
            <Link
              href="/#features"
              className="hidden text-[#A1B0C3] transition hover:text-white sm:block"
            >
              Platform
            </Link>
            <span className="flex items-center gap-2 font-medium text-[#E5EDF7]">
              <Activity className="h-4 w-4 text-[#35C9B7]" />
              Workspace
            </span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
                router.refresh();
              }}
              className="rounded-md border border-[#34445B] px-3 py-2 text-[#C4D0DF] transition hover:border-[#73859E] hover:bg-white/5"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 sm:py-9">
        <div className="flex flex-col justify-between gap-5 border-b border-[#263449] pb-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#35C9B7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35C9B7]" />
              Risk operations / Order intelligence
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Risk analysis workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#91A2B8]">
              Evaluate order-level operational risks and identify practical
              verification steps before dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-md border border-[#263449] bg-[#101B2C] px-3 py-2 lg:self-auto">
            <LockKeyhole className="h-3.5 w-3.5 text-[#35C9B7]" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#A9B8CA]">
              Authenticated workspace
            </span>
          </div>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#91A2B8]">Assessment engine</p>
              <Sparkles className="h-4 w-4 text-[#35C9B7]" />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">AI-assisted</p>
            <p className="mt-1 text-[11px] text-[#8193AA]">
              Gemini analysis
            </p>
          </div>

          <div className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#91A2B8]">Order under review</p>
              <Layers3 className="h-4 w-4 text-[#35C9B7]" />
            </div>
            <p className="mt-3 truncate text-lg font-semibold text-white">
              {product.trim() || "Not specified"}
            </p>
            <p className="mt-1 text-[11px] text-[#8193AA]">
              Current assessment input
            </p>
          </div>

          <div className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#91A2B8]">Gross order value</p>
              <Wallet className="h-4 w-4 text-[#35C9B7]" />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {formatINR(Number(amount) || 0)}
            </p>
            <p className="mt-1 text-[11px] text-[#8193AA]">
              Indicative order value
            </p>
          </div>

          <div className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#91A2B8]">Review status</p>
              <Clock3 className="h-4 w-4 text-[#35C9B7]" />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {loading ? "Processing" : result ? "Completed" : "Awaiting input"}
            </p>
            <p className="mt-1 text-[11px] text-[#8193AA]">
              {loading ? "Analysis in progress" : "Current session"}
            </p>
          </div>
        </section>

        <section className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.4fr)]">
          <form
            onSubmit={analyzeOrder}
            className={`${panelClass} p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#263449] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8193AA]">
                  Input parameters
                </p>
                <h2 className="mt-1.5 text-base font-semibold text-white">
                  Order configuration
                </h2>
              </div>
              <div className="rounded-md border border-[#34445B] p-2">
                <FileSearch className="h-4 w-4 text-[#35C9B7]" />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="product"
                className="text-xs font-medium text-[#C4D0DF]"
              >
                Product name or category
              </label>
              <input
                id="product"
                required
                maxLength={120}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Running shoes"
                className={inputClass}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="amount"
                className="text-xs font-medium text-[#C4D0DF]"
              >
                Order value (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8193AA]">
                  ₹
                </span>
                <input
                  id="amount"
                  required
                  type="number"
                  min="1"
                  max="10000000"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="payment"
                className="text-xs font-medium text-[#C4D0DF]"
              >
                Payment method
              </label>
              <select
                id="payment"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className={inputClass}
              >
                <option value="COD">Cash on delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>

            <div className="mt-5">
              <label
                htmlFor="delivery"
                className="text-xs font-medium text-[#C4D0DF]"
              >
                Delivery service
              </label>
              <select
                id="delivery"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className={inputClass}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-[#43D7C4]/40 bg-[#25BDAE] px-4 py-3 text-sm font-semibold text-[#06151B] transition hover:bg-[#43D7C4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Evaluating order...
                </>
              ) : (
                <>
                  <ShieldEllipsis className="h-4 w-4" />
                  Run risk assessment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 border-t border-[#263449] pt-4">
              <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8193AA]" />
              <p className="text-[10px] leading-5 text-[#8193AA]">
                Analysis uses the order details supplied. A risk assessment
                is not a verified prediction of customer behavior.
              </p>
            </div>
          </form>

          <div className={`${panelClass} min-w-0 p-5 sm:p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#263449] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8193AA]">
                  Intelligence report
                </p>
                <h2 className="mt-1.5 text-base font-semibold text-white">
                  Assessment output
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#91A2B8]">
                <Database className="h-3.5 w-3.5" />
                Order-level review
              </div>
            </div>

            {!result && !loading && !error && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#34445B] bg-[#0A1424]">
                  <BarChart3 className="h-6 w-6 text-[#35C9B7]" />
                </div>
                <h3 className="mt-5 text-sm font-semibold text-[#E3EBF5]">
                  Intelligence report pending
                </h3>
                <p className="mt-2 max-w-sm text-xs leading-6 text-[#8193AA]">
                  Submit the order parameters to generate risk observations,
                  recommended controls, and available data limitations.
                </p>
              </div>
            )}

            {loading && (
              <div
                role="status"
                className="flex min-h-[320px] flex-col items-center justify-center text-center"
              >
                <LoaderCircle className="h-8 w-8 animate-spin text-[#35C9B7]" />
                <p className="mt-5 text-sm font-medium text-white">
                  Processing risk assessment
                </p>
                <p className="mt-2 text-xs text-[#8193AA]">
                  Reviewing supplied order parameters...
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-md border border-rose-500/30 bg-rose-500/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                  <div>
                    <p className="text-sm font-semibold text-rose-200">
                      Assessment could not be completed
                    </p>
                    <p className="mt-2 text-xs leading-5 text-rose-200/80">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .querySelector("form")
                          ?.requestSubmit()
                      }
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#35C9B7] hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry assessment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8193AA]">
                      Preliminary risk classification
                    </p>
                    <div className="mt-3">
                      <RiskBadge level={result.riskLevel} />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#A3B1C4]">
                      {result.scoreType ||
                        "Preliminary operational assessment"}
                    </p>
                  </div>

                  {typeof result.riskScore === "number" && (
                    <div className="rounded-md border border-[#34445B] bg-[#0A1424] p-4 sm:min-w-[125px]">
                      <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                        Review score
                      </p>
                      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-white">
                        {result.riskScore}
                        <span className="text-sm text-[#8193AA]">/100</span>
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#263449]">
                        <div
                          className="h-full rounded-full bg-[#35C9B7]"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, result.riskScore),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {result.executiveSummary && (
                  <div className="rounded-md border border-[#34445B] bg-[#0A1424] p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#35C9B7]" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#DCE6F2]">
                        Executive brief
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#B9C7D8]">
                      {result.executiveSummary}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-[#263449] bg-[#0D1727] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                      Confidence
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {result.confidence || "Not provided"}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#8193AA]">
                      Confidence in this preliminary assessment
                    </p>
                  </div>
                  <div className="rounded-md border border-[#263449] bg-[#0D1727] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                      Action priority
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {result.actionPriority || "Review"}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#8193AA]">
                      Suggested operational attention
                    </p>
                  </div>
                </div>

                {result.financialExposure && (
                  <div>
                    <SectionHeading
                      eyebrow="Financial overview"
                      title="Order exposure"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-[#263449] p-4">
                        <p className="text-[10px] text-[#8193AA]">
                          Gross order value
                        </p>
                        <p className="mt-2 font-mono text-lg text-white">
                          {formatINR(
                            result.financialExposure.orderValueINR,
                          )}
                        </p>
                      </div>
                      <div className="rounded-md border border-[#263449] p-4">
                        <p className="text-[10px] text-[#8193AA]">
                          Estimated financial loss
                        </p>
                        <p className="mt-2 font-mono text-lg text-white">
                          {result.financialExposure.estimatedLossINR == null
                            ? "Not established"
                            : formatINR(
                                result.financialExposure.estimatedLossINR,
                              )}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-5 text-[#8193AA]">
                      {result.financialExposure.note}
                    </p>
                  </div>
                )}

                <div>
                  <SectionHeading
                    eyebrow="Analyst findings"
                    title="Risk drivers & observations"
                  />
                  <div className="space-y-3">
                    {(result.scoreDrivers || []).map((factor, index) => (
                      <div
                        key={`${factor.name}-${index}`}
                        className="rounded-md border border-[#263449] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-medium text-[#E5EDF7]">
                            {factor.name}
                          </h3>
                          <span className="shrink-0 font-mono text-xs text-[#35C9B7]">
                            +{factor.points} pts
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#A7B6C8]">
                          {factor.explanation}
                        </p>
                        <p className="mt-2 text-[10px] leading-5 text-[#8193AA]">
                          Evidence: {factor.evidence}
                        </p>
                      </div>
                    ))}

                    {result.reasons.map((reason, index) => (
                      <div
                        key={`reason-${index}`}
                        className="flex items-start gap-3 rounded-md border border-[#263449] p-4"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#34445B] text-[10px] font-semibold text-[#35C9B7]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <p className="text-xs leading-6 text-[#B9C7D8]">
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeading
                    eyebrow="Recommended controls"
                    title="Next actions"
                  />
                  <div className="space-y-3">
                    {result.recommendations.map((item, index) => (
                      <div
                        key={`action-${index}`}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#35C9B7]" />
                        <p className="text-xs leading-6 text-[#B9C7D8]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.dataGaps && result.dataGaps.length > 0 && (
                  <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] p-4">
                    <div className="flex items-center gap-2">
                      <CircleAlert className="h-4 w-4 text-amber-300" />
                      <h3 className="text-xs font-semibold text-amber-100">
                        Data gaps & limitations
                      </h3>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {result.dataGaps.map((gap, index) => (
                        <li
                          key={`gap-${index}`}
                          className="flex items-start gap-2 text-xs leading-5 text-[#C0B69F]"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-[#263449] pt-4">
                  <p className="text-[10px] leading-5 text-[#8193AA]">
                    {result.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-[#263449] py-5 text-[10px] text-[#71839A] sm:flex-row sm:items-center">
          <p>RETURNSHIELD AI · ORDER RISK INTELLIGENCE</p>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5" />
            <span>Authenticated session</span>
            <span className="mx-1 text-[#34445B]">|</span>
            <span>AI-assisted assessment</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
