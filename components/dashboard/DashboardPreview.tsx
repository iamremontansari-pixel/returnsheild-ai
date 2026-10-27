"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  Activity,
  Cpu,
  Radio,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
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

/* ---------- Terminal palette ---------- */
const AMBER = "#ffb000";
const GREEN = "#00e676";
const RED = "#ff3b5c";
const CYAN = "#22d3ee";
const GRID = "rgba(255,176,0,0.08)";
const AXIS = "#8a6a2a";

const riskText: Record<RiskLevel, string> = {
  Low: "text-[#00e676]",
  Medium: "text-[#ffb000]",
  High: "text-[#ff3b5c]",
};

const riskChip: Record<RiskLevel, string> = {
  Low: "border-[#00e676]/40 bg-[#00e676]/10 text-[#00e676]",
  Medium: "border-[#ffb000]/40 bg-[#ffb000]/10 text-[#ffb000]",
  High: "border-[#ff3b5c]/40 bg-[#ff3b5c]/10 text-[#ff3b5c]",
};

const riskBar: Record<RiskLevel, string> = {
  Low: "bg-[#00e676]",
  Medium: "bg-[#ffb000]",
  High: "bg-[#ff3b5c]",
};

const tooltipStyle = {
  background: "#050505",
  border: "1px solid #ffb000",
  borderRadius: 0,
  color: "#ffb000",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11,
};

const terminalCss = `
@keyframes rs-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes rs-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.rs-marquee { animation: rs-marquee 60s linear infinite; }
.rs-marquee:hover { animation-play-state: paused; }
.rs-blink { animation: rs-blink 1.1s steps(1) infinite; }
.rs-scan {
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.025) 0px,
    rgba(255,255,255,0.025) 1px,
    transparent 1px,
    transparent 3px
  );
}
@media (prefers-reduced-motion: reduce) {
  .rs-marquee, .rs-blink { animation: none; }
}
`;

/* ---------- Building blocks ---------- */

function Panel({
  title,
  tag,
  right,
  className,
  children,
}: {
  title: string;
  tag?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative border border-[#ffb000]/25 bg-[#050505]",
        "shadow-[inset_0_0_40px_rgba(255,176,0,0.03)]",
        className,
      )}
    >
      {/* corner brackets */}
      <span className="pointer-events-none absolute -left-px -top-px size-2 border-l-2 border-t-2 border-[#ffb000]" />
      <span className="pointer-events-none absolute -right-px -top-px size-2 border-r-2 border-t-2 border-[#ffb000]" />
      <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-[#ffb000]" />
      <span className="pointer-events-none absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-[#ffb000]" />

      <header className="flex items-center justify-between gap-3 border-b border-[#ffb000]/25 bg-[#ffb000]/[0.06] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-[#ffb000] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
            {tag ?? "RS"}
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffb000]">
            {title}
          </h3>
        </div>
        {right}
      </header>

      <div className="p-3">{children}</div>
    </section>
  );
}

function Toggle<T extends string>({
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
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6a2a]">
        {label}
      </span>
      <div className="flex border border-[#ffb000]/30">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "border-r border-[#ffb000]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors last:border-r-0",
              value === o
                ? "bg-[#ffb000] text-black"
                : "text-[#ffb000]/80 hover:bg-[#ffb000]/10 hover:text-[#ffb000]",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Spark({ data, dataKey, color }: { data: object[]; dataKey: string; color: string }) {
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Kpi({
  label,
  value,
  note,
  icon: Icon,
  color,
  spark,
  sparkKey,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  color: string;
  spark: object[];
  sparkKey: string;
}) {
  return (
    <div className="group relative border border-[#ffb000]/25 bg-[#050505] p-3 transition-colors hover:border-[#ffb000]/70">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6a2a]">
          {label}
        </span>
        <Icon className="size-4" style={{ color }} />
      </div>
      <div
        className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight"
        style={{ color, textShadow: `0 0 18px ${color}55` }}
      >
        {value}
      </div>
      <Spark data={spark} dataKey={sparkKey} color={color} />
      <div className="mt-1 text-[10px] uppercase tracking-widest text-[#8a6a2a]">{note}</div>
    </div>
  );
}

/* ---------- Dashboard ---------- */

export function DashboardPreview() {
  const [payment, setPayment] = useState<PaymentFilter>("All");
  const [risk, setRisk] = useState<RiskFilter>("All");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<string | null>(null);

  // Clock is set after mount so server and client markup match.
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sampleOrders.filter(
      (o) =>
        (payment === "All" || o.payment === payment) &&
        (risk === "All" || o.risk === risk) &&
        (!q ||
          o.id.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q) ||
          o.reason.toLowerCase().includes(q)),
    );
  }, [payment, risk, query]);

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

  const distribution = useMemo(
    () =>
      (["Low", "Medium", "High"] as const).map((level) => ({
        level,
        COD: rows.filter((o) => o.risk === level && o.payment === "COD").length,
        Prepaid: rows.filter((o) => o.risk === level && o.payment === "Prepaid").length,
      })),
    [rows],
  );

  const mix = useMemo(
    () =>
      (["High", "Medium", "Low"] as const).map((level) => {
        const count = rows.filter((o) => o.risk === level).length;
        return {
          level,
          count,
          pct: rows.length ? Math.round((count / rows.length) * 100) : 0,
        };
      }),
    [rows],
  );

  const priority = useMemo(
    () => [...rows].sort((a, b) => b.score - a.score).slice(0, 5),
    [rows],
  );

  // Derived series for the KPI sparklines (illustrative).
  const sparkData = useMemo(
    () =>
      weeklyOrders.map((w) => ({
        ...w,
        rate: w.orders ? Math.round((w.flagged / w.orders) * 100) : 0,
      })),
    [],
  );

  const tickerItems = useMemo(
    () => [
      { k: "ORDERS", v: String(stats.total), c: AMBER },
      { k: "FLAGGED", v: String(stats.flagged), c: RED },
      { k: "RTO", v: `${stats.rtoRate}%`, c: AMBER },
      { k: "EXPOSURE", v: `₹${stats.exposure.toLocaleString("en-IN")}`, c: GREEN },
      ...priority.map((o) => ({
        k: o.id,
        v: `${o.risk.toUpperCase()} ${o.score}`,
        c: o.risk === "High" ? RED : o.risk === "Medium" ? AMBER : GREEN,
      })),
    ],
    [stats, priority],
  );

  return (
    <section
      className="relative overflow-hidden border border-[#ffb000]/30 bg-black font-mono text-[#ffb000]"
      aria-label="ReturnShield risk terminal"
    >
      <style>{terminalCss}</style>

      {/* ambient glow + scanlines */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-[#ffb000]/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-[#22d3ee]/[0.05] blur-[110px]" />
      <div className="rs-scan pointer-events-none absolute inset-0 z-20" />

      {/* ===== Top command bar ===== */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 border-b border-[#ffb000]/30 bg-[#0b0800] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center bg-[#ffb000] text-black">
            <ShieldCheck className="size-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-[0.2em]">
              RETURN<span className="text-white">SHIELD</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#8a6a2a]">
              AI Risk Terminal · RTO Desk
            </div>
          </div>
        </div>

        <label className="flex min-w-[200px] flex-1 items-center gap-2 border border-[#ffb000]/40 bg-black px-2 py-1.5 focus-within:border-[#ffb000] focus-within:shadow-[0_0_0_1px_#ffb000]">
          <Search className="size-3.5 text-[#8a6a2a]" />
          <span className="text-[11px] font-bold text-[#8a6a2a]">&gt;</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH ORDER ID / PRODUCT / REASON"
            aria-label="Search orders"
            className="w-full bg-transparent text-[11px] uppercase tracking-wider text-[#ffb000] outline-none placeholder:text-[#5c4718]"
          />
          <span className="rs-blink h-3.5 w-1.5 bg-[#ffb000]" />
        </label>

        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span className="flex items-center gap-1.5 text-[#00e676]">
            <Radio className="size-3.5" />
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00e676] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#00e676]" />
            </span>
            SIM FEED
          </span>
          <span className="tabular-nums text-white">
            {now ?? "--:--:--"} <span className="text-[#8a6a2a]">IST</span>
          </span>
        </div>
      </div>

      {/* ===== Ticker tape ===== */}
      <div className="relative z-10 overflow-hidden border-b border-[#ffb000]/30 bg-black py-1.5">
        <div className="rs-marquee flex w-max gap-8 whitespace-nowrap pr-8">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-[11px] font-bold tracking-wider">
              <span className="text-[#8a6a2a]">{t.k}</span>
              <span style={{ color: t.c }}>{t.v}</span>
              <span className="text-[#3a2c0c]">|</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-3 p-3">
        {/* ===== Filters ===== */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6a2a]">
              Function · Risk Overview
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.12em] text-white sm:text-xl">
              Your orders. <span className="text-[#ffb000]">Under control.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Toggle<PaymentFilter>
              label="Pay"
              value={payment}
              options={["All", "COD", "Prepaid"]}
              onChange={setPayment}
            />
            <Toggle<RiskFilter>
              label="Risk"
              value={risk}
              options={["All", "Low", "Medium", "High"]}
              onChange={setRisk}
            />
          </div>
        </div>

        {/* ===== KPI row ===== */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Orders analysed"
            value={stats.total.toString()}
            note="Sample order set"
            icon={Activity}
            color="#ffffff"
            spark={sparkData}
            sparkKey="orders"
          />
          <Kpi
            label="Risk flagged"
            value={stats.flagged.toString()}
            note="Model estimate"
            icon={ShieldAlert}
            color={RED}
            spark={sparkData}
            sparkKey="flagged"
          />
          <Kpi
            label="Historical RTO"
            value={`${stats.rtoRate}%`}
            note="Sample outcomes"
            icon={ScanSearch}
            color={AMBER}
            spark={sparkData}
            sparkKey="rate"
          />
          <Kpi
            label="High-risk exposure"
            value={`₹${stats.exposure.toLocaleString("en-IN")}`}
            note="Estimated exposure"
            icon={ShieldCheck}
            color={GREEN}
            spark={sparkData}
            sparkKey="flagged"
          />
        </div>

        {/* ===== Main grid ===== */}
        <div className="grid gap-3 xl:grid-cols-12">
          {/* Left: charts + blotter */}
          <div className="space-y-3 xl:col-span-8">
            <div className="grid gap-3 lg:grid-cols-2">
              <Panel
                title="Risk Distribution"
                tag="RD"
                right={<span className="text-[9px] tracking-widest text-[#8a6a2a]">SAMPLE</span>}
              >
                <div
                  className="h-56"
                  role="img"
                  aria-label="Bar chart of order counts by risk level and payment method"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="level" stroke={AXIS} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <YAxis stroke={AXIS} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,176,0,0.06)" }} />
                      <Legend wrapperStyle={{ fontSize: 10, color: AMBER }} />
                      <Bar dataKey="COD" fill={RED} maxBarSize={30} />
                      <Bar dataKey="Prepaid" fill={CYAN} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel
                title="Weekly Order Signals"
                tag="WS"
                right={<span className="text-[9px] tracking-widest text-[#8a6a2a]">ILLUSTRATIVE</span>}
              >
                <div
                  className="h-56"
                  role="img"
                  aria-label="Line chart of weekly orders and flagged orders"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyOrders} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} />
                      <XAxis dataKey="week" stroke={AXIS} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <YAxis stroke={AXIS} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 10, color: AMBER }} />
                      <Line type="monotone" dataKey="orders" stroke={AMBER} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: AMBER }} />
                      <Line type="monotone" dataKey="flagged" stroke={RED} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: RED }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* Order blotter */}
            <Panel
              title="Order Risk Blotter"
              tag="OB"
              right={
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#ffb000]">
                  <Cpu className="size-3" />
                  {rows.length} MATCHING
                </span>
              }
            >
              <div className="-m-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[11px]">
                  <caption className="sr-only">Sample orders matching the selected filters</caption>
                  <thead className="bg-[#ffb000]/[0.07] text-[10px] uppercase tracking-[0.14em] text-[#8a6a2a]">
                    <tr>
                      {["Order", "Product", "Pay", "Risk", "Score", "Reason", "Action"].map((h) => (
                        <th key={h} scope="col" className="px-3 py-2 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((o) => (
                      <tr
                        key={o.id}
                        className="border-t border-[#ffb000]/10 transition-colors hover:bg-[#ffb000]/[0.06]"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-bold text-white">{o.id}</td>
                        <td className="px-3 py-2 text-[#ffb000]">{o.product}</td>
                        <td className="px-3 py-2">
                          <span className={o.payment === "COD" ? "text-[#ff3b5c]" : "text-[#22d3ee]"}>
                            {o.payment}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-block border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              riskChip[o.risk],
                            )}
                          >
                            {o.risk}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className={cn("w-7 text-right font-bold tabular-nums", riskText[o.risk])}>
                              {o.score}
                            </span>
                            <span className="h-1.5 w-14 bg-[#ffb000]/10">
                              <span
                                className={cn("block h-full", riskBar[o.risk])}
                                style={{ width: `${Math.min(100, Math.max(0, o.score))}%` }}
                              />
                            </span>
                          </div>
                        </td>
                        <td className="max-w-[200px] px-3 py-2 leading-relaxed text-[#c79a3a]">{o.reason}</td>
                        <td className="max-w-[200px] px-3 py-2 leading-relaxed text-white">{o.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rows.length === 0 && (
                  <p className="p-8 text-center text-xs uppercase tracking-widest text-[#8a6a2a]">
                    No orders match. Adjust filters or search.
                  </p>
                )}
              </div>
            </Panel>
          </div>

          {/* Right rail */}
          <div className="space-y-3 xl:col-span-4">
            <Panel title="Risk Mix" tag="RM">
              <div className="space-y-3">
                {mix.map((m) => (
                  <div key={m.level}>
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className={riskText[m.level]}>{m.level}</span>
                      <span className="tabular-nums text-white">
                        {m.count} <span className="text-[#8a6a2a]">· {m.pct}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-[#ffb000]/10">
                      <div
                        className={cn("h-full transition-all duration-500", riskBar[m.level])}
                        style={{ width: `${m.pct}%`, boxShadow: "0 0 12px currentColor" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Priority Queue" tag="PQ" right={<span className="text-[9px] tracking-widest text-[#8a6a2a]">TOP 5</span>}>
              {priority.length === 0 ? (
                <p className="py-4 text-center text-[11px] uppercase tracking-widest text-[#8a6a2a]">
                  Queue empty
                </p>
              ) : (
                <ol className="space-y-2">
                  {priority.map((o, i) => (
                    <li
                      key={o.id}
                      className="flex items-start gap-3 border border-[#ffb000]/15 bg-[#ffb000]/[0.03] p-2 transition-colors hover:border-[#ffb000]/50"
                    >
                      <span className="mt-0.5 text-[10px] font-bold text-[#8a6a2a]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] font-bold text-white">{o.id}</span>
                          <span className={cn("text-[11px] font-bold tabular-nums", riskText[o.risk])}>
                            {o.score}
                          </span>
                        </div>
                        <div className="truncate text-[10px] text-[#c79a3a]">{o.product}</div>
                        <div className="mt-1 text-[10px] leading-relaxed text-[#8a6a2a]">{o.action}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Panel title="System Status" tag="SY">
              <dl className="space-y-1.5 text-[10px] font-bold uppercase tracking-widest">
                {[
                  ["Data source", "Simulated", AMBER],
                  ["Scoring model", "Preview", AMBER],
                  ["Auto-actions", "Needs approval", GREEN],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[#ffb000]/10 pb-1.5 last:border-0">
                    <dt className="text-[#8a6a2a]">{k}</dt>
                    <dd style={{ color: c }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </div>

        {/* ===== Footnote ===== */}
        <div className="flex flex-col gap-1 border-t border-[#ffb000]/20 pt-2 text-[10px] uppercase tracking-widest text-[#8a6a2a] sm:flex-row sm:items-center sm:justify-between">
          <span>Scores and outcomes are illustrative values from a fictional dataset.</span>
          <span className="flex items-center gap-1.5 text-[#00e676]">
            <ShieldCheck className="size-3.5" />
            Suggested actions require your approval
          </span>
        </div>
      </div>
    </section>
  );
}
