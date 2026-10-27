"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

type Level = "Low" | "Medium" | "High";
type SortBy = "Return rate" | "Orders";

type Pincode = {
  pin: string;
  area: string;
  orders: number;
  rto: number; // return-to-origin rate, in percent
};

type City = {
  name: string;
  state: string;
  pincodes: Pincode[];
};

/* Sample data only. Replace with real numbers in the next step. */
const CITIES: City[] = [
  {
    name: "Delhi",
    state: "Delhi",
    pincodes: [
      { pin: "110001", area: "Connaught Place", orders: 88, rto: 9 },
      { pin: "110045", area: "Uttam Nagar", orders: 112, rto: 27 },
      { pin: "110093", area: "Seelampur", orders: 96, rto: 34 },
      { pin: "110017", area: "Malviya Nagar", orders: 74, rto: 12 },
    ],
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    pincodes: [
      { pin: "400001", area: "Fort", orders: 64, rto: 8 },
      { pin: "400053", area: "Andheri West", orders: 130, rto: 14 },
      { pin: "400070", area: "Kurla", orders: 92, rto: 29 },
      { pin: "400097", area: "Malad East", orders: 85, rto: 18 },
    ],
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    pincodes: [
      { pin: "560001", area: "MG Road", orders: 70, rto: 7 },
      { pin: "560034", area: "Koramangala", orders: 118, rto: 10 },
      { pin: "560100", area: "Electronic City", orders: 90, rto: 16 },
    ],
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    pincodes: [
      { pin: "700001", area: "BBD Bagh", orders: 58, rto: 13 },
      { pin: "700091", area: "Salt Lake", orders: 80, rto: 15 },
      { pin: "700039", area: "Tangra", orders: 66, rto: 31 },
    ],
  },
  {
    name: "Lucknow",
    state: "Uttar Pradesh",
    pincodes: [
      { pin: "226001", area: "Hazratganj", orders: 52, rto: 22 },
      { pin: "226010", area: "Gomti Nagar", orders: 78, rto: 19 },
      { pin: "226022", area: "Chinhat", orders: 60, rto: 38 },
    ],
  },
  {
    name: "Patna",
    state: "Bihar",
    pincodes: [
      { pin: "800001", area: "Gandhi Maidan", orders: 48, rto: 33 },
      { pin: "800020", area: "Kankarbagh", orders: 62, rto: 36 },
      { pin: "800014", area: "Rajendra Nagar", orders: 44, rto: 28 },
    ],
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    pincodes: [
      { pin: "302001", area: "Pink City", orders: 56, rto: 17 },
      { pin: "302017", area: "Mansarovar", orders: 84, rto: 21 },
      { pin: "302021", area: "Sanganer", orders: 50, rto: 30 },
    ],
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    pincodes: [
      { pin: "500001", area: "Abids", orders: 60, rto: 11 },
      { pin: "500081", area: "Madhapur", orders: 110, rto: 9 },
      { pin: "500018", area: "Balanagar", orders: 72, rto: 24 },
    ],
  },
];

const levelOf = (rto: number): Level => (rto >= 30 ? "High" : rto >= 20 ? "Medium" : "Low");

const textColor: Record<Level, string> = {
  Low: "text-[#a3e635]",
  Medium: "text-[#ffb000]",
  High: "text-[#ff3b5c]",
};
const barColor: Record<Level, string> = {
  Low: "bg-[#a3e635]",
  Medium: "bg-[#ffb000]",
  High: "bg-[#ff3b5c]",
};
const chip: Record<Level, string> = {
  Low: "border-[#a3e635]/40 bg-[#a3e635]/10 text-[#a3e635]",
  Medium: "border-[#ffb000]/40 bg-[#ffb000]/10 text-[#ffb000]",
  High: "border-[#ff3b5c]/40 bg-[#ff3b5c]/10 text-[#ff3b5c]",
};
const action: Record<Level, string> = {
  Low: "Ship as usual",
  Medium: "Send a WhatsApp confirmation",
  High: "Call to confirm or ask for prepaid",
};

function summarise(pins: Pincode[]) {
  const orders = pins.reduce((s, p) => s + p.orders, 0);
  const returns = pins.reduce((s, p) => s + (p.orders * p.rto) / 100, 0);
  return {
    orders,
    atRisk: Math.round(returns),
    rto: orders ? Math.round((returns / orders) * 100) : 0,
  };
}

export function RegionRisk() {
  const [sortBy, setSortBy] = useState<SortBy>("Return rate");
  const [selected, setSelected] = useState<string>("Delhi");

  const cities = useMemo(() => {
    const list = CITIES.map((c) => ({ ...c, ...summarise(c.pincodes) }));
    return list.sort((a, b) => (sortBy === "Orders" ? b.orders - a.orders : b.rto - a.rto));
  }, [sortBy]);

  const current = cities.find((c) => c.name === selected) ?? cities[0];

  const pins = useMemo(
    () => [...current.pincodes].sort((a, b) => b.rto - a.rto),
    [current],
  );

  const worst = useMemo(
    () => [...cities].sort((a, b) => b.rto - a.rto)[0],
    [cities],
  );

  return (
    <section
      className="relative border border-[#34d399]/25 bg-[#050505] shadow-[inset_0_0_40px_rgba(52,211,153,0.03)]"
      aria-label="Return risk by city and pincode"
    >
      <span className="pointer-events-none absolute -left-px -top-px size-2 border-l-2 border-t-2 border-[#34d399]" />
      <span className="pointer-events-none absolute -right-px -top-px size-2 border-r-2 border-t-2 border-[#34d399]" />
      <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-[#34d399]" />
      <span className="pointer-events-none absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-[#34d399]" />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#34d399]/25 bg-[#34d399]/[0.06] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-[#34d399] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
            GEO
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#34d399]">
            Return Risk by City and Pincode
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5f9a7e]">
            Sort
          </span>
          <div className="flex border border-[#34d399]/30">
            {(["Return rate", "Orders"] as const).map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={sortBy === o}
                onClick={() => setSortBy(o)}
                className={cn(
                  "border-r border-[#34d399]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider last:border-r-0",
                  sortBy === o
                    ? "bg-[#34d399] text-black"
                    : "text-[#34d399]/80 hover:bg-[#34d399]/10",
                )}
              >
                {o}
              </button>
            ))}
          </div>
          <span className="hidden text-[9px] tracking-widest text-[#5f9a7e] sm:inline">SAMPLE</span>
        </div>
      </header>

      <div className="p-3">
        <p className="mb-3 text-[11px] leading-relaxed text-[#9fd9bb]">
          <span className="font-bold text-white">{worst.name}</span> has the highest return rate in
          this sample (<span className={cn("font-bold", textColor[levelOf(worst.rto)])}>{worst.rto}%</span>
          ). Tap a city to see its pincodes.
        </p>

        <div className="grid gap-3 lg:grid-cols-12">
          {/* City list */}
          <ul className="space-y-1.5 lg:col-span-5">
            {cities.map((c) => {
              const lvl = levelOf(c.rto);
              const active = c.name === current.name;
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(c.name)}
                    className={cn(
                      "w-full border p-2.5 text-left transition-colors",
                      active
                        ? "border-[#34d399] bg-[#34d399]/[0.08]"
                        : "border-[#34d399]/15 hover:border-[#34d399]/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                        <MapPin className="size-3 text-[#5f9a7e]" />
                        {c.name}
                      </span>
                      <span className={cn("text-xs font-bold tabular-nums", textColor[lvl])}>
                        {c.rto}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[#34d399]/10">
                      <div
                        className={cn("h-full", barColor[lvl])}
                        style={{ width: `${Math.min(100, c.rto * 2)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-[#5f9a7e]">
                      {c.orders} orders · {c.atRisk} likely returns
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Pincode table */}
          <div className="border border-[#34d399]/15 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[#34d399]/15 bg-[#34d399]/[0.04] px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                {current.name}
                <span className="ml-2 text-[#5f9a7e]">· {current.state}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#5f9a7e]">
                Riskiest first
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-[11px]">
                <caption className="sr-only">Pincodes in {current.name}, riskiest first</caption>
                <thead className="text-[10px] uppercase tracking-[0.14em] text-[#5f9a7e]">
                  <tr>
                    {["Pincode", "Area", "Orders", "Return rate", "What to do"].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pins.map((p) => {
                    const lvl = levelOf(p.rto);
                    return (
                      <tr
                        key={p.pin}
                        className="border-t border-[#34d399]/10 hover:bg-[#34d399]/[0.05]"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-bold text-white">{p.pin}</td>
                        <td className="px-3 py-2 text-[#9fd9bb]">{p.area}</td>
                        <td className="px-3 py-2 tabular-nums text-[#9fd9bb]">{p.orders}</td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-block border px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              chip[lvl],
                            )}
                          >
                            {p.rto}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#9fd9bb]">{action[lvl]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-widest text-[#5f9a7e]">
          Sample numbers for preview only. Red is 30% or more, yellow is 20% to 29%, green is below 20%.
        </p>
      </div>
    </section>
  );
}
