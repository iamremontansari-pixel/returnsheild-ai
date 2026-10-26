"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sampleOrders, weeklyOrders, type PaymentMethod, type RiskLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PaymentFilter = "All" | PaymentMethod;
type RiskFilter = "All" | RiskLevel;

const riskStyle: Record<RiskLevel, string> = {
  Low: "bg-emerald-400/15 text-emerald-300",
  Medium: "bg-amber-400/15 text-amber-300",
  High: "bg-rose-400/15 text-rose-300",
};

function Filter<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="text-sm text-soft">{label}</span>
      <div className="flex rounded-lg bg-navy p-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn("min-h-9 rounded-md px-3 text-sm font-medium", value === o ? "bg-brand text-white" : "text-soft hover:text-white")}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const [payment, setPayment] = useState<PaymentFilter>("All");
  const [risk, setRisk] = useState<RiskFilter>("All");

  const rows = useMemo(
    () => sampleOrders.filter((o) => (payment === "All" || o.payment === payment) && (risk === "All" || o.risk === risk)),
    [payment, risk],
  );

  const stats = useMemo(() => {
    const flagged = rows.filter((o) => o.risk !== "Low").length;
    const rto = rows.filter((o) => o.rto).length;
    const exposure = rows.filter((o) => o.risk === "High").reduce((s, o) => s + o.value, 0);
    return { total: rows.length, flagged, rtoRate: rows.length ? Math.round((rto / rows.length) * 100) : 0, exposure };
  }, [rows]);

  const distribution = (["Low", "Medium", "High"] as const).map((level) => ({
    level,
    COD: rows.filter((o) => o.risk === level && o.payment === "COD").length,
    Prepaid: rows.filter((o) => o.risk === level && o.payment === "Prepaid").length,
  }));

  const kpis = [
    { label: "Orders shown", value: stats.total.toString(), note: "Sample set" },
    { label: "Flagged for review", value: stats.flagged.toString(), note: "Model estimate" },
    { label: "Historical RTO rate", value: `${stats.rtoRate}%`, note: "Sample outcomes" },
    { label: "Estimated exposure (high risk)", value: `Rs ${stats.exposure.toLocaleString("en-IN")}`, note: "Estimate, not verified" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-2 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Dashboard preview</h2>
        <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-soft">Sample data — not real customers.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <Filter label="Payment" value={payment} options={["All", "COD", "Prepaid"] as const} onChange={setPayment} />
        <Filter label="Risk" value={risk} options={["All", "Low", "Medium", "High"] as const} onChange={setRisk} />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-navy p-4">
            <dt className="text-sm text-soft">{k.label}</dt>
            <dd className="mt-1 text-2xl font-extrabold">{k.value}</dd>
            <p className="mt-1 text-xs text-soft">{k.note}</p>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-navy p-4">
          <h3 className="mb-3 text-sm font-semibold">Risk distribution by payment method</h3>
          <div className="h-56" role="img" aria-label="Bar chart of order counts by risk level and payment method">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid stroke="#1b2a5e" vertical={false} />
                <XAxis dataKey="level" stroke="#b4bfd8" />
                <YAxis stroke="#b4bfd8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0a1330", border: "1px solid #1b2a5e" }} />
                <Legend />
                <Bar dataKey="COD" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Prepaid" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-navy p-4">
          <h3 className="mb-3 text-sm font-semibold">Orders and flagged orders by week (sample)</h3>
          <div className="h-56" role="img" aria-label="Line chart of weekly orders and flagged orders">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyOrders}>
                <CartesianGrid stroke="#1b2a5e" vertical={false} />
                <XAxis dataKey="week" stroke="#b4bfd8" />
                <YAxis stroke="#b4bfd8" />
                <Tooltip contentStyle={{ background: "#0a1330", border: "1px solid #1b2a5e" }} />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="flagged" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-navy">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Sample orders matching the selected filters</caption>
          <thead className="text-soft">
            <tr>
              {["Order", "Product", "Payment", "Risk", "Reason", "Suggested action"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 6).map((o) => (
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-4 py-3">{o.id}</td>
                <td className="px-4 py-3">{o.product}</td>
                <td className="px-4 py-3">{o.payment}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", riskStyle[o.risk])}>
                    {o.risk} ({o.score})
                  </span>
                </td>
                <td className="px-4 py-3">{o.reason}</td>
                <td className="px-4 py-3">{o.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-soft">No sample orders match these filters. Try another combination.</p>}
      </div>
      <p className="mt-3 text-xs text-soft">Scores are illustrative values from a fictional dataset. Suggested actions need your approval.</p>
    </div>
  );
}
