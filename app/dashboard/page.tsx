
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Database,
  FileSearch,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
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

const panel =
  "rounded-lg border border-[#29374B] bg-[#101B2C]";

const field =
  "mt-2 w-full rounded-md border border-[#29374B] bg-[#0A1424] px-3 py-3 text-sm text-[#E6EDF5] outline-none focus:border-[#35C9B7]";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Heading({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8193AA]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#E8EEF6]">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function RiskRing({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const safeScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 43;
  const color =
    level === "High"
      ? "#EE7D88"
      : level === "Medium"
        ? "#E5B45F"
        : "#42C6A5";

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="#263449"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - safeScore / 100)
          }
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold text-white">
          {safeScore}
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-wider text-[#8193AA]">
          Out of 100
        </span>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center px-5 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#34445B] bg-[#0A1424] text-[#35C9B7]">
        {icon}
      </div>
      <p className="mt-3 text-xs font-semibold text-[#DCE6F2]">
        {title}
      </p>
      <p className="mt-2 max-w-xs text-[11px] leading-5 text-[#8193AA]">
        {description}
      </p>
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
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[#35C9B7]" />
        Verifying secure session...
      </main>
    );
  }

  const score = result?.riskScore;
  const factors = result?.scoreDrivers ?? [];
  const dataGaps = result?.dataGaps ?? [];
  const exposure = result?.financialExposure;

  return (
    <main className="min-h-screen bg-[#080F1C] text-[#DCE6F2]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[218px] shrink-0 border-r border-[#263449] bg-[#0B1423] lg:flex lg:flex-col">
          <Link href="/" className="flex h-[65px] items-center gap-3 border-b border-[#263449] px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#35C9B7]/30 bg-[#35C9B7]/10">
              <ShieldCheck className="h-4 w-4 text-[#35C9B7]" />
            </div>
            <span className="text-sm font-bold text-white">
              ReturnShield <span className="text-[#35C9B7]">AI</span>
            </span>
          </Link>

          <div className="px-4 pt-6">
            <p className="px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71839A]">
              Workspace
            </p>
            <nav className="mt-3 space-y-1">
              <div className="flex items-center gap-3 rounded-md border border-[#35C9B7]/20 bg-[#35C9B7]/10 px-3 py-2.5 text-xs font-medium text-[#55D7C7]">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-[#91A2B8]">
                <FileSearch className="h-4 w-4" />
                Order intelligence
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-[#91A2B8]">
                <Activity className="h-4 w-4" />
                Risk monitor
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-xs text-[#91A2B8]">
                <Database className="h-4 w-4" />
                Data quality
              </div>
            </nav>
          </div>

          <div className="mt-auto border-t border-[#263449] p-4">
            <div className="flex items-center gap-2 text-[10px] text-[#91A2B8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#42C6A5]" />
              Secure session active
            </div>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  setError("Unable to log out. Please try again.");
                  return;
                }
                router.replace("/login");
                router.refresh();
              }}
              className="mt-4 w-full rounded border border-[#34445B] px-3 py-2 text-left text-xs text-[#C0CDDC] hover:bg-white/5"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-[65px] items-center justify-between gap-3 border-b border-[#263449] bg-[#0B1423] px-4 sm:px-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#8193AA]">
                Risk intelligence / Order review
              </p>
              <h1 className="mt-1 text-sm font-semibold text-white">
                Analytical workspace
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-[10px] text-[#91A2B8] sm:flex">
                <LockKeyhole className="h-3.5 w-3.5 text-[#35C9B7]" />
                Authenticated
              </span>
              <Link
                href="/"
                className="rounded border border-[#34445B] px-3 py-2 text-[11px] text-[#C0CDDC] hover:bg-white/5"
              >
                Main site
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#35C9B7]">
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#35C9B7]" />
                  Institutional risk analytics
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Order risk intelligence
                </h2>
                <p className="mt-1 text-xs text-[#91A2B8]">
                  Assess operational signals, review exposure, and identify
                  missing evidence.
                </p>
              </div>

              <span className="rounded border border-[#29374B] bg-[#101B2C] px-3 py-2 text-[10px] text-[#91A2B8]">
                {result ? "REPORT GENERATED" : "AWAITING ASSESSMENT"}
              </span>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className={`${panel} p-4`}>
                <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                  Order value
                </p>
                <p className="mt-2 font-mono text-xl text-white">
                  {money(Number(amount) || 0)}
                </p>
                <p className="mt-1 text-[10px] text-[#8193AA]">
                  Current form input
                </p>
              </div>

              <div className={`${panel} p-4`}>
                <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                  Risk classification
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {result?.riskLevel ?? "Not assessed"}
                </p>
                <p className="mt-1 text-[10px] text-[#8193AA]">
                  {result ? "Latest completed analysis" : "No result available"}
                </p>
              </div>

              <div className={`${panel} p-4`}>
                <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                  Review score
                </p>
                <p className="mt-2 font-mono text-xl text-white">
                  {typeof score === "number" ? `${score}/100` : "—"}
                </p>
                <p className="mt-1 text-[10px] text-[#8193AA]">
                  {result ? "Provisional score" : "Generated after assessment"}
                </p>
              </div>

              <div className={`${panel} p-4`}>
                <p className="text-[10px] uppercase tracking-wider text-[#8193AA]">
                  Evidence gaps
                </p>
                <p className="mt-2 font-mono text-xl text-white">
                  {result ? dataGaps.length : "—"}
                </p>
                <p className="mt-1 text-[10px] text-[#8193AA]">
                  Missing information identified
                </p>
              </div>
            </section>

            <section className="mt-4 grid items-start gap-4 2xl:grid-cols-[300px_minmax(0,1fr)_310px]">
              <form onSubmit={analyzeOrder} className={`${panel} p-4`}>
                <Heading
                  eyebrow="01 / Inputs"
                  title="Order parameters"
                  right={<FileSearch className="h-4 w-4 text-[#35C9B7]" />}
                />

                <label className="block text-xs text-[#C0CDDC]">
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

                <label className="mt-4 block text-xs text-[#C0CDDC]">
                  Order value (INR)
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

                <label className="mt-4 block text-xs text-[#C0CDDC]">
                  Payment method
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className={field}
                  >
                    <option value="COD">Cash on delivery</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </label>

                <label className="mt-4 block text-xs text-[#C0CDDC]">
                  Delivery service
                  <select
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    className={field}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-[#35C9B7]/30 bg-[#25B9AA] px-3 py-3 text-xs font-semibold text-[#06151B] hover:bg-[#35C9B7] disabled:opacity-60"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? "Analyzing..." : "Run assessment"}
                  {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                </button>

                <p className="mt-3 border-t border-[#29374B] pt-3 text-[10px] leading-5 text-[#8193AA]">
                  Assessment uses only supplied order information and available
                  model output.
                </p>

                {error && (
                  <div role="alert" className="mt-4 rounded border border-rose-500/30 bg-rose-500/5 p-3">
                    <div className="flex gap-2 text-xs font-semibold text-rose-200">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Analysis unavailable
                    </div>
                    <p className="mt-2 break-words text-[11px] leading-5 text-rose-200/80">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="mt-2 text-[10px] text-[#35C9B7] underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </form>

              <div className="min-w-0 space-y-4">
                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="02 / Quantitative overview"
                    title="Risk score & classification"
                    right={<Activity className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {result && typeof score === "number" ? (
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                      <RiskRing score={score} level={result.riskLevel} />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-white">
                          {result.riskLevel} risk
                        </p>
                        <p className="mt-2 text-xs leading-6 text-[#A9B8CA]">
                          {result.scoreType ||
                            "Provisional operational review score."}
                        </p>
                        <div className="mt-3 inline-flex rounded border border-[#29374B] bg-[#0A1424] px-2.5 py-1.5 text-[10px] text-[#91A2B8]">
                          Not a validated return probability
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyPanel
                      icon={<BarChart3 className="h-5 w-5" />}
                      title="Risk score not yet available"
                      description="Run an assessment to display the score returned by the analysis API. No synthetic score is shown."
                    />
                  )}
                </section>

                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="03 / Factor attribution"
                    title="Risk-driver contribution"
                    right={<Activity className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {factors.length > 0 ? (
                    <div className="space-y-4">
                      {factors.map((factor, index) => {
                        const width = Math.max(
                          0,
                          Math.min(100, Math.abs(factor.points)),
                        );

                        return (
                          <div key={`${factor.name}-${index}`}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-medium text-[#DCE6F2]">
                                {factor.name}
                              </p>
                              <span className="font-mono text-[11px] text-[#35C9B7]">
                                {factor.points > 0 ? "+" : ""}
                                {factor.points} pts
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#263449]">
                              <div
                                className="h-full rounded-full bg-[#35BFAF]"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <p className="mt-2 text-[10px] leading-5 text-[#8193AA]">
                              {factor.explanation}
                            </p>
                            <p className="text-[10px] leading-5 text-[#71839A]">
                              Evidence: {factor.evidence}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyPanel
                      icon={<Activity className="h-5 w-5" />}
                      title="No factor data"
                      description="Factor contribution bars will use the score-driver values returned by the API."
                    />
                  )}
                </section>

                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="04 / Exposure analysis"
                    title="Financial exposure"
                    right={<Wallet className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {result && exposure ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-[#29374B] bg-[#0A1424] p-3">
                          <p className="text-[10px] text-[#8193AA]">
                            Gross order value
                          </p>
                          <p className="mt-2 font-mono text-lg text-white">
                            {money(exposure.orderValueINR)}
                          </p>
                        </div>
                        <div className="rounded-md border border-[#29374B] bg-[#0A1424] p-3">
                          <p className="text-[10px] text-[#8193AA]">
                            Estimated loss
                          </p>
                          <p className="mt-2 font-mono text-lg text-white">
                            {exposure.estimatedLossINR == null
                              ? "Not established"
                              : money(exposure.estimatedLossINR)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] leading-5 text-[#8193AA]">
                        {exposure.note}
                      </p>
                    </>
                  ) : (
                    <EmptyPanel
                      icon={<Wallet className="h-5 w-5" />}
                      title="Exposure analysis pending"
                      description="Order value alone cannot establish actual loss. Cost and logistics inputs are needed for a loss estimate."
                    />
                  )}
                </section></PaywallGate>
              </div>

              <div className="min-w-0 space-y-4">
                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="05 / Data controls"
                    title="Data-quality matrix"
                    right={<Database className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {result ? (
                    <div className="space-y-2">
                      {[
                        {
                          label: "Order inputs",
                          status: "Available",
                          good: true,
                        },
                        {
                          label: "Customer history",
                          status: "Not supplied",
                          good: false,
                        },
                        {
                          label: "Historical return outcomes",
                          status: "Not supplied",
                          good: false,
                        },
                        {
                          label: "Validated prediction model",
                          status: "Not established",
                          good: false,
                        },
                        {
                          label: "Additional data gaps",
                          status:
                            dataGaps.length === 0
                              ? "Not reported"
                              : `${dataGaps.length} identified`,
                          good: false,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-2 border-b border-[#29374B] py-2.5 last:border-0"
                        >
                          <span className="text-[10px] text-[#A9B8CA]">
                            {item.label}
                          </span>
                          <span
                            className={`shrink-0 text-[9px] font-medium ${
                              item.good
                                ? "text-emerald-300"
                                : "text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyPanel
                      icon={<Database className="h-5 w-5" />}
                      title="Awaiting data assessment"
                      description="Data-quality indicators will be shown after an analysis is returned."
                    />
                  )}
                </section><PaywallGate title="AI brief and recommendations">

                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="06 / Analyst commentary"
                    title="Executive intelligence brief"
                    right={<Sparkles className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {result?.executiveSummary ? (
                    <>
                      <p className="text-xs leading-6 text-[#B9C7D8]">
                        {result.executiveSummary}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[#29374B] pt-3">
                        <span className="text-[10px] text-[#8193AA]">
                          Assessment confidence
                        </span>
                        <span className="text-[10px] font-semibold text-[#E5B45F]">
                          {result.confidence || "Not provided"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-[#8193AA]">
                          Action priority
                        </span>
                        <span className="text-[10px] font-semibold text-[#DCE6F2]">
                          {result.actionPriority || "Review"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <EmptyPanel
                      icon={<CircleHelp className="h-5 w-5" />}
                      title="No executive brief"
                      description="This section appears when the API returns an executive summary."
                    />
                  )}
                </section>

                <section className={`${panel} p-4`}>
                  <Heading
                    eyebrow="07 / Evidence review"
                    title="Findings & recommendations"
                    right={<CheckCircle2 className="h-4 w-4 text-[#35C9B7]" />}
                  />

                  {result ? (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8193AA]">
                          Observations
                        </p>
                        <ul className="space-y-2">
                          {result.reasons.map((reason, index) => (
                            <li
                              key={`reason-${index}`}
                              className="flex items-start gap-2 text-[11px] leading-5 text-[#B9C7D8]"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#35C9B7]" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-[#29374B] pt-4">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8193AA]">
                          Recommended actions
                        </p>
                        <ul className="space-y-3">
                          {result.recommendations.map((item, index) => (
                            <li
                              key={`recommendation-${index}`}
                              className="flex items-start gap-2 text-[11px] leading-5 text-[#B9C7D8]"
                            >
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#35C9B7]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {dataGaps.length > 0 && (
                        <div className="border-t border-[#29374B] pt-4">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                            Missing evidence
                          </p>
                          <ul className="space-y-2">
                            {dataGaps.map((gap, index) => (
                              <li
                                key={`gap-${index}`}
                                className="text-[11px] leading-5 text-[#B9C7D8]"
                              >
                                • {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="border-t border-[#29374B] pt-3 text-[10px] leading-5 text-[#8193AA]">
                        {result.disclaimer}
                      </p>
                    </div>
                  ) : (
                    <EmptyPanel
                      icon={<FileSearch className="h-5 w-5" />}
                      title="No findings available"
                      description="Evidence and recommendations will appear here after a successful API response."
                    />
                  )}
                </section>
              </div>
            </section>

            <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#263449] py-4 text-[9px] uppercase tracking-wider text-[#71839A]">
              <span>ReturnShield AI · Risk intelligence</span>
              <span className="flex items-center gap-2">
                <LockKeyhole className="h-3 w-3" />
                Authenticated workspace
              </span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
