```tsx
"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ScanSearch,
  CircleDot,
} from "lucide-react";

import {
  sampleOrders,
  weeklyOrders,
  type PaymentMethod,
  type RiskLevel,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PaymentFilter = "All" | PaymentMethod;
type RiskFilter = "All" | RiskLevel;

const riskStyle: Record<RiskLevel, string> = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  High: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

function Filter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#91a99a]">
        {label}
      </span>

      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.07] bg-black/30 p-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
              value === o
                ? "bg-emerald-500 text-[#03130b] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : "text-[#a7b8ac] hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  accent = "green",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Activity;
  accent?: "green" | "red" | "gold" | "white";
}) {
  const accentColor = {
    green: "text-emerald-300",
    red: "text-rose-300",
    gold: "text-amber-300",
    white: "text-white",
  }[accent];

  const glowColor = {
    green: "from-emerald-500/[0.12]",
    red: "from-rose-500/[0.12]",
    gold: "from-amber-500/[0.12]",
    white: "from-white/[0.06]",
  }[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08]",
        "bg-gradient-to-br",
        glowColor,
        "to-[#0a1711] p-5",
        "transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/25",
      )}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl transition-all group-hover:bg-emerald-300/[0.06]" />

      <div className="relative flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9aafa0]">
          {label}
        </span>
        <Icon className={cn("size-[18px]", accentColor)} />
      </div>

      <div className="relative mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {value}
      </div>

      <div className="relative mt-3 flex items-center gap-2 text-xs text-[#9aafa0]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {note}
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const [payment, setPayment] = useState<PaymentFilter>("All");
  const [risk, setRisk] = useState<RiskFilter>("All");

  const rows = useMemo(
    () =>
      sampleOrders.filter(
        (o) =>
          (payment === "All" || o.payment === payment) &&
          (risk === "All" || o.risk === risk),
      ),
    [payment, risk],
  );

  const stats = useMemo(() => {
    const flagged = rows.filter((o) => o.risk !== "Low").length;
    const rto = rows.filter((o) => o.rto).length;
    const exposure = rows
      .filter((o) => o.risk === "High")
      .reduce((s, o) => s + o.value, 0);

    return {
      total: rows.length,
      flagged,
      rtoRate: rows.length ? Math.round((rto / rows.length) * 100) : 0,
      exposure,
    };
  }, [rows]);

  const distribution = (["Low", "Medium", "High"] as const).map((level) => ({
    level,
    COD: rows.filter((o) => o.risk === level && o.payment === "COD").length,
    Prepaid: rows.filter((o) => o.risk === level && o.payment === "Prepaid").length,
  }));

  const kpis = [
    {
      label: "Orders analysed",
      value: stats.total.toString(),
      note: "Sample order set",
      icon: Activity,
      accent: "white" as const,
    },
    {
      label: "Risk flagged",
      value: stats.flagged.toString(),
      note: "Model estimate",
      icon: ShieldAlert,
      accent: "red" as const,
    },
    {
      label: "Historical RTO",
      value: `${stats.rtoRate}%`,
      note: "Sample outcomes",
      icon: ScanSearch,
      accent: "gold" as const,
    },
    {
      label: "High-risk exposure",
      value: `₹${stats.exposure.toLocaleString("en-IN")}`,
      note: "Estimated exposure",
      icon: ShieldCheck,
      accent: "green" as const,
    },
  ];

  return (
    <section className="relative">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-emerald-500/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -right-8 top-20 -z-10 h-72 w-72 rounded-full bg-rose-600/[0.07] blur-[100px]" />

      <div className="overflow-hidden rounded-[1.75rem] border border-emerald-300/[0.15] bg-[#07130d]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {/* Dashboard top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08]">
              <ShieldCheck className="size-5 text-emerald-300" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-wide text-white">
                ReturnShield <span className="text-emerald-300">Intelligence</span>
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.17em] text-[#81998a]">
                Return risk monitoring
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-200">
              Preview environment
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {/* Heading and filter controls */}
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                <CircleDot className="size-3" />
                Risk intelligence overview
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your orders. <span className="text-emerald-300">Under control.</span>
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a7b8ac]">
                Explore sample order risks, historical patterns, and estimated
                exposure in one unified view.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Filter
                label="Payment"
                value={payment}
                options={["All", "COD", "Prepaid"] as const}
                onChange={setPayment}
              />
              <Filter
                label="Risk"
                value={risk}
                options={["All", "Low", "Medium", "High"] as const}
                onChange={setRisk}
              />
            </div>
          </div>

          {/* KPI cards */}
          <dl className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </dl>

          {/* Analytics */}
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-[#091710] p-4 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Risk distribution
                  </h3>
                  <p className="mt-1 text-xs text-[#8fa697]">
                    Order count by payment method
                  </p>
                </div>
                <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[10px] font-semibold text-emerald-200">
                  Sample data
                </span>
              </div>

              <div
                className="h-60"
                role="img"
                aria-label="Bar chart of order counts by risk level and payment method"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distribution}
                    margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(200,230,210,0.07)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="level"
                      stroke="#829889"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#829889"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#10251a",
                        border: "1px solid #294b38",
                        borderRadius: 12,
                        color: "#f4faf5",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: "#a7b8ac",
                      }}
                    />
                    <Bar
                      dataKey="COD"
                      fill="#f05269"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    />
                    <Bar
                      dataKey="Prepaid"
                      fill="#34d399"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#091710] p-4 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Weekly order signals
                  </h3>
                  <p className="mt-1 text-xs text-[#8fa697]">
                    Orders versus flagged orders
                  </p>
                </div>
                <span className="rounded-lg border border-rose-400/15 bg-rose-400/[0.06] px-2 py-1 text-[10px] font-semibold text-rose-200">
                  Illustrative
                </span>
              </div>

              <div
                className="h-60"
                role="img"
                aria-label="Line chart of weekly orders and flagged orders"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyOrders}
                    margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(200,230,210,0.07)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      stroke="#829889"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#829889"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#10251a",
                        border: "1px solid #294b38",
                        borderRadius: 12,
                        color: "#f4faf5",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: "#a7b8ac",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#34d399" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="flagged"
                      stroke="#f05269"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#f05269" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#091710]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Order risk signals
                </h3>
                <p className="mt-1 text-xs text-[#8fa697]">
                  Selected orders and recommended review actions
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-[#a7b8ac]">
                <ScanSearch className="size-3.5 text-emerald-300" />
                {rows.length} matching orders
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <caption className="sr-only">
                  Sample orders matching the selected filters
                </caption>

                <thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.12em] text-[#829889]">
                  <tr>
                    {[
                      "Order",
                      "Product",
                      "Payment",
                      "Risk",
                      "Reason",
                      "Suggested action",
                    ].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.slice(0, 6).map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-white/[0.055] transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#d4e3d8]">
                        {o.id}
                      </td>

                      <td className="px-4 py-3 text-[#e7f0e9]">{o.product}</td>

                      <td className="px-4 py-3 text-[#a7b8ac]">{o.payment}</td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold",
                            riskStyle[o.risk],
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {o.risk} · {o.score}
                        </span>
                      </td>

                      <td className="max-w-[200px] px-4 py-3 text-xs leading-relaxed text-[#a7b8ac]">
                        {o.reason}
                      </td>

                      <td className="max-w-[200px] px-4 py-3 text-xs leading-relaxed text-[#d4e3d8]">
                        {o.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length === 0 && (
                <p className="p-8 text-center text-sm text-[#a7b8ac]">
                  No sample orders match these filters. Try another combination.
                </p>
              }
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-4 flex flex-col gap-2 text-[11px] leading-relaxed text-[#81988a] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Scores and outcomes shown are illustrative values from a fictional dataset.
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-300" />
              Suggested actions require your approval.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
```
