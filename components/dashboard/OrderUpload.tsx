"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { FileSpreadsheet, ShieldCheck, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import PaywallGate from "@/components/PaywallGate";

/* ---------- Reading the CSV file (no extra packages needed) ---------- */

function parseCSV(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

/* ---------- Guessing which column is which ---------- */

type Field = "pin" | "pay" | "status" | "city" | "value" | "product" | "orderId";

const FIELD_INFO: { key: Field; label: string; required: boolean; hint: string }[] = [
  { key: "pin", label: "Pincode", required: true, hint: "Customer delivery pincode" },
  { key: "pay", label: "Payment type", required: true, hint: "Shows COD or Prepaid" },
  { key: "status", label: "Order status", required: true, hint: "Delivered, Returned, RTO..." },
  { key: "city", label: "City", required: false, hint: "Optional" },
  { key: "value", label: "Order value", required: false, hint: "Optional, shows money lost" },
  { key: "product", label: "Product or SKU", required: false, hint: "Optional" },
  { key: "orderId", label: "Order ID", required: false, hint: "Optional" },
];

const GUESS: Record<Field, string[]> = {
  pin: ["shipping zip", "pincode", "pin code", "postal", "zip", "pin"],
  pay: ["payment method", "payment mode", "payment type", "payment", "cod"],
  status: ["financial status", "order status", "shipment status", "delivery status", "status", "outcome"],
  city: ["shipping city", "city", "district"],
  value: ["total", "order value", "invoice amount", "selling price", "amount", "value", "price"],
  product: ["lineitem name", "product name", "product", "sku", "item", "title"],
  orderId: ["name", "order id", "order_id", "order no", "orderid", "order number"],
};

function guessColumn(headers: string[], field: Field): string {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const word of GUESS[field]) {
    const i = lower.findIndex((h) => h === word);
    if (i >= 0) return headers[i];
  }
  for (const word of GUESS[field]) {
    const i = lower.findIndex((h) => h.includes(word));
    if (i >= 0) return headers[i];
  }
  return "";
}

const RETURN_WORDS = ["rto", "return", "undeliver", "refus", "not delivered", "refund", "void"];

// A cell can hold several tags like "RTO, COD". Split them so each one can be ticked.
const splitCell = (cell: string) =>
  cell
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/* ---------- The analysis ---------- */

type Mapping = Record<Field, string>;

type Group = { key: string; orders: number; returns: number };

type Result = {
  total: number;
  skipped: number;
  cod: number;
  codReturns: number;
  prepaid: number;
  prepaidReturns: number;
  lostValue: number | null;
  pins: Group[];
  zones: Group[];
  products: Group[];
};

const rate = (g: { orders: number; returns: number }) =>
  g.orders ? Math.round((g.returns / g.orders) * 100) : 0;

function analyse(
  headers: string[],
  rows: string[][],
  m: Mapping,
  returned: Set<string>,
): Result {
  const at = (name: string) => (name ? headers.indexOf(name) : -1);
  const iPin = at(m.pin);
  const iPay = at(m.pay);
  const iStatus = at(m.status);
  const iCity = at(m.city);
  const iValue = at(m.value);
  const iProduct = at(m.product);

  const pins = new Map<string, Group>();
  const zones = new Map<string, Group>();
  const products = new Map<string, Group>();

  const bump = (map: Map<string, Group>, key: string, isReturn: boolean) => {
    const g = map.get(key) ?? { key, orders: 0, returns: 0 };
    g.orders += 1;
    if (isReturn) g.returns += 1;
    map.set(key, g);
  };

  const r: Result = {
    total: 0,
    skipped: 0,
    cod: 0,
    codReturns: 0,
    prepaid: 0,
    prepaidReturns: 0,
    lostValue: iValue >= 0 ? 0 : null,
    pins: [],
    zones: [],
    products: [],
  };

  for (const row of rows) {
    const pin = (row[iPin] ?? "").match(/\d{6}/)?.[0];
    if (!pin) {
      r.skipped += 1;
      continue;
    }
    const pay = (row[iPay] ?? "").toLowerCase();
    const isCod = pay.includes("cod") || pay.includes("cash");
    const isReturn = splitCell(row[iStatus] ?? "").some((p) => returned.has(p));

    r.total += 1;
    if (isCod) {
      r.cod += 1;
      if (isReturn) r.codReturns += 1;
      bump(pins, pin, isReturn); // pincode table looks at COD orders only
    } else {
      r.prepaid += 1;
      if (isReturn) r.prepaidReturns += 1;
    }

    const city = iCity >= 0 ? (row[iCity] ?? "").trim().toUpperCase() : "";
    bump(zones, city || `PINCODE ZONE ${pin.slice(0, 3)}xxx`, isReturn);

    if (iProduct >= 0) {
      const p = (row[iProduct] ?? "").trim();
      if (p) bump(products, p.length > 40 ? `${p.slice(0, 40)}...` : p, isReturn);
    }

    if (isReturn && r.lostValue !== null) {
      const v = parseFloat((row[iValue] ?? "").replace(/[^0-9.\-]/g, ""));
      if (!Number.isNaN(v)) r.lostValue += v;
    }
  }

  const top = (map: Map<string, Group>, min: number, n: number) =>
    [...map.values()]
      .filter((g) => g.orders >= min)
      .sort((a, b) => rate(b) - rate(a) || b.orders - a.orders)
      .slice(0, n);

  r.pins = top(pins, 5, 10);
  r.zones = top(zones, 5, 8);
  r.products = top(products, 5, 8);
  return r;
}

/* ---------- Small pieces of the screen ---------- */

const levelText = (pct: number) =>
  pct >= 30 ? "text-[#ff3b5c]" : pct >= 20 ? "text-[#ffb000]" : "text-[#a3e635]";
const levelBar = (pct: number) =>
  pct >= 30 ? "bg-[#ff3b5c]" : pct >= 20 ? "bg-[#ffb000]" : "bg-[#a3e635]";

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tabular-nums", color ?? "text-white")}>{value}</div>
    </div>
  );
}

function GroupTable({ title, rows, empty }: { title: string; rows: Group[]; empty: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
        {title}
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-white/60">{empty}</p>
      ) : (
        <ul>
          {rows.map((g) => {
            const pct = rate(g);
            return (
              <li key={g.key} className="border-t border-white/10 px-4 py-3 first:border-t-0">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-white">{g.key}</span>
                  <span className={cn("font-bold tabular-nums", levelText(pct))}>{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div
                    className={cn("h-full rounded-full", levelBar(pct))}
                    style={{ width: `${Math.min(100, pct * 2)}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-white/50">
                  {g.orders} orders, {g.returns} returned
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- The page ---------- */

export function OrderUpload() {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [returned, setReturned] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const statuses = useMemo(() => {
    if (!mapping?.status) return [];
    const i = headers.indexOf(mapping.status);
    if (i < 0) return [];
    return [...new Set(rows.flatMap((r) => splitCell(r[i] ?? "")))].slice(0, 40);
  }, [headers, rows, mapping?.status]);

  function guessReturned(list: string[]) {
    return new Set(list.filter((s) => RETURN_WORDS.some((w) => s.toLowerCase().includes(w))));
  }

  function statusesFor(h: string[], r: string[][], col: string) {
    const i = h.indexOf(col);
    if (i < 0) return [];
    return [...new Set(r.flatMap((x) => splitCell(x[i] ?? "")))].slice(0, 40);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file. In Excel, choose File, then Save As, then CSV.");
      return;
    }

    const parsed = parseCSV(await file.text());
    if (parsed.length < 2) {
      setError("This file looks empty. Please check it and try again.");
      return;
    }

    const h = parsed[0].map((x) => x.trim());
    const body = parsed.slice(1);
    const m = {} as Mapping;
    for (const f of FIELD_INFO) m[f.key] = guessColumn(h, f.key);

    setFileName(file.name);
    setHeaders(h);
    setRows(body);
    setMapping(m);
    setReturned(guessReturned(statusesFor(h, body, m.status)));
  }

  function changeColumn(field: Field, value: string) {
    if (!mapping) return;
    const next = { ...mapping, [field]: value };
    setMapping(next);
    setResult(null);
    if (field === "status") setReturned(guessReturned(statusesFor(headers, rows, value)));
  }

  function toggleStatus(s: string) {
    setResult(null);
    setReturned((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function run() {
    if (!mapping) return;
    if (!mapping.pin || !mapping.pay || !mapping.status) {
      setError("Please choose the Pincode, Payment type and Order status columns.");
      return;
    }
    if (returned.size === 0) {
      setError("Please tick at least one status that means the order came back.");
      return;
    }
    setError("");
    setResult(analyse(headers, rows, mapping, returned));
  }

  const select =
    "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#34d399]";

  return (
    <main className="min-h-screen px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            See your real return risk
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            Export your orders from Shopify as a CSV file and upload it here. Your file is read inside
            your own browser. It is not sent anywhere.
          </p>
        </div>

        {/* Step 1 */}
        <Box title="1. Choose your file">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/25 bg-white/[0.02] px-4 py-10 text-center transition-colors hover:border-[#34d399]/60 hover:bg-white/[0.05]">
            <Upload className="size-6 text-[#34d399]" />
            <span className="text-sm font-semibold text-white">
              {fileName ? "Choose a different file" : "Tap to choose a CSV file"}
            </span>
            {fileName && (
              <span className="flex items-center gap-1.5 text-sm text-[#34d399]">
                <FileSpreadsheet className="size-4" />
                {fileName}, {rows.length} rows
              </span>
            )}
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" />
          </label>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            In Shopify: open <span className="font-semibold text-white">Orders</span>, press{" "}
            <span className="font-semibold text-white">Export</span>, choose your dates, pick the CSV
            option and press Export orders.
          </p>
        </Box>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 px-4 py-3 text-sm text-[#ff8097]"
          >
            {error}
          </p>
        )}

        {/* Step 2 */}
        {mapping && (
          <Box title="2. Check the columns">
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              We guessed which column is which. If a guess is wrong, choose the right one.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIELD_INFO.map((f) => (
                <div key={f.key}>
                  <label
                    htmlFor={`col-${f.key}`}
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    {f.label} {f.required && <span className="text-[#ff3b5c]">*</span>}
                  </label>
                  <select
                    id={`col-${f.key}`}
                    value={mapping[f.key]}
                    onChange={(e) => changeColumn(f.key, e.target.value)}
                    className={select}
                  >
                    <option value="">{f.required ? "Choose a column" : "Not needed"}</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 text-xs text-white/50">{f.hint}</div>
                </div>
              ))}
            </div>

            {statuses.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium text-white">
                  Which statuses mean the order came back?
                </div>
                <p className="mb-3 text-sm leading-relaxed text-white/70">
                  Shopify does not mark RTO by itself. If you add an RTO tag to orders that came
                  back, choose the Tags column above and tick RTO here.
                </p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => {
                    const on = returned.has(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleStatus(s)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                          on
                            ? "border-[#ff3b5c] bg-[#ff3b5c]/15 text-[#ff8097]"
                            : "border-white/20 text-white/80 hover:border-[#34d399]",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={run}
              className="mt-6 rounded-lg bg-[#34d399] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#6ee7b7]"
            >
              Show my return risk
            </button>
          </Box>
        )}

        {/* Results */}
        {result && (
          <>
            {/* FREE: summary numbers */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Orders read" value={String(result.total)} />
              <Stat
                label="COD orders"
                value={result.total ? `${Math.round((result.cod / result.total) * 100)}%` : "0%"}
              />
              <Stat
                label="COD return rate"
                value={`${rate({ orders: result.cod, returns: result.codReturns })}%`}
                color={levelText(rate({ orders: result.cod, returns: result.codReturns }))}
              />
              <Stat
                label="Prepaid return rate"
                value={`${rate({ orders: result.prepaid, returns: result.prepaidReturns })}%`}
                color={levelText(rate({ orders: result.prepaid, returns: result.prepaidReturns }))}
              />
            </div>

            {result.lostValue !== null && (
              <Stat
                label="Value of returned orders"
                value={`₹${Math.round(result.lostValue).toLocaleString("en-IN")}`}
                color="text-[#ffb000]"
              />
            )}

            {result.skipped > 0 && (
              <p className="text-sm text-[#ffb000]">
                {result.skipped} rows were skipped because they had no 6-digit pincode. Extra product lines of the same Shopify order are skipped on purpose, so each order is counted once.
              </p>
            )}

            {/* ===== LOCK START: riskiest pincodes, cities and products (Pro) ===== */}
            <PaywallGate
  title="Riskiest pincodes, cities and products"
  description="See which pincodes, cities and products send the most orders back, so you know where to act."
>
              <div className="grid gap-4 lg:grid-cols-2">
                <GroupTable
                  title="Riskiest pincodes (COD orders)"
                  rows={result.pins}
                  empty="Not enough orders yet. A pincode needs at least 5 COD orders to be shown."
                />
                <GroupTable
                  title="Riskiest cities or zones"
                  rows={result.zones}
                  empty="Not enough orders yet. At least 5 orders are needed."
                />
              </div>

              {result.products.length > 0 && (
                <div className="mt-4">
                  <GroupTable title="Products with the most returns" rows={result.products} empty="" />
                </div>
              )}
            </PaywallGate>
            {/* ===== LOCK END ===== */}

            <p className="flex items-start gap-2 text-sm leading-relaxed text-white/60">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#34d399]" />
              Small groups can mislead. Only pincodes, cities and products with at least 5 orders are
              shown. Red is 30% or more, yellow is 20% to 29%, green is below 20%.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
